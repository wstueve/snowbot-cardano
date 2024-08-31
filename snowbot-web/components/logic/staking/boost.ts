// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { hexToString } from "../../util/stringUtil";
import { projects } from "../../metadata/project";
import { dbCacheExecute } from "../../db/cache";
import { getAsset } from "../../db/asset";
import { getUserCardanoAssets } from "./holder";

export function getBoostOnAsset(asset:any) {
    try {
        const metadata: any = asset.metadata?.valueOf() as any;
        return parseInt(metadata['721'][asset.policyId][hexToString(asset.assetName) ?? ""].Boost);
    }
    catch (e) {
        console.log(`Could not get boost for cardanoAsset: ${JSON.stringify(asset)}.`);
        return 0;
    }
}

export async function getBoost(asset:any, policyId: string, holder: any) {
    try {
        const metadata = asset.metadata?.valueOf() as any;
        return parseInt(metadata['721'][policyId][hexToString(holder.asset_name) ?? ""].Boost);
    }
    catch (e) {
        console.log(`Could not get boost for ${holder}, asset: ${asset}, policy: ${policyId}.`);
        return 0;
    }
}

export function getBoostPolicies() : string[] {
    let policyIdsWithBoost: string[] = [];
    for (const config of projects[0].epochRewardsConfig.policyConfigs) {
        if (config.isPolicyEnabled && config.providesBoost) {
            policyIdsWithBoost.push(config.policyId);
        }          
    }
    return policyIdsWithBoost;
}

export async function getUserBoost(userId: string) : Promise<number> {
    return await dbCacheExecute(
        `getUserBoost-${userId}`,
        async () => {
            const policyIdsWithBoost = getBoostPolicies();
            const cardanoAssets = await getUserCardanoAssets(userId)
            let totalBoost = 0;
            for (const cardanoAsset of cardanoAssets) {
                if (policyIdsWithBoost.includes(cardanoAsset.policy_id)) {
                    const asset = await getAsset(cardanoAsset.policy_id, cardanoAsset.asset_name);
                    const boost = getBoostOnAsset(asset);
                    totalBoost += boost;
                }   
            }
            return Promise.resolve(totalBoost);
        });
}