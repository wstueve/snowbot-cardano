// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../../components/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import blockfrost from "../../../../components/cardano/blockfrost";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user) {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }
  if (req.method !== "GET") {
    res.status(405).send({ message: "Only GET requests allowed" });
    return;
  }

  try {
    const stakes = await prisma.stake.findMany({
      where: {
        userId: session.user.id,
      },
    });

    const walletsWithBalance = await Promise.all(
      stakes.map(async (wallet) => {
        let account;
        try {
          account = await blockfrost.accounts(wallet.rewardAddress);
        } catch (error) {}
        return buildWallet(wallet, account);
      })
    );
    res.status(200).json(walletsWithBalance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

type WalletWithBalance = {
  id: string;
  rewardAddress: string;
  balance: string;
  poolId: string;
};

function buildWallet(wallet: any, account: any): WalletWithBalance {
  return {
    id: wallet.id,
    rewardAddress: wallet.rewardAddress,
    balance: account?.controlled_amount ?? "0",
    poolId: account?.pool_id ?? "",
  };
}
