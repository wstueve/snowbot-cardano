// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import JsonSerializer from "../../../components/util/jsonUtil";
import { FeatureFlags } from "../../../components/metadata/featureFlags";
import { getWithdrawalAmountsInLastDay, startWithdrawal } from "../../../components/db/transaction";
import { getOrCreateRewardAccount } from "../../../components/db/rewardAccount";
import { RewardAccountType } from "../../../components/type/enum";
import { getBalances } from "../../../components/db/balance";
import { projects } from "../../../components/metadata/project";
import { getProjectWithDistributionPoliciesById } from "../../../components/db/project";
import { SecretsManagerClient, GetSecretValueCommand} from "@aws-sdk/client-secrets-manager";
import { AppWallet } from "@meshsdk/core";
import blockfrost from "../../../components/cardano/blockfrost";
import { WithdrawalCommand } from "../../../components/type/transaction";
import { create } from "domain";
import { createWithdrawTx } from "../../../components/logic/transaction/withdrawal";


//TODO: Calculate the value of the withdrawal in ada
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const featureFlags = new FeatureFlags(req.headers.host ?? "");
  if (!featureFlags.withdrawals()) {
    res.status(503).json({ message: "Service Unavailable" });
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }

  const withdrawalCommand: WithdrawalCommand = { ...req.body as WithdrawalCommand };
  if (!withdrawalCommand
    || !withdrawalCommand.paymentAddress
    || !withdrawalCommand.units
    || withdrawalCommand.units.length === 0) {
    res.status(400).json({ message: "Bad Request." });
    return;
  }

  if (withdrawalCommand.units.length > 25) {
    res.status(400).json({ message: "Bad Request. A max of 25 coins at a time can be withdrawn." });
    return;
  }

  for (const unit of withdrawalCommand.units) {
    if (!unit.amount
      || unit.amount <= 0
      || !unit.policyId
      || !unit.name) {
      res.status(400).json({ message: "Bad Request." });
      return;
    }
  }
  //todo: validate the withdrawal request
  const tx = await createWithdrawTx(withdrawalCommand);
  res.status(200).json({ tx: tx.toString() });
}

async function validateRequest(withdrawalCommand: WithdrawalCommand, session: any, res: NextApiResponse) {
  //get the user's reward account
  const rewardAccount = await getOrCreateRewardAccount(RewardAccountType.USER, session.user.id);
  if (!rewardAccount) {
    console.warn(`Failed to get reward account for user ${session.user.id}`);
    res.status(400).json({ message: "Bad Request." });
    return;
  }

  //get the data needed for validation
  const balances = await getBalances(rewardAccount);
  const projectWithDistributionPolicies = await getProjectWithDistributionPoliciesById(projects[0].id);
  const withdrawalAmounts = await getWithdrawalAmountsInLastDay(withdrawalCommand.units.map(a => a.policyId));

  //validate the requested amounts
  for (const requestedAmount of withdrawalCommand.units.map(a => { return { policyId: a.policyId, amount: a.amount } })) {
    const balance = balances.find(b => b.policyId === requestedAmount.policyId);
    if (!balance || balance.balance < requestedAmount.amount) {
      console.warn(`Failed to find sufficient balance for user ${session.user.id} and policy ${requestedAmount.policyId}`);
      res.status(400).json({ message: "Bad Request." });
      return;
    }

    const policy = projectWithDistributionPolicies.distributionPolicies.find(p => p.policy.policyId === requestedAmount.policyId);
    if (!policy) {
      console.warn(`Failed to find distribution policy for user ${session.user.id} and policy ${requestedAmount.policyId} for project ${projects[0].name}`);
      res.status(400).json({ message: "Bad Request." });
      return;
    }

    if (policy.isWithdrawalEnabled === false) {
      console.warn(`Withdrawal is disabled for policy ${requestedAmount.policyId} for project ${projects[0].name} when user ${session.user.id} tried to withdrawal`);
      res.status(400).json({ message: "Bad Request." });
      return;
    }

    if (policy.maxWithdrawalRequestAmount < requestedAmount.amount) {
      console.warn(`Requested withdrawal amount ${requestedAmount.amount} exceeds the maximum withdrawal request amount ${policy.maxWithdrawalAmountPerDay} for user ${session.user.id} and policy ${requestedAmount.policyId} for project ${projects[0].name}`);
      res.status(400).json({ message: "Bad Request." });
      return;
    }

    //   const withdrawalAmount = withdrawalAmounts.find(wa => wa.policyId === requestedAmount.policyId);
    //   if (withdrawalAmount && (withdrawalAmount.totalAmount + requestedAmount.amount) > policy.maxWithdrawalAmountPerDay) {
    //     console.warn(`Requested withdrawal amount ${requestedAmount.amount} exceeds the maximum withdrawal amount per day ${policy.maxWithdrawalAmountPerDay} for user ${session.user.id} and policy ${requestedAmount.policyId} for project ${projects[0].name}`);
    //     res.status(400).json({ message: "Bad Request." });
    //     return;
    //   }
    // }
  
    //check if the user has made a withdrawal in the last 24 hours
    //if so, return a message to the user
  
  
    //check if the wallet has enough ada to cover the withdrawal
    //if not, return a message to the user


    const secret_name = "test/coinName/0";

    const client = new SecretsManagerClient({
      region: "us-east-1",
    });

    let response;

    try {
      response = await client.send(
        new GetSecretValueCommand({
          SecretId: secret_name,
          VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        })
      );
    } catch (error) {
      // For a list of exceptions thrown, see
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      throw error;
    }

    const secret = response.SecretString;
    if (!secret) {
      console.warn(`Failed to get secret for project 0 for user ${session.user.id}`);
      res.status(400).json({ message: "Bad Request." });
      return;
    }
  
    //TODO: construct from multiple secrets in aws
    
    //create an AppWallet from the secret
    const appWallet = new AppWallet({
      networkId: Number.parseInt(process.env.CARDANO_NETWORK_ID ?? "0"),
      fetcher: blockfrost,
      submitter: blockfrost,
      key: {
        type: "mnemonic",
        words: secret?.split(",") ?? [],
      },
    });

    //build the withdrawal transaction with the inputs and outputs and store it in the db
    //this way the same utxo can't be used for multiple withdrawals
  
    //need to groom the wallet into a bank of utxos that correspond to a queue of withdrawals reuqests
  
    //need to have a max concurrent withdrawals for the system and then it's unavailable
  
    //acquire the lock on the user's reward account
    //check if a lock is pending on the user's reward account
    //if so, return a message to the user
    const withdrawal = await startWithdrawal(rewardAccount);
    if (!withdrawal) {
      console.warn(`Failed to start withdrawal for user ${session.user.id}`);
      res.status(400).json({ message: "Bad Request." });
      return;
    }

    res.status(200).json(JsonSerializer(withdrawal));
  }
}