// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { getStake } from "../../../../components/db/stake";
import { getAssetAddressesFromChain } from "../../../../components/cardano/asset";
import { extractBech32StakeAddress } from "../../../../components/cardano/util";
import { getOrCreateRewardAccount } from "../../../../components/db/rewardAccount";
import { RewardAccountType } from "../../../../components/type/enum";
import { getAssetWithBalances } from "../../../../components/db/asset";
import { createLedgersAndTransferBalance } from "../../../../components/db/rewardLedger";
import { getMostRecentEpoch } from "../../../../components/db/epoch";
import { getProject } from "../../../../components/db/project";
import { projects } from "../../../../components/metadata/project";
import { createOrGetBalance } from "../../../../components/db/balance";
import { userCapturedRewardEvent } from "../../../../components/events/balance";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const id = parseInt(req.query.id as string);

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }
  switch (req.method) {
    case "POST": {
      try {
        const policyId = req.body.policyId;
        const assetName = req.body.assetName;
        const userId = session.user.id;

        const project = await getProject(projects[0].name);
        const epoch = await getMostRecentEpoch(project.id);
        const addresses = await getAssetAddressesFromChain(policyId, assetName);

        //all the addresses must be staked
        for (const address of addresses) {
          const paymentAddress = address.payment_address;

          const stakeAddress = extractBech32StakeAddress(paymentAddress);
          if (!stakeAddress) {
            console.log(`⚠️ User [${userId}] attempted to capture rewards for an asset [${policyId} ${assetName}] that is not staked`)
            res.status(400).json({ message: "Bad request. Please refesh the page and try again or contact support." });
            return;
          }

          const stake = await getStake(stakeAddress);
          if (!stake) {
            console.log(`⚠️ User [${userId}] attempted to capture rewards for an asset [${policyId} ${assetName}] which was on stake address not found in the database`)
            res.status(400).json({ message: "Bad request. Please refesh the page and try again or contact support." });
            return;
          }

          if (stake.userId !== userId) {
            console.log(`⚠️ User [${userId}] attempted to capture rewards for an asset [${policyId} ${assetName}] which was not staked by them and by [${stake.userId}]`)
            res.status(400).json({ message: "Bad request. Please refesh the page and try again or contact support." });
            return;
          }
        }

        //all of the staked addresses must be owned by the user
        //get the balances for the asset and user and then create a transaction to send the rewards to the user
        const assetArray = await getAssetWithBalances(policyId, assetName) as any[];
        if (!assetArray || assetArray.length !== 1) {
          console.log(`⚠️ User [${userId}] attempted to capture rewards for an asset [${policyId} ${assetName}] which returned an invalid asset count: [${assetArray?.length}]`)
          res.status(400).json({ message: "Bad request. Please refesh the page and try again or contact support." });
          return;
        }

        const asset = assetArray[0];
        if (!asset.balances || asset.balances.length === 0) {
          console.log(`⚠️ User [${userId}] attempted to capture rewards for an asset [${policyId} ${assetName}] which has no balances: ${JSON.stringify(asset)}`)
          res.status(400).json({ message: "Bad request. Please refesh the page and try again or contact support." });
          return;
        }

        const userRewardAccount = await getOrCreateRewardAccount(RewardAccountType.USER, userId);
        for (const assetBalance of asset.balances) {
          const userBalance = await createOrGetBalance(assetBalance.policyId, assetBalance.decimals, userRewardAccount);
          await createLedgersAndTransferBalance(userBalance, assetBalance, asset, epoch);
          await userCapturedRewardEvent(userId);
        }

  
        res.status(201).json({ message: "Balances transferred" });
        return;
      } catch (e) {
        console.log(`⚠️ User [${session.user.id}] failed to capture rewards for an asset with ${e}`);
        res.status(500).json({ message: "An error has occurred. Please refesh the page and try again or contact support." });
        return;
      }
    }
  }
  res.status(405).json({ message: "Only POST requests allowed" });
  return;
}
