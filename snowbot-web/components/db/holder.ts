// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Asset, Epoch, Holder, Stake } from "@prisma/client";
import { prisma } from "./prisma";
import { dbCacheExecute } from "./cache";
import { SnapshotType } from "../type/enum";

export async function createHolder(stake: Stake, epoch: Epoch, asset: Asset, quantity: number, boost: number) : Promise<Holder> {
    return await prisma.holder.upsert({
        where: {
            epochIdAssetId: {
                epochId: epoch.id,
                assetId: asset.id
            }
        },
        update: {},
        create: {
            userId: stake.userId,
            epochId: epoch.id,
            assetId: asset.id,
            policyId: asset.policyId,
            quantity: quantity,
            boost: boost,
        }
    });
}

export async function getTotalBoost(epoch: Epoch, holder: Holder, policyIdsWithBoost: string[]) : Promise<number> {
    return await dbCacheExecute(
        `getTotalBoost-${epoch.id}-${holder.userId}-${policyIdsWithBoost.join("-")}`, 
        async () => { 
            const aggregate =    await prisma.holder.aggregate({
                where: {
                    userId: holder.userId,
                    epochId: epoch.id,
                    policyId: {
                        in: policyIdsWithBoost
                    }
                },
                _sum: {
                    boost: true
                }
            });
            return Promise.resolve(aggregate._sum.boost ?? 0);
        }           
    );
}

export async function getHolders(epoch: Epoch, policyId: string) {
    return await dbCacheExecute(
        `getHolders-${epoch.id}-${policyId}`,
        async () => await prisma.holder.findMany({
            where: {
                asset: { policyId: policyId },
                epochId: epoch.id
            },
            include: {
                asset: true
            }
    }));
}

export async function getHolder(epoch: Epoch, asset: Asset) : Promise<Holder | undefined> {
    return await dbCacheExecute(
        `getHolder-${epoch.id}-${asset.id}`,
        async () => await prisma.holder.findUnique({
            where: {
                epochIdAssetId: {
                    epochId: epoch.id,
                    assetId: asset.id
                }
            },
            include: {
                asset: true
            }
    }));
}

export async function copyHoldersAndSnap(sourceEpochId: number, sourceCompletedAt: Date, targetEpochId: number, policyId: string) {
    await prisma.$transaction([
        prisma.$executeRaw`
                INSERT INTO "Holder" ("userId", "epochId", "assetId", "policyId", "quantity", "boost")
                SELECT "userId", ${targetEpochId}, "assetId", "policyId", "quantity", "boost"
                FROM "Holder"
                WHERE "epochId" = ${sourceEpochId}
                AND "policyId" = ${policyId};`,
        prisma.$executeRaw`
                INSERT INTO "Snapshot" ("epochId", "policyId", "type", "completedAt")
                VALUES (${targetEpochId}, ${policyId}, ${SnapshotType.EPOCH_HOLDER}, ${sourceCompletedAt});`
    ]);
}   
