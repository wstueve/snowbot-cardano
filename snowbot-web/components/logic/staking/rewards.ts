// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Project } from "@prisma/client";
import { createNextEpoch, getEpochForProcessing, setEpochRewarded } from "./epoch";
import { getUserCardanoAssets, snapshotPolicies } from "./holder";
import { calculateReward, distributePolicyRewards } from "./policy";
import { getUserBoost } from "./boost";
import { projects } from "../../metadata/project";
import { getProjectWithAllPolicies } from "../../db/project";
import { getAssetsWithBalances } from "../../db/asset";
import { dbCacheExecute } from "../../db/cache";

export async function distributeEpochRewards(project: Project, timestamp: Date) {
    
    let epoch = await getEpochForProcessing(project, timestamp);
    if (!epoch) return;

    if (!project.epochRewardsConfig) {
        console.log(`Epoch rewards config is not set for project ${project.name}.`);
        return undefined;
    }

    const boostPolicies = await snapshotPolicies(project.epochRewardsConfig, project, epoch);
    await distributePolicyRewards(epoch, project.epochRewardsConfig, boostPolicies);
    await setEpochRewarded(epoch, timestamp);
    await createNextEpoch(epoch.epochNumber + 1, project.id, timestamp);
}

export async function getAccumulatingRewards(userId: string) {
    return await dbCacheExecute(
        `getAccumulatingRewards-${userId}`, 
        async () => {
            const cardanoAssets = await getUserCardanoAssets(userId);
            if (cardanoAssets.length  <= 0) return [];

            const boost = await getUserBoost(userId);

            const project = await getProjectWithAllPolicies(projects[0].name);

            //reduce the distribution rewards into a list of policies and their rewards
            const policyRewards: {[policyId: string]: {  policyId: string, amount: number, perEveryDays:number }[]} = {};
            for (const pdp of project.distributionPolicies) {
                for (const pdr of pdp.projectDistributionRewards) {
                    if (!policyRewards[pdr.policy.policyId]) {
                        policyRewards[pdr.policy.policyId] = [];
                    }
                    policyRewards[pdr.policy.policyId].push({ policyId: pdp.policy.policyId, amount: Number(pdr.amount), perEveryDays: pdr.perEveryDays });
                }
            }

            const assetsWithBalances = await getAssetsWithBalances(cardanoAssets) as any[];

            const assets = [];
            for (const ab of assetsWithBalances) {
                const rewards = policyRewards[ab.policyId];
                if (!rewards || rewards.length <= 0) continue; //asset does not get rewards

                let asset = {...ab, rewards: []};
                for (const reward of rewards) {
                    const amount = calculateReward(reward.amount, reward.perEveryDays, 5, 1, boost);
                    asset.rewards.push({ policyId: reward.policyId, amount: amount });
                }
                
                assets.push(asset);
            }

            return assets;
    });
}

