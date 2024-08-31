// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { extractBech32StakeAddress } from "../../cardano/util";
import { getAssetsFromChain, getHoldersFromChain } from "../../cardano/holders";
import { getAsset } from "../../db/asset";
import { getBoost } from "./boost";
import { getStake, getStakes } from "../../db/stake";
import { copyHoldersAndSnap, createHolder } from "../../db/holder";
import { Epoch, Project } from "@prisma/client";
import { PolicyConfig } from "../../type/policy";
import { createSnapshot, getMostRecentPolicySnapshot, getMostRecentSnapshot } from "../../db/snapshot";
import { SnapshotType } from "../../type/enum";
import { dbCacheExecute } from "../../db/cache";

export async function snapshot(epoch: Epoch, policyConfig: PolicyConfig) {
    const snapshot = await getMostRecentSnapshot(epoch, policyConfig.policyId, SnapshotType.EPOCH_HOLDER);
    if (!!snapshot) {
        console.log(`Policy id already snapped for ${epoch.id}, ${policyConfig.policyId}. No snap will be taken.`);
        return;
    }

    const mostRecentPolicySnapshot = await getMostRecentPolicySnapshot(policyConfig.policyId, SnapshotType.EPOCH_HOLDER);
    if (!!mostRecentPolicySnapshot && mostRecentPolicySnapshot.completedAt >= new Date(Date.now() - 60 * 60 * 1000)) {
        await copyHoldersAndSnap(mostRecentPolicySnapshot.epochId, mostRecentPolicySnapshot.completedAt, epoch.id, policyConfig.policyId);
        return;
    }

    const chainHolders = await getHoldersFromChain(policyConfig.policyId);

    const notStakedAddresses: {[id: string]: boolean} = {};
    const notStakedStakeAddresses: {[id: string]: boolean} = {};
    for (const holder of chainHolders) {
        if (notStakedAddresses[holder.payment_address]) {
            console.log(`Could not extract stake address from ${holder.payment_address}. No snap will be taken.`);
            continue;
        }

        const stakeAddress = extractBech32StakeAddress(holder.payment_address);
        if (!stakeAddress) {
            notStakedAddresses[holder.payment_address] = true;
            console.log(`Could not extract stake address from ${holder.payment_address}. No snap will be taken.`);
            continue;
        }

        if (notStakedStakeAddresses[stakeAddress]) {
            console.log(`Could not find stake for ${stakeAddress}. No snap will be taken.`);
            continue;
        }
        
        const stake = await getStake(stakeAddress);
        if (!stake) {
            notStakedStakeAddresses[stakeAddress] = true;
            console.log(`Could not find stake for ${stakeAddress}. No snap will be taken.`);
            continue;
        }

        const asset = await getAsset(policyConfig.policyId, holder.asset_name);
        const boost = policyConfig.providesBoost  
            ? await getBoost(asset, policyConfig.policyId, holder)
            : 0;
        await createHolder(stake, epoch, asset, parseInt(holder.quantity), boost);
    }
    await createSnapshot(epoch, policyConfig.policyId, SnapshotType.EPOCH_HOLDER, new Date());
}

export async function snapshotPolicies(erc: any, project: Project, epoch: Epoch) : Promise<string[]> {
    const boostPolicies: string[] = [];

    for (const policyConfig of erc.policyConfigs) {
        if (!policyConfig.isPolicyEnabled) {
            console.log(`Policy ${policyConfig.policyId} is not enabled for project ${project.name}.`);
            continue;
        }

        await snapshot(epoch, policyConfig);
        if (policyConfig.providesBoost) {
            boostPolicies.push(policyConfig.policyId);
        }
    }

    return Promise.resolve(boostPolicies);
}

export async function getUserCardanoAssets(userId: string) {
    return await dbCacheExecute(
        `getUserAssets-${userId}`,
        async () => {
            const stakes = await getStakes(userId);
            const rewardAddresses = stakes.map((s) => s.rewardAddress);
            const cardanoAssets = await getAssetsFromChain(rewardAddresses);
            return cardanoAssets;
        });
}