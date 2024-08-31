// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { useWallet } from "@meshsdk/react";
import { useAxios } from "../../providers/axios";
import { useId, useState } from "react";

export function DepositToProject() {
    const { post } = useAxios();
    const { wallet, name } = useWallet();
    const amountId = useId();
    const [amount, setAmount] = useState(1n);

    const deposit = async (): Promise<any> => {
        const address = await wallet.getUsedAddress();
        console.log("Address", address.to_bech32());
        const depositCommand = {
            amount: amount.toString(),
            paymentAddress: address.to_bech32(),
            unit: '38e92ba6a6def9da88d310f7daff9a232d3816e0460db47b47cdedc974534b454c4c41' //skella
        };

        const posted = await post("tx/deposit", depositCommand);
        console.log("Posted", posted);
        return posted.tx;
    }

    const handleDeposit = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const depositTx = await deposit();
            const signedTx = await wallet.signTx(depositTx);
            wallet.submitTx(signedTx);

            // const lucid: Lucid = await Lucid.new();
            // const api = await window.cardano[name].enable();
            // lucid.selectWallet(api)
            // const tx = lucid.fromTx(depositTx);
            // console.log("unsigned tx", tx);
            // const signedTx = await tx.sign().complete();
            // const txHash = signedTx.submit();
            // ;
        } catch (err: any) {
            console.log("Error depositing", err);
            const message = err.response?.data?.message ?? "An error occurred while capturing rewards. Please contact support if the error persists.";
            console.log("Error message", message);
        }
    }

    return (
        <div>
            <div>&nbsp;</div>
            <div>
                <input
                    type="text"
                    minLength={1}
                    maxLength={15}
                    className="text-gray-900"
                    id={amountId}
                    value={amount.toString()}
                    onChange={e => setAmount(BigInt(e.target.value))}
                ></input>
            </div>
            <div>&nbsp;</div>
            <div>
                <button
                    onClick={handleDeposit}
                    className="ml-4 pl-1 text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                >
                    Deposit
                </button>
            </div>
        </div>
    );

}