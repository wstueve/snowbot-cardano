// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Asset, Balance, Epoch, RewardAccount } from "@prisma/client";
import { Reward } from "../type/policy";
import { prisma } from "./prisma";
import { LedgerTransactionType } from "../type/enum";
import { formatBigIntAsDecimal, formatIntegerAsDecimal } from "../util/stringUtil";

export async function createLedgerAndUpdateBalance(rewardAccount: RewardAccount, reward: Reward, balance: Balance, epoch: Epoch) {
    const ledger = await prisma.rewardLedger.findUnique({
        where: {
            epochIdAssetIdTransactionType: {
                assetId: reward.assetId,
                epochId: epoch.id,
                transactionType: LedgerTransactionType.EPOCH_ASSET_REWARD,
            }
        }
    });
    if (!!ledger) {
        console.log(`Ledger already exists for ${reward.assetId} in epoch ${epoch.epochNumber}. Balances already updated by ${ledger.amount}`);
        return;
    }

    const asset = await prisma.asset.findUnique({
        where: {
            id: reward.assetId
        }
    });

    return await prisma.$transaction([
        
        prisma.$executeRaw`
        UPDATE public."Balance"
        SET "balance" = "balance" + ${Math.round(reward.amount)}
        WHERE "id" = ${balance.id};`, 
        
        prisma.rewardLedger.create({
            data: {
                epochId: epoch.id,
                transactionType: LedgerTransactionType.EPOCH_ASSET_REWARD,
                transactionDescription: `Reward for ${reward.assetName} in epoch ${epoch.epochNumber} for amount ${formatIntegerAsDecimal(reward.amount, reward.decimals)}`,
                assetId: reward.assetId,
                amount: reward.amount,
                decimals: reward.decimals,
                rewardAccountId: rewardAccount.id,
                policyId: reward.policyId,
                boost: reward.boost,
            }
        })]);
}

export async function createLedgersAndTransferBalance(userBalance: Balance, assetBalance: Balance, asset: Asset, epoch: Epoch) {
    const ledger = await prisma.rewardLedger.findUnique({
        where: {
            epochIdAssetIdTransactionType: {
                assetId: asset.id,
                epochId: epoch.id,
                transactionType: LedgerTransactionType.EPOCH_TRANSFER_TO_USER,
            }
        }
    });
    if (!!ledger) {
        console.log(`Ledger already exists for ${asset.id} in epoch ${epoch.epochNumber}. Balances already transferred by ${ledger.amount}`);
        throw new Error(`Ledger already exists for ${asset.id} in epoch ${epoch.epochNumber}. Balances already transferred by ${ledger.amount}`);
    }

    return await prisma.$transaction([
        
        prisma.$executeRaw`
        UPDATE public."Balance"
        SET "balance" = "balance" + ${assetBalance.balance}
        WHERE "id" = ${userBalance.id}
        AND "balance" = ${userBalance.balance};`,

        prisma.$executeRaw`
        UPDATE public."Balance"
        SET "balance" = "balance" - ${assetBalance.balance}
        WHERE "id" = ${assetBalance.id}
        AND "balance" = ${assetBalance.balance};`, 
        
        prisma.rewardLedger.create({
            data: {
                epochId: epoch.id,
                transactionType: LedgerTransactionType.EPOCH_TRANSFER_FROM_ASSET,
                transactionDescription: `Transfer accumulated rewards for ${asset.name} in epoch ${epoch.epochNumber} for amount ${formatBigIntAsDecimal(assetBalance.balance, assetBalance.decimals)}`,
                assetId: asset.id,
                amount: assetBalance.balance,
                decimals: assetBalance.decimals,
                rewardAccountId: userBalance.rewardAccountId,
                policyId: userBalance.policyId,
                boost: 0,
            }
        }),

        prisma.rewardLedger.create({
            data: {
                epochId: epoch.id,
                transactionType: LedgerTransactionType.EPOCH_TRANSFER_TO_USER,
                transactionDescription: `Transfer accumulated rewards for ${asset.name} in epoch ${epoch.epochNumber} for amount -${formatBigIntAsDecimal(assetBalance.balance, assetBalance.decimals)}`,
                assetId: asset.id,
                amount: -assetBalance.balance,
                decimals: assetBalance.decimals,
                rewardAccountId: assetBalance.rewardAccountId,
                policyId: assetBalance.policyId,
                boost: 0,
            }
        }),
    ]);
}