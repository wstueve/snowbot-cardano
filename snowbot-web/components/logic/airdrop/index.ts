// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { C, Tx, Unit, fromText } from "lucid-cardano";
import { AddBulkAirdropNftCommand, CancelAirdropBatchCommand, CreateAirdropCommand, CreateNextAirdropBatchCommand, StartAirdropBatchCommand } from "../../type/airdrop";
import { createAirdropBatch, createAirdropNfts, createNewAirdrop, deleteUserAirdrop, getAirdropBatchForUserId, getAirdropBatchWithNftsForUser, getAirdropBatchesForUserId, getAirdropsByUserId, getNextAirdropNfts, getRemainingAirdropNftsNumber, getRunningAirdropBatches, getUserAirdrop, saveAirdropBatch, setAirdropBatchStatus, setAirdropNftsBatch } from "../../db/airdrop";
import { validateNftMetadataAssetName } from "../../type/json";
import { Airdrop, AirdropBatch } from "@prisma/client";
import { lucid, newLucid } from "../../cardano/blockfrost";
import { AirdropNft } from "@prisma/client";
import { NftMetadataAsset } from "../../type/mint";
import { isAddressValid } from "../../cardano/util";
import { AirdropBatchStatus } from "../../type/enum";
import { JsonArray, JsonObject } from "@prisma/client/runtime/library";
// used to import the NFT's from hashlips metadata
// import metatadata from "./_metadata.json";
import {AssetPolicyList, getAssetListFromChain} from "../../cardano/asset";
import { syncAssets as syncOnchainAssets } from "../../db/asset";

const MAX_METADATA_SIZE = 11000;

export async function createAirdrop(userId: string, command: CreateAirdropCommand) {
    return await createNewAirdrop(command, userId);
}

export async function getAirdrops(userId: string) {
    return await getAirdropsByUserId(userId);
}

export async function getAirdrop(userId: string, airdropId: string) {
  return await getUserAirdrop(userId, airdropId);
}

export async function deleteAirdrop(userId: string, airdropId: string) {
  return await deleteUserAirdrop(userId, airdropId);
}

export async function getRemainingAirdropNftsCount(userId: string, airdropId: string) {
  return await getRemainingAirdropNftsNumber(userId, airdropId);
}


export async function getAirdropBatches(userId: string, airdropId: string, batchStatus: AirdropBatchStatus | undefined) {
  if (!airdropId) {
    return null;
  }

  const airdrop = await getUserAirdrop(userId, airdropId);
  if (!airdrop) {
    return null;
  }

  return await getAirdropBatchesForUserId(userId, airdrop, batchStatus);
}

export async function getAirdropBatch(userId: string, airdropBatchId: string) {
  if (!airdropBatchId || !userId) {
    return null;
  }

  return await getAirdropBatchForUserId(userId, airdropBatchId);
}

// used to import the NFT's from hashlips metadata
// export const addNftsToAirdrop = async (command: AddBulkAirdropNftCommand) => {
//   const userId = "";
//   const mintToAddress = "";
//   const airdrop = await getAirdrop(userId, command.airdropId);
//   if (!airdrop) {
//     console.error(`Airdrop [${command.airdropId}] not found for user [${userId}]`);
//     return false;
//   }

//   let createAirdropNftCommands = [];
//   let i = 0;
//   for (const md of (metatadata as JsonArray)) {
//     //add check to see if NFT exists on chain
//     // if it doesn't exist, add it to the airdrop
//     createAirdropNftCommands.push({
//       airdropId: airdrop.id,
//       address: mintToAddress,
//       metadata: md
//     });

//     i++;
//     if (i % 1000 === 0) {
//       await createAirdropNfts(createAirdropNftCommands);
//       createAirdropNftCommands = [];
//     }
//   }

//   if(createAirdropNftCommands.length > 0) {
//     await createAirdropNfts(createAirdropNftCommands);
//   }
// }

