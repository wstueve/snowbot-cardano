// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { createOrGetBalance } from "../../db/balance";
import { getOrCreateRewardAccount } from "../../db/rewardAccount";
import { projects } from "../../metadata/project";
import { RewardAccountType } from "../../type/enum";
import { getProjectWithDistributionPolicies } from "../../db/project";
import { dbCacheExecute } from "../../db/cache";

export async function getBalancesForUser(userId: string): Promise<any[]> {
    return await dbCacheExecute(`getBalancesForUser-${userId}`, async () => {
        const rewardAccount = await getOrCreateRewardAccount(RewardAccountType.USER, userId);
        const project = await getProjectWithDistributionPolicies(projects[0].name);
    
        let balances = [];
        for (const policy of project.distributionPolicies.map((p) => p.policy)) {
            const balance = await createOrGetBalance(policy.policyId, policy.decimals ?? 0, rewardAccount);
            balances.push({ ...{ ticker: policy.ticker }, ...balance });
        }
        return balances;
    });
}