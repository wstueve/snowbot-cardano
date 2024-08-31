// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import blockfrost, { newLucid } from '../../cardano/blockfrost';
import { projects } from '../../metadata/project';
import { randomUUID } from 'crypto';
import { CreatePolicyCommand, CreateProjectMintPolicyCommand, MintAssetCommand, PolicySecrets } from '../../type/mint';
import { getProjectMintPolicy, saveProjectMintPolicy } from '../../db/mint';
import { Lucid, MintingPolicy, NativeScript, Tx, TxComplete, Unit, fromText } from 'lucid-cardano';
import { saveSecrets, getSecrets } from '../../aws/secrets';

export async function createMintPolicy(command: CreatePolicyCommand) {
    const existingPolicy = await getProjectMintPolicy(projects[0].id, command.prefix);
    if (existingPolicy) {
        console.log(`Policy already exists for ${command.prefix}`);
        return existingPolicy;
    }

    const policySecrets = await createNativePolicyScript(command);
    const projectMintPolicy = createProjectMintPolicy(command,
        policySecrets.nativeScript.type,
        policySecrets.policyId);

    await saveSecrets(projectMintPolicy, policySecrets);
    const result = await saveProjectMintPolicy(projectMintPolicy);
    console.log(JSON.stringify(result));
    return result;
}

export async function mintAssetTx(mintAssetCommand: MintAssetCommand) {
    //TODO: add minting the royalty token if it doesn't exist
    //todo: tie the authorization code to the minting policy
    //todo: assign mint requests to the same utxos for the same account to avoid double minting
    const projectMintPolicy = await getProjectMintPolicy(projects[0].id, "tDbag");
  
    const secrets = await getSecrets(projectMintPolicy);
    const policyLucid = await newLucid();
    policyLucid.selectWalletFromSeed(secrets.mnemonic);
      
    const mintingPolicy: MintingPolicy = policyLucid.utils.nativeScriptFromJson(secrets.nativeScript as NativeScript);
    const nftName = "tBernardBoysMafia494";
    const unit: Unit = secrets.policyId + fromText(nftName);
    
    //Royalty metadata
    const cip777Metadata: any = {
        "rate": "0.025",
        "addr": [
            "",
            ""
        ]
    };
         
    const cip721Metadata: any = {
        [secrets.policyId]: {
            [nftName]: {
                "Name": "",
                "image": "ipfs://",
                "website": ""
            }
        }
    };

    const userLucid = await newLucid();
    const userWallet = userLucid.selectWalletFrom({ address: mintAssetCommand.paymentAddress });
    const utxos = await userLucid.utxosAt(mintAssetCommand.paymentAddress);
    
    const tx: TxComplete = await userLucid
        .newTx()
        .collectFrom(utxos)
        .payToAddress('', { ['lovelace']: 3_000_000n })
        .mintAssets({ [unit]: 1n })
        .attachMetadata(721, cip721Metadata)
        .validTo(Date.now() + 100000)
        .attachMintingPolicy(mintingPolicy)
        .complete();

    
    const partial = await policyLucid.fromTx(tx.toString()).partialSign();
    const partialTx = await tx.assemble([partial]).complete();
    return { tx: partialTx.toString() };
}

export async function mintFT(mintAssetCommand: MintAssetCommand) {
    //TODO: add minting the royalty token if it doesn't exist
    //todo: tie the authorization code to the minting policy
    //todo: assign mint requests to the same utxos for the same account to avoid double minting
    const projectMintPolicy = await getProjectMintPolicy(projects[0].id, "tDbag");
  
    const secrets = await getSecrets(projectMintPolicy);

    const policyLucid = await newLucid();
    policyLucid.selectWalletFromSeed(secrets.mnemonic);
      
    const mintingPolicy: MintingPolicy = policyLucid.utils.nativeScriptFromJson(secrets.nativeScript as NativeScript);

    const nftName = "tDbag";
    const unit: Unit = secrets.policyId + fromText(nftName);
    const cip20Metadata: any = {
        [secrets.policyId]: {
            [fromText(nftName)]: {
                "ticker": "",
                "name": "",
                "desc": "",
                "description": "",
                "icon": "ipfs://",
                "image": "ipfs://",
                "decimals": 2,
                "website": "https://",
            }
        }
    };

    const cip721Metadata: any = {
        [secrets.policyId]: {
            [nftName]: {
                "name": "",
                "ticker": "",
                "image": "ipfs://",
                "mediaType": "image/png",
                "decimals": 2,
                "description": "",
                "website": "https://",
            }
        }
    }

    const userLucid = await newLucid();
    const userWallet = userLucid.selectWalletFrom({ address: mintAssetCommand.paymentAddress });
    console.log(`Payment address: ${JSON.stringify(mintAssetCommand)}`);
    const utxos = await userLucid.utxosAt(mintAssetCommand.paymentAddress);

    const tx: TxComplete = await userLucid
        .newTx()
        .collectFrom(utxos)
        .payToAddress('', { ['lovelace']: 5_000_000n })
        .mintAssets({ [unit]: 6900000000n })
        .attachMetadata(20, cip20Metadata)
        .attachMetadata(721, cip721Metadata)
        .validTo(Date.now() + 100000)
        .attachMintingPolicy(mintingPolicy)
        .complete();

    
    const partial = await policyLucid.fromTx(tx.toString()).partialSign();
    const partialTx = await tx.assemble([partial]).complete();

    return { tx: partialTx.toString() };
}

