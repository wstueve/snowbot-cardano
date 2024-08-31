// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { getAssetFromChain } from "../cardano/asset";
import { updateAirdropNfts } from "./airdrop";
import { dbCacheExecute } from "./cache";
import { prisma } from "./prisma";
import { AirdropNft, Prisma } from "@prisma/client";

export async function getAsset(policyId: string, assetName: string): Promise<any> {
    try {
        return await dbCacheExecute(
            `getAsset-${policyId}-${assetName}`, 
            async () => await prisma.asset.findUniqueOrThrow({
            where: {
                policyIdAssetName: {
                    policyId: policyId,
                    assetName: assetName
                }
            }
        }));
    }
    catch (e) {
        console.log(`getAsset-${policyId}-${assetName} failed with ${e}. Attempting to retrieve from chain.`);
        const assetFromChain = await getAssetFromChain(policyId, assetName);
        if (!!assetFromChain) {
            return await createAsset(assetFromChain, policyId);
        }
        throw e;
    }
}

export async function syncAssets(policyId: string, assetsFromChain: any[], airdropNfts: Map<string, AirdropNft>)
  : Promise<any> {
  return await Promise.all(assetsFromChain.map(async (asset) => {
    const dbAsset = await dbCacheExecute(
      `getAsset-${policyId}-${asset.asset_name}`,
      async () => await prisma.asset.findUnique({
        where: {
          policyIdAssetName: {
            policyId: policyId,
            assetName: asset.asset_name
          }
        }
      }));
    if (!dbAsset) {
      await createAsset(asset, policyId);
    } else {
      const nft = airdropNfts.get(asset.asset_name);
      await prisma.airdropNft.update({
        where: { id: nft?.id },
        data: {
          assetId: dbAsset.id
        }
      });
    }
  }));
}

export async function getAssets(policyId: string): Promise<any> {
    return await dbCacheExecute(
        `getAssets-${policyId}`, 
        async () => await prisma.asset.findMany({
        where: {
            policyId: policyId,
            totalSupply: {
                gt: 0,
            },
        }
    }));
}

export async function createAsset(asset: any, policyId: string, imageLocationCallback: (s: string) => string = (assetName) => `assets/images/${policyId}/${assetName}.png`) {
    return await prisma.asset.upsert({
        where: { fingerprint: asset.fingerprint },
        update: {
            totalSupply: parseInt(asset.total_supply),
            imageUrl: imageLocationCallback(asset.asset_name_ascii),
        },
        create: {
            fingerprint: asset.fingerprint,
            name: asset.asset_name_ascii,
            assetName: asset.asset_name,
            imageUrl: imageLocationCallback(asset.asset_name_ascii),
            totalSupply: parseInt(asset.total_supply),
            policyId: policyId,
            metadata: asset.minting_tx_metadata,
        }
    });
}

export async function getAssetsWithBalances(cardanoAssets: any[]) {
    const fingerprints = cardanoAssets.map(a => a.fingerprint);
    return await prisma.$queryRaw`
    With balances AS (Select a.id, json_agg(b.*) as balances From public."Asset" a
    Left Join public."RewardAccount" ra On CAST(a.id as text) = ra."foreignId" and ra."accountType" = 'asset'
    Left Join public."Balance" b On ra.id = b."rewardAccountId"
    Where Coalesce(b."balance", 0) > 0
    Group By a.id)
    Select a.*, balances.balances
    From public."Asset" a Left Join BALANCES On a.id = balances.id
    Where a."fingerprint" in (${Prisma.join(fingerprints)})`;
}

export async function getAssetWithBalances(policyId: string, assetName: string) {
    return await prisma.$queryRaw`
    With balances AS (Select a.id, json_agg(b.*) as balances From public."Asset" a
    Left Join public."RewardAccount" ra On CAST(a.id as text) = ra."foreignId" and ra."accountType" = 'asset'
    Left Join public."Balance" b On ra.id = b."rewardAccountId"
    Where Coalesce(b."balance", 0) > 0
    Group By a.id)
    Select a.*, balances.balances
    From public."Asset" a Left Join BALANCES On a.id = balances.id
    Where a."policyId" = ${policyId} and a."assetName" = ${assetName}`;
}