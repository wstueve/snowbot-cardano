// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { CardanoWallet, useWallet } from "@meshsdk/react";
import React from "react";
import { useAxios } from "../providers/axios";
import { Address } from "@emurgo/cardano-serialization-lib-nodejs";
import { Transaction } from "@meshsdk/core";

export function MintPoc() {
    const { post } = useAxios();
    const { wallet } = useWallet();

    const mintNft = async (): Promise<any> => {
        const address : Address = await wallet.getUsedAddress();
        console.log("Address", address.to_bech32());
        const mintAssetCommand = {
            amount: 1,
            paymentAddress: address.to_bech32(),
            authorizationCode: "authorizationCode"
        };
    
        const posted = await post("assets/mint", mintAssetCommand);
        console.log("Posted", posted);
        return posted.mintTx;
    }
    
    const handleMint = async (e: any) => {
        e.preventDefault();
        e.stopPropagation();
    
            try {
                const mintNftTx = await mintNft();
                console.log("Minted NFT", mintNftTx);
                const signedTx = await wallet.signTx(mintNftTx.tx, true);
                wallet.submitTx(signedTx);
            } catch (err: any) {
                console.log("Error minting asset", err);
                const message = err.response?.data?.message ?? "An error occurred while capturing rewards. Please contact support if the error persists.";
                console.log("Error message", message);
            }
    }
    
   

   return (
    <div className="container">
    <main className="main bg-gray-800">
      <p><CardanoWallet label="Connect Wallet" /><br/><br/></p>
      <p><button onClick={handleMint}>Mint</button><br/><br/></p>
    </main>
  </div>
);
}