export const createNextAirdropBatch = async (userId: string, command: CreateNextAirdropBatchCommand) => {
  const airdrop = await getAirdrop(userId, command.airdropId);
  if (!airdrop) {
    console.error(`Airdrop [${command.airdropId}] not found for user [${userId}]`);
    return false;
  }

  const runningBatches = await getRunningAirdropBatches(userId, command.airdropId, command.paymentAddress);
  if (runningBatches && runningBatches.length > 0) {
    console.error(`Airdrop [${command.airdropId}] has running batches for payment address [${command.paymentAddress}]`);
    return false;
  }

  const airdropBatch = await createAirdropBatch({ airdropId: airdrop.id, paymentAddress: command.paymentAddress });
  if (!airdropBatch) {
    console.error(`Failed to create airdrop batch for airdrop [${command.airdropId}]`);
    return false;
  }

  const airdropNfts = await getNextAirdropNfts(userId, airdrop.id);

  const assetPolicyList: AssetPolicyList[] = airdropNfts.map(nft => {
    return {
      policyId: airdrop.policyId,
      assetName: fromText(getNftName(nft))
    }
  });

  const airdropNftNameMap = new Map<string, AirdropNft>();
  airdropNfts.forEach(nft => {
    airdropNftNameMap.set(fromText(getNftName(nft)), nft);
  });

  const onChainNftList = await getAssetListFromChain(assetPolicyList);
  await syncOnchainAssets(airdrop.policyId, onChainNftList, airdropNftNameMap);

  const onChainNftNames = onChainNftList?.map((nft: { asset_name: string; }) => nft.asset_name);

  const offChainNfts = airdropNfts.filter(nft => !onChainNftNames?.includes(fromText(getNftName(nft))));

  const includedNfts = await sizeCip25NftBatchTx(command.paymentAddress, airdrop, offChainNfts);
  const tx = await buildCip25NftBatchTx(command.paymentAddress, airdrop, includedNfts);

  await setAirdropNftsBatch(includedNfts, airdropBatch.id);

  airdropBatch.status = AirdropBatchStatus.RUNNING;
  airdropBatch.txId = tx.toHash();
  await saveAirdropBatch(airdropBatch);
  
  return tx.toString();
}

export const addBatchesToAirdrop = async (userId: string, command: AddBulkAirdropNftCommand) => {
  if (!await validateAddBulkAirdropNftCommand(userId, command)) {
    console.error(`Invalid command: ${JSON.stringify(command)} or userId: ${userId}`);
    return false;
  }

  const airdrop = await getAirdrop(userId, command.airdropId);
  if (!airdrop) {
    console.error(`Airdrop [${command.airdropId}] not found for user [${userId}]`);
    return false;
  }
  
  let airdropBatch: AirdropBatch | undefined;
  let createAirdropNftCommands = [];
  let totalMetadataSize = 0;
  let i = 0;

  for (const address of command.addresses) {
    const metadata = command.metadata[i];

    
    totalMetadataSize += JSON.stringify(metadata).length;

    if (totalMetadataSize > MAX_METADATA_SIZE) {
//      await createAirdropNfts(createAirdropNftCommands);

      airdropBatch = undefined;
      totalMetadataSize = 0;
    }
    
    if (!airdropBatch) {
      airdropBatch = await createAirdropBatch({ airdropId: airdrop.id, paymentAddress: ""});
      createAirdropNftCommands = [];
    }

    createAirdropNftCommands.push({
      airdropBatchId: airdropBatch.id,
      address: address,
      metadata: metadata
    });

    i++;
  }

  if(createAirdropNftCommands.length > 0) {
//    await createAirdropNfts(createAirdropNftCommands);
  }

  return await getAirdropBatchesForUserId(userId, airdrop);
}

