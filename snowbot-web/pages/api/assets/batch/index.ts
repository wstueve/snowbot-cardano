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
import {AddBulkAirdropNftCommand, StartAirdropBatchCommand} from "../../../../components/type/airdrop";
import {
  addBatchesToAirdrop,
//  startAirdropBatch
} from "../../../../components/logic/airdrop";
import { AirdropBatchStatus } from "../../../../components/type/enum";
import { getRunningAirdropBatches } from "../../../../components/db/airdrop";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const featureFlags = new FeatureFlags(req.headers.host ?? "");
  if (!featureFlags.airdrop()) {
    res.status(503).json({ message: "Airdrop Unavailable" });
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  let userId = session?.user?.id;
  if (!session || !session.user) {
    if (!isTestAuthorized(req)) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
    //test user id needs to be in the test db
    userId = "";  }

  if (req.method === 'POST') {
    const command = {
      ...req.body as AddBulkAirdropNftCommand
    };
    
    if (!command
      || !command.airdropId
      || !command.addresses
      || !command.metadata
      || command.addresses.length <= 0
      || command.metadata.length <= 0
      || command.addresses.length !== command.metadata.length
    ) {
      res.status(400).json({ message: "Bad Request." });
      return;
    }
  
    const airdropBatches = await addBatchesToAirdrop(userId, command);
    if (!airdropBatches) {
      res.status(400).json({ message: "Bad Request." });
      return;
    }
    
    res.status(200).json({ airdropBatches: airdropBatches });
    return
  }

  if (req.method === 'GET') { 
    const runningBatches = await getRunningAirdropBatches(userId,
      req.query.airdropId as string,
      req.query.paymentAddress as string);
  
    res.status(200).json(runningBatches);
    return
  }

  if (req.method === 'PUT') {
    const command = {
      ...req.body as StartAirdropBatchCommand
    };
    command.id = req.query.batchId as string;

    //const tx = await startAirdropBatch(userId, command);
    //res.status(200).json({ tx: tx });
    res.status(503).json({ message: "Service unavailable - Needs upgraded" });
    return
  }

  res.status(405).send({ message: 'Invalid request method. batch index' })
}


