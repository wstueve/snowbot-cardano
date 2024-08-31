// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { fromText } from "lucid-cardano";
import { getCompositeSecret } from "../../aws/secrets";
import { newLucid } from "../../cardano/blockfrost";
import { getProjectWallet } from "../../db/transaction";
import { projects } from "../../metadata/project";
import { WithdrawalCommand } from "../../type/transaction";

export async function createWithdrawTx(withdrawalRequest: WithdrawalCommand) {
    const projectWallets = await Promise.all(withdrawalRequest.units.map(async (unit) => {
        return await getProjectWallet(projects[0].id, unit.policyId);
    }));

    const lucids = await Promise.all(projectWallets.map(async (projectWallet) => {
        const innerLucid = await newLucid();
        const seedPhrase = await getCompositeSecret(projectWallet.secretKey);
        innerLucid.selectWalletFromSeed(seedPhrase);
        return innerLucid;
    }));

    const txs = await Promise.all(lucids.map(async (lucid, index) => {
        const unitObj = withdrawalRequest.units[index];
        const unit = unitObj.policyId + fromText(unitObj.name);
        const address = await lucid.wallet.address();
        const utxos = await lucid.utxosAtWithUnit(address, unit);
     
        let spendUtxos = [];
        let totalSpent = BigInt(0);
        for (const utxo of utxos) {
            if (totalSpent >= unitObj.amount) break;
            
            spendUtxos.push(utxo);
            totalSpent += utxo.assets[unit];
        }
        if (totalSpent < BigInt(unitObj.amount.toString())) {
            throw new Error("Not enough funds to cover the withdrawal. Please contact the project owner.");
        }

        const change = totalSpent - BigInt(unitObj.amount.toString());

        const tx = await lucid.newTx()
            .collectFrom(spendUtxos)
            .payToAddress(withdrawalRequest.paymentAddress, { [unit]: unitObj.amount });
        if (change > BigInt(0)) {
            tx.payToAddress(address, { [unit]: change });
        }

        return tx;
    }));

    const userLucid = await newLucid();
    userLucid.selectWalletFrom({ address: withdrawalRequest.paymentAddress });
    let multiSigTx = userLucid.newTx()
        .validTo(Date.now() + 100000)
        .payToAddress(process.env.SNOWBOT_COMMUNITY_WALLET ?? "", { ["lovelace"]: 1_000_000n });
    
    for (const tx of txs) {
        multiSigTx = multiSigTx.compose(tx);
    }

    const txComplete = await multiSigTx.complete();
    

    const witnesses = [];
    for (const lucid of lucids) {
        witnesses.push(await lucid.fromTx(txComplete.toString()).partialSign());
    }

    const partialTx = await txComplete.assemble(witnesses).complete();
    return partialTx;

}