export const validateAddBulkAirdropNftCommand = async (userId: string, command: AddBulkAirdropNftCommand) => {
  try {
    if (!command
      || !command.airdropId
      || !command.addresses
      || !command.metadata
      || command.addresses.length <= 0
      || command.metadata.length <= 0
      || command.addresses.length !== command.metadata.length
      || !userId) {
      console.error("Bad request: ", command);
      return false;
    }

    const airdrop = await getAirdrop(userId, command.airdropId);
    if (!airdrop) {
      console.error(`Airdrop [${command.airdropId}] not found for user [${userId}]`);
      return false;
    }

    for (const address of command.addresses) {
      if (!address) {
        console.error(`Missing address`);
        return false;
      }

      if (!isAddressValid(address)) {
        console.error(`Invalid address: ${address}`);
        return false;
      }
    }

    for (const metadata of command.metadata) {
      if (!metadata) {
        console.error(`Missing metadata`);
        return false;
      }
      try {
        const valid = validateNftMetadataAssetName(metadata);
        if (!valid) {
          console.error(`Invalid metadata: ${metadata} does not match schema ${valid}`);
          return false;
        }

        if (metadata.length > MAX_METADATA_SIZE) {
          console.error(`Invalid metadata: ${metadata} exceeds max size ${MAX_METADATA_SIZE}`);
          return false;
        }
      }
      catch (e) {
        console.error(`Invalid metadata: ${metadata}, Error: ${e}`);
        return false;
      }
    }
      
    return true;
  }
  catch (e) {
    console.error("Error adding to airdrop: ", e);
    return false;
  }
}

export async function cancelAirdropBatch(userId: string, command: CancelAirdropBatchCommand) {
  const airdropBatch = await getAirdropBatchWithNftsForUser(userId, command.id);
  if (!airdropBatch) {
    console.error(`Airdrop batch [${command.id}] not found for user [${userId}]`);
    return false;
  }

  await setAirdropNftsBatch(airdropBatch.airdropNfts, null);
  await setAirdropBatchStatus(airdropBatch.id, AirdropBatchStatus.CANCELLED);
  
  return await getAirdropBatchWithNftsForUser(userId, command.id);
}


// export async function startAirdropBatch(userId: string, command: StartAirdropBatchCommand) {
//   if (!command || !command.paymentAddress || !command.id || !userId || !isAddressValid(command.paymentAddress)) {
//     console.error(`Invalid command or userId: ${userId}`);
//     return false;
//   }

//   const airdropBatch = await getAirdropBatchWithNftsForUser(userId, command.id);
//   if (!airdropBatch
//     || !airdropBatch.airdropNfts
//     || airdropBatch.airdropNfts.length <= 0
//     || !airdropBatch.airdrop
//     || airdropBatch.status !== AirdropBatchStatus.NEW) {
//     console.error(`Airdrop batch [${command.id}] not found for user [${userId}]`);
//     return false;
//   }

//   // const tx = await buildCip25NftBatchTx(command.paymentAddress, airdropBatch.airdrop, airdropBatch.airdropNfts);
//   // await setAirdropBatchStatus(airdropBatch.id, AirdropBatchStatus.RUNNING);
//   // return tx;
//   return {};
// }

export async function buildCip25NftBatchTx(paymentAddress: string, airdrop: Airdrop, airdropNfts: AirdropNft[]) {
  const policyScript = lucid.utils.nativeScriptFromJson(JSON.parse(airdrop.policyScript));
  
  const policyLucid = await newLucid();
  const privateKey = getPrivateKey(airdrop);
  policyLucid.selectWalletFromPrivateKey(privateKey);

  const userLucid = await newLucid();
  const userWallet = userLucid.selectWalletFrom({ address: paymentAddress });
  const utxos = await userLucid.utxosAt(paymentAddress);

  const cip721Metadata: any = {
    [airdrop.policyId]: {}
  };

  const txns = [];

  for (const nft of airdropNfts) {
    const nftName = getNftName(nft);
    ((nft.metadata as JsonObject)[nftName] as JsonObject)['birthday'] = "2024-06-09";

    cip721Metadata[airdrop.policyId][nftName] = (nft.metadata as JsonObject)[nftName];
    const unit: Unit = airdrop.policyId + fromText(nftName);

    const tx: Tx = await userLucid
      .newTx()
      .collectFrom(utxos)
      .payToAddress(nft.address, { [unit]: 1n })
      .mintAssets({ [unit]: 1n })
      .validTo(Date.now() + 100_000)
      .attachMintingPolicy(policyScript);
    
    txns.push(tx);
  }

  let multiSigTx = await userLucid.newTx()
    .collectFrom(utxos)
    .validTo(Date.now() + 1000000)
    .attachMetadata(721, cip721Metadata);

  for (const tx of txns) {
    multiSigTx = multiSigTx.compose(tx);
  }

  const txComplete = await multiSigTx.complete();
  const partial = await policyLucid.fromTx(txComplete.toString()).partialSign();
  const partialTx = await txComplete.assemble([partial]).complete();

  return partialTx;
}

