// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Stake } from "@prisma/client";
import { dbCacheExecute } from "./cache";
import { prisma } from "./prisma";
import { stakeAddedEvent, stakeDeletedEvent } from "../events/stake";
import { DataSignature } from "@meshsdk/core";

export async function getStake(rewardAddress: string) {
  return await dbCacheExecute(
    `getStake-${rewardAddress}`,
    async () => await prisma.stake.findUnique({
        where: {
            rewardAddress: rewardAddress
        }
    }), undefined, true);
}

export async function getStakes(userId: string) : Promise<Stake[]>{
  return await dbCacheExecute(
    `getStakes-${userId}`,
    async () => await prisma.stake.findMany({
        where: {
            userId: userId
        }
    }));
}

export async function upsertStake(userAddress: string, signature: DataSignature, session: any) {
  await prisma.stake.upsert({
    where: {
      rewardAddress: userAddress
    },
    create: {
      signature: signature.signature,
      publicKey: signature.key,
      rewardAddress: userAddress,
      user: {
        connect: {
          id: session.user.id
        }
      }
    },
    update: {
      signature: signature.signature,
      publicKey: signature.key,
      user: {
        connect: {
          id: session.user.id
        }
      }
    },
  });

  await stakeAddedEvent(userAddress, session.user.id);
}


export const deleteStake = async (
    stakeId: number,
    userId: string
  ): Promise<{ code: number; status?: boolean; message?: string }> => {
    const stake = await prisma.stake.findFirst({
      where: {
        userId,
        id: stakeId,
      },
    });
  
    if (!stake) {
      return { status: false, code: 400, message: "Stake not found." };
    }
  
    try {
      await prisma.stake.delete({
        where: {
          id: stake.id,
        },
      });

      await stakeDeletedEvent(stake.rewardAddress, userId);

      return { status: true, code: 200 };
    } catch (e: any) {
      console.log(`Error: ${e}`);
      return { status: false, code: 400, message: e };
    }
  };
    