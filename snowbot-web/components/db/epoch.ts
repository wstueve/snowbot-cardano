// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Epoch } from "@prisma/client";
import { EpochStatus } from "../type/enum";
import { convertUnixTimestamp } from "../util/dateUtil";
import { prisma } from "./prisma";
import { EpochTotal } from "../type/epoch";

export async function getMostRecentEpoch(projectId: string): Promise<Epoch> {
    return await prisma.epoch.findFirstOrThrow({
        where: {
            projectId: projectId,
        },
        orderBy: { 
            id: "desc"
        }
    });
}

export async function getEpochs(projectId: string): Promise<Epoch[]> {
    return await prisma.epoch.findMany({
        where: {
            projectId: projectId,
        },
        orderBy: { 
            id: "desc"
        }
    });
}

export async function getEpoch(projectId: string, epochId: number): Promise<Epoch> {
    const epoch = await prisma.epoch.findUniqueOrThrow({
        where: {
            id: epochId
        }
    });

    if (epoch.projectId != projectId) {
        throw new Error(`Epoch ${epochId} does not belong to project ${projectId}`);
    }

    return epoch;
}

export async function saveEpoch(epoch: Epoch) {
    return await prisma.epoch.upsert({
        where: {
            epochNumberProjectId: {
                epochNumber: epoch.epochNumber,
                projectId: epoch.projectId
            }
        },
        update: {
            status: epoch.status,
            statusTime: epoch.statusTime
        },
        create: {
            epochNumber: epoch.epochNumber,
            startTime: epoch.startTime,
            endTime: epoch.endTime,
            projectId: epoch.projectId,
            status: epoch.status,
            statusTime: epoch.statusTime,
            metadata: epoch,   
        }
    });
}

export async function createEpoch(projectId: string, cardanoEpoch: any, timestamp: Date, status: EpochStatus): Promise<Epoch> {
    return await prisma.epoch.upsert({
        where: {
            epochNumberProjectId: {
                epochNumber: cardanoEpoch.epoch_no,
                projectId: projectId
            }
        },
        update: { },
        create: {
            epochNumber: cardanoEpoch.epoch_no,
            startTime: convertUnixTimestamp(cardanoEpoch.start_time),
            endTime: convertUnixTimestamp(cardanoEpoch.end_time),
            projectId: projectId,
            status: status,
            statusTime: timestamp,
            metadata: cardanoEpoch,   
        }
    });}

export async function getEpochTotals(projectId: string) : Promise<EpochTotal[]> {
    return await prisma.$queryRaw`Select
            E.id,
            RA."accountType",
            RL."policyId",
            COALESCE(SUM(RL.amount), 0.0) as totalAmount,
            COALESCE(SUM(RL.boost), 0.0) as totalBoost
        From public."Epoch" E
        Left Join public."RewardLedger" RL On E.id = RL."epochId"
        Left Join public."RewardAccount" RA on rl."rewardAccountId" = ra.id
        Where E."projectId" = ${projectId}
        GROUP BY E."id", RA."accountType", RL."policyId"
        ORDER by id, "accountType", "policyId"`
}

export async function getEpochUserTotals(projectId: string, userId: string, epochId: number) {
    return await prisma.$queryRaw`SELECT
            RL."policyId",
            COALESCE(SUM(RL.amount), 0.0) as totalAmount,
            COALESCE(SUM(RL.boost), 0.0) as totalBoost,
            COUNT(RL."id") as rewardCount
        FROM public."Epoch" E
        INNER JOIN public."RewardLedger" RL On E.id = RL."epochId"
        INNER JOIN public."RewardAccount" RA on RL."rewardAccountId" = RA.id
        WHERE E."projectId" = ${projectId}
            AND RA."foreignId" = ${userId}
            AND E.id = ${epochId}
            AND RA."accountType" = 'user'
        GROUP BY RL."policyId"`
}