async function awaitTx(txHash: string, checkInterval = 3000): Promise < boolean > {
    return new Promise((res) => {
        const confirmation = setInterval(async () => {
            try {
                const txs = await blockfrost.txs(txHash);
                if (txs.block) {
                    clearInterval(confirmation);
                    await new Promise((res) => setTimeout(() => res(1), 1000));
                    return res(true);
                }
            } catch (e) { 
                console.log('Transaction lookup error.', e);
            }
        }, checkInterval);
    });
}

function createProjectMintPolicy(command: CreatePolicyCommand, scriptType: string, policyId: string): CreateProjectMintPolicyCommand {
    return {
        projectId: projects[0].id,
        prefix: command.prefix,
        type: scriptType,
        secretKey: randomUUID(),
        beforeTime: command.before,
        afterTime: command.after,
        policyId: policyId
    };
}

async function createNativePolicyScript(command: CreatePolicyCommand): Promise<PolicySecrets> {
    const scriptLucid = await newLucid();
    const mnemonic = scriptLucid.utils.generateSeedPhrase()
    const wallet = scriptLucid.selectWalletFromSeed(mnemonic);

    let beforeSlot = undefined;
    if (command.before) {
        beforeSlot = scriptLucid.utils.unixTimeToSlot(command.before.getTime());
    }

    let afterSlot = undefined;
    if (command.after) {
        afterSlot = scriptLucid.utils.unixTimeToSlot(command.after.getTime());
    }

    const nativeScript = await createNativeScript(beforeSlot, afterSlot, scriptLucid);
    const mintingPolicy: MintingPolicy = scriptLucid.utils.nativeScriptFromJson(nativeScript);
    const policyId = scriptLucid.utils.mintingPolicyToId(mintingPolicy);
    
    return { nativeScript, mnemonic, policyId};
}

async function createNativeScript(beforeSlot: number | undefined, afterSlot: number | undefined, scriptLucid: Lucid) : Promise<NativeScript> {
    let nativeScript: NativeScript;
    const { paymentCredential } = scriptLucid.utils.getAddressDetails(
        await scriptLucid.wallet.address(),
      );
    if (beforeSlot && afterSlot) {
        nativeScript = {
            type: 'all',
            scripts: [
                {
                    type: 'before',
                    slot: beforeSlot,
                },
                {
                    type: 'after',
                    slot: afterSlot,
                },
                {
                    type: 'sig',
                    keyHash: paymentCredential?.hash,
                }
            ]
        };
    } else if (beforeSlot) {
        nativeScript = {
            type: 'all',
            scripts: [
                {
                    type: 'before',
                    slot: beforeSlot,
                },
                {
                    type: 'sig',
                    keyHash: paymentCredential?.hash,
                }
            ]
        };
    } else if (afterSlot) {
        nativeScript = {
            type: 'all',
            scripts: [
                {
                    type: 'after',
                    slot: afterSlot,
                },
                {
                    type: 'sig',
                    keyHash: paymentCredential?.hash,
                }
            ]
        };
    } else {
        nativeScript = {
            type: 'all',
            scripts: [
                {
                    type: 'sig',
                    keyHash: paymentCredential?.hash,
                }
            ]
        };
    }
    return nativeScript;
}