export function getNftName(nft: AirdropNft): string {
  const nftMetadata = nft.metadata as NftMetadataAsset;
  const nftName = Object.keys(nftMetadata)[0];
  return nftName;
}

export async function sizeCip25NftBatchTx(paymentAddress: string, airdrop: Airdrop, offChainAirdropNfts: AirdropNft[]) {
  const minNfts = 20;
  const nftsToInclude: AirdropNft[] = [];

  for (const nft of offChainAirdropNfts) {
    nftsToInclude.push(nft);
    if (nftsToInclude.length < minNfts) {
      continue;
    }

    try {
      await buildCip25NftBatchTx(paymentAddress, airdrop, nftsToInclude);
    }
    catch (e) {
      console.log(`Error building tx: ${e}`);
      nftsToInclude.pop();
      break;
    } 
  }

  return nftsToInclude;
}

function getPrivateKey(airdrop: { id: string; name: string; userId: string; policyId: string; policyScript: string; skey: string; created: Date; }) {
  let skey = airdrop.skey.replaceAll("\"", "");
  if (skey.startsWith("5820")) {
    skey = skey.substring(4);
  }
  const privateKey = C.PrivateKey.from_normal_bytes(Buffer.from(skey, 'hex')).to_bech32();
  return privateKey;
}

export async function airdropMintedAssetTx(command: any) {
  //load the policy script from a file and use it to mint the tokens
  //load the policy wallet from a file and add it to the required signers
  //it's in the downloads folder mfer airdrop_keys vkey and script
  const policyScript = lucid.utils.nativeScriptFromJson(command.policyScript as any);
  const policyLucid = await newLucid();
  const privateKey = C.PrivateKey.from_normal_bytes(Buffer.from(command.skey, 'hex')).to_bech32();

  policyLucid.selectWalletFromPrivateKey(privateKey);
  const recipients = ""; //fs.readFileSync('.secrets/recipients.txt', 'utf8').split('\n');

  const userLucid = await newLucid();
  const userWallet = userLucid.selectWalletFrom({ address: command.paymentAddress });
  console.log(`Payment address: ${JSON.stringify(command)}`);
  const utxos = await userLucid.utxosAt(command.paymentAddress);

  const cip721Metadata: any = {
      [command.policyId]: {}
  };

  console.log("utxos: ", utxos.length);
  const txns = [];
  let i = 0;
  for (const r of recipients) {
      const recipient = r.trim();
      i += 1;
      if (i > 122) {
          break;
      }
      console.log("Sending to: ", recipient);
      const nftName = "mferNFT" + Math.random().toString(36).substring(2, 8);
      const unit: Unit = command.policyId + fromText(nftName);

      cip721Metadata[command.policyId][nftName] = {
                  "name": nftName,
                  "image": "ipfs://[set here]",
                  "website": "[set here]"
      };

      console.log("recipient: ", recipient)
      const tx: Tx = await userLucid
          .newTx()
          .collectFrom(utxos)
          .payToAddress(recipient, { [unit]: 1n })
          .mintAssets({ [unit]: 1n })
          .validTo(Date.now() + 100000)
          .attachMintingPolicy(policyScript);
      txns.push(tx);
  }
  
  let multiSigTx = await userLucid.newTx()
       .collectFrom(utxos)
      .validTo(Date.now() + 100000)
      .attachMetadata(721, cip721Metadata)
       .payToAddress(process.env.SNOWBOT_COMMUNITY_WALLET ?? "", { ["lovelace"]: 1_000_000n });

   for (const tx of txns) {
       multiSigTx = multiSigTx.compose(tx);
  }

  const txComplete = await multiSigTx.complete();
  console.log("🥹 txComplete: ", txComplete.toString());
  const partial = await policyLucid.fromTx(txComplete.toString()).partialSign();
  console.log("🥹 partial: ", partial.toString());
  const partialTx = await txComplete.assemble([partial]).complete();
  console.log("🥹 partialTx: ", partialTx.toString());
  return partialTx.toString();
      
  }
