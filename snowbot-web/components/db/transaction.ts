// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Project, ProjectWallet, RewardAccount } from "@prisma/client";
import { prisma } from "./prisma";
import { WithdrawalStatus } from "../type/enum";
import { randomUUID } from "crypto";
import { projects } from "../metadata/project";

export async function startWithdrawal(rewardAccount: RewardAccount) {
    const externalId = randomUUID();
    
    await prisma.$executeRaw`
        insert into "Withdrawal" ("rewardAccountId", "status", "statusTime", "externalId")
        select ${rewardAccount.id}, ${WithdrawalStatus.PENDING}, ${new Date()}, ${externalId}
        where not exists (
            select id from "Withdrawal" where "rewardAccountId"=${rewardAccount.id} and status!='pending' and status!='failed'
        )
        and not exists (
            select count(*) as "count" from "Withdrawal" where "projectId"=${projects[0].id} and status!='pending' and status!='failed' having count(*) >= ${projects[0].epochRewardsConfig.maxConcurrentWithdrawals} 
        )`;
    
    const withdrawal = await prisma.withdrawal.findFirst({
        where: {
            rewardAccountId: rewardAccount.id,
            status: WithdrawalStatus.PENDING,
            externalId: externalId,
        },
    });
    return withdrawal;
}

export async function countIncompleteProjectWithdrawals(project: Project) {
    return await prisma.withdrawal.count({
        where: {
            projectId: project.id,
            status: {
                notIn: [WithdrawalStatus.FAILED, WithdrawalStatus.SUCCESS],
            },
        },
    });
}

export async function getWithdrawalAmountsInLastDay(policyIds: string[]) : Promise<{policyId: string, totalAmount: number}[]> {
    return await prisma.$executeRaw`
        select "policyId", sum(wa.amount) as totalAmount
        from "Withdrawal" w
        inner join "WithdrawalAmount" wa on w.id = wa."withdrawalId"
        where w."projectId" = ${projects[0].id}
            and wa."policyId" in (${policyIds.join(",")})
        group by "policyId"`
}

export async function createProjectWallet(projectWallet: ProjectWallet){
    return await prisma.projectWallet.create({
        data: projectWallet
    });
}


export async function getProjectWallet(projectId: string, policyId: string) {
    return await prisma.projectWallet.findUniqueOrThrow({
        where: {
            projectIdPolicyId: {
                projectId: projectId,
                policyId: policyId
            }
        }
    });
}