// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React, { useEffect, useState } from "react";
import { useWallet } from "@meshsdk/react";
import { useUserWallet } from "../providers/wallet";
import { Button, Typography } from '@mui/material';

export default function AddUserWalletButton() {
    const { connected, wallet } = useWallet();
    const { addConnectedWallet } = useUserWallet();
    const { userWallets } = useUserWallet();
    const [connectedAddress, setConnectedAddress] = useState("");

    useEffect(() => {
        if (connected) {
            (async () => {
                const address = (await wallet.getRewardAddresses())[0];
                if (address !== connectedAddress) {
                    setConnectedAddress(address);
                }
            })();
        } else {
            setConnectedAddress("");
        }   
    }, [connected, wallet]);

    const isAdded = !!userWallets?.find((userWallet: any) => userWallet?.rewardAddress === connectedAddress);
    return (
        <>
            {isAdded ?
                (<Typography>Connected wallet staked to account.</Typography>)
                : (<>
                    {connected && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={addConnectedWallet}
                        >
                            Stake Wallet
                        </Button>
                    )}
                </>)
            }
        </>
    )
}
