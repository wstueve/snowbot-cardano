// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import type { NextApiRequest, NextApiResponse } from "next";
import { checkSignature, DataSignature } from "@meshsdk/core";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from '../../../../components/db/prisma';
import { upsertStake } from "../../../../components/db/stake";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' })
    return
  }

  const nonce : string = req.body.message;
  const userAddress : string = req.body.userAddress;
  const signature : DataSignature = req.body.signature;

  var registration = await prisma.registerStake.findFirst({ 
    where: { 
      rewardAddress: userAddress 
    },
    orderBy: {
      id: "desc"
    } 
  });

  if (!registration || registration.nonce !== nonce || registration.userId !== session.user.id) {
    res.status(400).json({ message: "Bad request." });
    return;
  }

  const result = checkSignature(registration.nonce, userAddress, signature);
  if (!result) {
    res.status(400).json({ message: "Bad request." });
    return;
  }

  await prisma.registerStake.update({ where: { id: registration.id }, data: { signature: signature.signature, publicKey: signature.key } });
  await upsertStake(userAddress, signature, session);

  res.status(200).json({ result });
}


