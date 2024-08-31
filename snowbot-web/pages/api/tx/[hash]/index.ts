// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { FeatureFlags } from "../../../../components/metadata/featureFlags";
import { isTestAuthorized } from "../../../../components/util/httpUtil";
import blockfrost from "../../../../components/cardano/blockfrost";
import { getAirdropBatchByTxId, saveAirdropBatch, updateAirdropNfts } from "../../../../components/db/airdrop";
import { AirdropBatchStatus } from "../../../../components/type/enum";
import { getAsset } from "../../../../components/db/asset";
import { fromText } from "lucid-cardano";
import { getNftName } from "../../../../components/logic/airdrop";
import { dbCacheExecute } from "../../../../components/db/cache";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const featureFlags = new FeatureFlags(req.headers.host ?? "");
  if (!featureFlags.deposits()) {
    res.status(503).json({ message: "Service Unavailable" });
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    if (!isTestAuthorized(req)) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
  }

  if (req.method !== 'GET') {
    res.status(405).send({ message: 'Only GET requests allowed' })
    return
  }

  const txHash = req.query.hash?.toString();
  if (!txHash) {
    res.status(400).json({ message: "Bad Request." });
    return;
  }

  const transaction = dbCacheExecute(`api-get-tx-hash-${txHash}`, async () => {

    let tx;
    try {
      tx = await blockfrost.txs(txHash);
      if (!tx) {
        return { isMissing: true };
      }
    }
    catch (e) {
      // todo: we need to handle 404s differently
      return { isMissing: true };
    }

    if (tx && tx.hash) {
      const batch = await getAirdropBatchByTxId(tx.hash);
      if (!batch || !batch.airdropNfts) {
        console.error("Batch not found for tx or no airdrop nfts found", tx.hash);
        return { message: "Batch not found." };
      }
      for (const nft of batch.airdropNfts) {
        const asset = await getAsset(batch.airdrop.policyId, fromText(getNftName(nft)));
        if (asset) {
          nft.assetId = asset?.assetId;
        }
      }
      await updateAirdropNfts(batch.airdropNfts);
      
      batch.status = AirdropBatchStatus.COMPLETED;
      batch.updated = new Date();
      await saveAirdropBatch(batch);
    }
    return {isMissing: false, txHash: txHash, tx: tx};
  });

  const result = await transaction;

  res.status(200).json(result);
}