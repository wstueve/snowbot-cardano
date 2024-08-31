// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Airdrop, AirdropBatch, AirdropNft, Prisma } from "@prisma/client";
import { CancelAirdropBatchCommand, CreateAirdropBatchCommand, CreateAirdropCommand, CreateAirdropNftCommand } from "../type/airdrop";
import { prisma } from "./prisma";
import { GetBatchResult } from "@prisma/client/runtime/library";
import { AirdropBatchStatus } from "../type/enum";
import InputJsonValue = Prisma.InputJsonValue;

export async function createNewAirdrop(command: CreateAirdropCommand, userId: string) {
  return await prisma.airdrop.create({
    data: {
      userId: userId,
      name: command.name,
      policyId: command.policyId,
      policyScript: command.policyScript,
      skey: command.skey
    }
  });
}

export async function getRemainingAirdropNftsNumber(userId: string, airdropId: string) {
  const airdropNfts = await prisma.airdropNft.count({
    where: {
      airdropId: airdropId,
      airdrop: {
        userId: userId
      },
      airdropBatchId: {
        equals: null
      },
      assetId: {
        equals: null
      }
    }
  });

  return airdropNfts;
}


export async function getNextAirdropNfts(userId: string, airdropId: string) {
  const airdropNfts = await prisma.airdropNft.findMany({
    where: {
      airdropId: airdropId,
      airdrop: {
        userId: userId
      },
      airdropBatchId: {
        equals: null
      },
      assetId: {
        equals: null
      }
    },
    take: 100
  });

  return airdropNfts;
}

export async function getAirdropBatchWithNftsForUser(userId: string, airdropBatchId: string) {
  const airdropBatch = await prisma.airdropBatch.findUnique({
    where: {
      id: airdropBatchId
    },
    include: {
      airdrop: true,
      airdropNfts: true
    }
  });

  if (!airdropBatch) {
    console.error(`Airdrop batch [${airdropBatchId}] not found`);
    return null;
  }

  if (airdropBatch?.airdrop.userId !== userId) {
    console.error(`Airdrop batch [${airdropBatchId}] does not belong to user [${userId}]`);
    return null;
  }

  return airdropBatch;
}

export async function getAirdropBatchForUserId(userId: string, airdropBatchId: string) {
  const airdropBatch = await prisma.airdropBatch.findUnique({
    where: {
      id: airdropBatchId
    },
    include: {
      airdrop: true
    }
  });

  if (!airdropBatch) {
    console.error(`Airdrop batch [${airdropBatchId}] not found`);
    return null;
  }

  if (airdropBatch?.airdrop.userId !== userId) {
    console.error(`Airdrop batch [${airdropBatchId}] does not belong to user [${userId}]`);
    return null;
  }

  return airdropBatch;
}


export async function getAirdropBatchesForUserId(userId: string, airdrop: Airdrop,
  airdropBatchStatus: AirdropBatchStatus = AirdropBatchStatus.RUNNING) {
  if (airdrop.userId !== userId) {
    console.error(`User [${userId}] is not authorized to view airdrop [${airdrop.id}]`);
    return null;
  }

  return await prisma.airdropBatch.findMany({
    where: {
      airdropId: airdrop.id,
      status: airdropBatchStatus
    }
  });
}

export async function getAirdropsByUserId(userId: string) {
  return await prisma.airdrop.findMany({
    where: {
      userId: userId
    }
  });
}

export async function getUserAirdrop(userId: string, airdropId: string) {
  return await prisma.airdrop.findUnique({
      where: {
          id: airdropId,
          userId: userId
    }
  });
}

export async function getRunningAirdropBatches(userId: string, airdropId: string, paymentAddress: string) {
  return await prisma.airdropBatch.findMany({
    where: {
      airdropId: airdropId,
      airdrop: {
        userId: userId
      },
      paymentAddress: paymentAddress,
      status: AirdropBatchStatus.RUNNING
    }
  });
}

export async function createAirdropBatch(createAirdropBatchCommand: CreateAirdropBatchCommand) {
  return await prisma.airdropBatch.create({
    data: {
      airdropId: createAirdropBatchCommand.airdropId,
      paymentAddress: createAirdropBatchCommand.paymentAddress,
    }
  });
}

export async function createAirdropNfts(createAirdropNftCommands: CreateAirdropNftCommand[]): Promise<GetBatchResult> {
  return await prisma.airdropNft.createMany({
    data: createAirdropNftCommands.map((command) => {
      return {
        airdropId: command.airdropId,
        address: command.address,
        metadata: command.metadata as InputJsonValue
      };
    })
  });
}

export async function setAirdropBatchStatus(airdropBatchId: string, status: AirdropBatchStatus) {
  return await prisma.airdropBatch.update({
    where: {
      id: airdropBatchId
    },
    data: {
      status: status,
      updated: new Date()
    }
  });
}

export async function saveAirdropBatch(airdropBatch: AirdropBatch) {
  return await prisma.airdropBatch.update({
    where: {
      id: airdropBatch.id
    },
    data: {
      status: airdropBatch.status,
      txId: airdropBatch.txId,
      updated: new Date()
    }
  });
}

export async function getAirdropBatchByTxId(txId: string) {
  return await prisma.airdropBatch.findUnique({
    where: {
      txId: txId
    },
    include: {
      airdrop: true,
      airdropNfts: true
    }
  });
}

export async function updateAirdropNfts(airdropNfts: AirdropNft[]) {
  return await prisma.$transaction(
    airdropNfts.map((nft) =>
      prisma.airdropNft.update({
        where: { id: nft.id },
        data: { 
          assetId: nft.assetId,
          airdropBatchId: nft.airdropBatchId
         },
      })
    )
  );
}

export async function setAirdropNftsBatch(airdropNfts: AirdropNft[], airdropBatchId: string | null) {
  return await prisma.airdropNft.updateMany({
    where: {
      id: {
        in: airdropNfts.map((nft) => nft.id)
      }
    },
    data: {
      airdropBatchId: airdropBatchId
    }
  });
}

export async function deleteUserAirdrop(userId: string, airdropId: string) {
  const airdropCount = await prisma.airdrop.count({
    where: {
      id: airdropId,
      userId: userId
    }
  });

  if (airdropCount == 0) {
    console.log(`Record not found with id: ${airdropId}, userId: ${userId}`);
    return;
  }

  await prisma.airdropNft.deleteMany({
    where: {
      airdropBatch: {
        airdropId: airdropId
      }
    }
  });

  await prisma.airdropBatch.deleteMany({
    where: {
      airdropId: airdropId
    }
  });

  await prisma.airdrop.delete({
    where: {
      id: airdropId
    }
  });
}
