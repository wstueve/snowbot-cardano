// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Asset, Epoch, Holder } from "@prisma/client";
import { PolicyConfig, Reward, RewardConfig } from "../../type/policy";
import { getHolder, getTotalBoost } from "../../db/holder";
import { getAssets } from "../../db/asset";
import { RewardAccountType } from "../../type/enum";
import { getOrCreateRewardAccount } from "../../db/rewardAccount";
import { createOrGetBalance } from "../../db/balance";
import { createLedgerAndUpdateBalance, createLedgersAndTransferBalance } from "../../db/rewardLedger";
import { createEpochRewardsDistribution, getEpochRewardsDistribution } from "../../db/distribution";
import { userCapturedRewardEvent } from "../../events/balance";

export async function distributePolicy(epochRewardsConfig: any, epoch: Epoch, policyConfig: PolicyConfig, boostPolicies: string[]) {
    const assets = await getAssets(policyConfig.policyId);

    for (const asset of assets) {
        let totalBoost = 0;
        const holder = await getHolder(epoch, asset);
        if (!!holder) {
            totalBoost = await getTotalBoost(epoch, holder, boostPolicies);
        }

        const assetRewards = await calculateRewards(epochRewardsConfig, policyConfig, asset, holder, totalBoost);
        const rewardAccount = await getOrCreateRewardAccount(
            !!holder ? RewardAccountType.USER : RewardAccountType.ASSET,
            !!holder ? holder.userId : asset.id.toString());

        for (const reward of assetRewards) {
            const balance = await createOrGetBalance(reward.policyId, reward.decimals, rewardAccount);
            await createLedgerAndUpdateBalance(rewardAccount, reward, balance, epoch);
            
            //check if the asset has a balance and transfer it to this account if it is user account
            if (rewardAccount.accountType === RewardAccountType.USER) {
                const assetRewardAccount = await getOrCreateRewardAccount(RewardAccountType.ASSET, reward.assetId.toString());
                const assetBalance = await createOrGetBalance(reward.policyId, reward.decimals, assetRewardAccount);
                if (assetBalance.balance > 0) {
                    await createLedgersAndTransferBalance(balance, assetBalance, asset, epoch);
                    await userCapturedRewardEvent(rewardAccount.foreignId);
                }
            }
        }
    }
}

export async function calculateRewards(epochRewardsConfig: any, policyConfig: PolicyConfig, asset: Asset, holder: Holder | undefined, totalBoost: number) : Promise<Array<Reward>> {
    return policyConfig.rewards.map((rewardConfig: RewardConfig) => { 
        return {
            policyId: rewardConfig.policyId,
            assetId: asset.id,
            assetName: asset.name,
            amount: getRewardAmount(epochRewardsConfig, rewardConfig, holder?.quantity ?? 1, totalBoost),
            decimals: rewardConfig.decimals,
            boost: totalBoost,
        }
    });
}

function getRewardAmount(epochRewardsConfig: any, rewardConfig: RewardConfig, quantity: number, totalBoost: number): number {
    return calculateReward(rewardConfig.amount, rewardConfig.perEveryDays, epochRewardsConfig.epochLengthDays, quantity, totalBoost);
}

export function calculateReward(amount: number, perEveryDays: number, epochLengthDays: number, quantity: number, totalBoost: number): number {
    const assetReward = amount * quantity;
    const boostMultiplier = (1 + (totalBoost / 100));
    const numDaysMultiplier = (epochLengthDays / perEveryDays);
    const reward = assetReward * boostMultiplier * numDaysMultiplier;

    return Math.round(reward);
}

export async function distributePolicyRewards(epoch: Epoch, epochRewardsConfig: any, boostPolicies: string[]) {
    for (const policyConfig of epochRewardsConfig.policyConfigs) {
        if (policyConfig.isPolicyEnabled) {
            const rewardsDistribution = await getEpochRewardsDistribution(epoch, policyConfig.policyId);
            if (!!rewardsDistribution) {
                console.log(`Policy ${policyConfig.policyId} already distributed for epoch ${epoch.id}.`);
                continue;
            }
            await distributePolicy(epochRewardsConfig, epoch, policyConfig, boostPolicies);
            await createEpochRewardsDistribution(epoch, policyConfig.policyId);
        }
    }
}
