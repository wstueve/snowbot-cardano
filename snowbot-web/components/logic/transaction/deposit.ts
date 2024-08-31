// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { randomUUID } from "crypto";
import { projects } from "../../metadata/project";
import { CreateProjectWalletCommand, DepositAssetCommand, SaveWalletSeedCommand } from "../../type/transaction";
import { newLucid } from "../../cardano/blockfrost";
import { saveWalletSeed } from "../../aws/secrets";
import { createProjectWallet, getProjectWallet } from "../../../components/db/transaction";
import { ProjectWallet } from "@prisma/client";
import { fromUnit } from "lucid-cardano";

export async function handleCreateProjectWallet(policyId: string) {

    const _projectWallet = await getProjectWallet(projects[0].id, policyId);

    if(_projectWallet) {
        throw new Error("Project wallet already exists");
    }

    const createWalletCommand = createProjectWalletCommand(policyId);
    const projectWallet = await saveProjectWallet(createWalletCommand);
    return projectWallet;
}

export async function handleGetProjectWallet(policyId: string) {
    const projectWallet = await getProjectWallet(projects[0].id, policyId);
    return projectWallet;
}

async function saveProjectWallet(createProjectWalletCommand: CreateProjectWalletCommand) {
    //generate the new secret seed phrase
    const projectLucid = await newLucid();
    const mnemonic = projectLucid.utils.generateSeedPhrase()
    const wallet = projectLucid.selectWalletFromSeed(mnemonic);
    
    const saveWalletSeedCommand = createSaveWalletSeedCommand(mnemonic, createProjectWalletCommand);
    await saveWalletSeed(saveWalletSeedCommand);

    //get the address from the secret
    const address = await projectLucid.wallet.address();

    //save the project wallet to the database
    const projectWallet: ProjectWallet = {
        id: randomUUID(),
        address: address,
        projectId: createProjectWalletCommand.projectId,
        policyId: createProjectWalletCommand.policyId,
        secretKey: createProjectWalletCommand.secretKey
    }

    await createProjectWallet(projectWallet);

    //return the project wallet
    return projectWallet;
}

function createSaveWalletSeedCommand(mnemonic: string, createProjectWallet: CreateProjectWalletCommand): SaveWalletSeedCommand {
    const words = mnemonic.split(" ");
    const splits = words.length / createProjectWallet.secretKey.length;
    const saveWalletSeedCommand: SaveWalletSeedCommand = {
        chunks: []
    };
    for (let i = 0; i < createProjectWallet.secretKey.length; i++) {
        const secret : string = words.slice(i * splits, (i + 1) * splits).join(" ");
        saveWalletSeedCommand.chunks.push({
            secretId: createProjectWallet.secretKey[i],
            seedChunk: secret
        });
    }
    return saveWalletSeedCommand;
}

function createProjectWalletCommand(policyId: string): CreateProjectWalletCommand {
    const keys = Array(parseInt(process.env.SECRETS_SPLITS ?? "2")).fill(0).map(() => randomUUID());
    return {
        projectId: projects[0].id,
        secretKey: keys.join(" "),
        policyId: policyId
    };
}

export async function createDepositTx(depositAssetCommand: DepositAssetCommand) {
    // get the project wallet - get by policy id
    const { policyId, assetName, name, label } = fromUnit(depositAssetCommand.unit);
    console.log(`Policy ID: ${policyId}, Asset Name: ${assetName}, Name: ${name}, Label: ${label}`)
    const projectWallet = await getProjectWallet(projects[0].id, policyId);

    const userLucid = await newLucid();
    userLucid.selectWalletFrom({ address: depositAssetCommand.paymentAddress });
    
    const tx =
        userLucid.newTx()
            .validTo(Date.now() + 100000)
            .payToAddress(projectWallet.address, { [depositAssetCommand.unit]: depositAssetCommand.amount })
            .complete();
    
    return tx;    
}
