// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import {useAxios} from "../../../providers/axios";
import React, {useEffect, useState} from "react";
import {BrowserWallet, Transaction} from "@meshsdk/core";
import useSWR from "swr";

type CreateNextAirdropBatchCommand = {
    airdropId: string;
    paymentAddress: string;
};

interface AirdropDetailUiProps {
    airdropId: string;
    connected: boolean;
    paymentAddress: string;
    wallet: BrowserWallet;
}

export default function AirdropBatchNextButton({airdropId, connected, paymentAddress, wallet}: AirdropDetailUiProps) {
    const [spinnerLoading, setSpinnerLoading] = useState(false)
    const [awaiting, setAwaiting] = useState(false);

    const [warning, setWarning] = useState("")
    const [info, setInfo] = useState("")
    const [batchId, setBatchId] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const {post, get, put} = useAxios();
    const {data, error, isLoading} = useSWR(txHash ? `/tx/${txHash}` : null, get, {refreshInterval: 10000});

    useEffect(() => {
        const condition = data && !error && !data.isMissing && txHash == data.txHash;
        console.log("txHash", txHash, "condition", condition, "data", data, "error", error, "spinnerLoading", spinnerLoading);

        if (data && !error && !data.isMissing && txHash == data.txHash) {
            console.log("txHash has been confirmed", data);
            setTxHash(null);
            setSpinnerLoading(false);
            setAwaiting(false);
        }

        if (error && error.status === 404) {
            console.log("txHash not found", error);
            setTxHash(null);
            setAwaiting(false);
            setSpinnerLoading(false);
        }

    }, [data, error, isLoading, txHash]);

    const batchNext = async () => {
        try {
            setSpinnerLoading(true);
            const tx = new Transaction({initiator: wallet});

            tx.setChangeAddress(await wallet.getChangeAddress());
            tx.setRequiredSigners([(await wallet.getRewardAddresses())[0]]);

            const command: CreateNextAirdropBatchCommand = {
                airdropId: airdropId,
                paymentAddress: paymentAddress
            }

            const response = await post("assets/batch/next", command);
            // todo: set the batchId here to use for canceling ?? not sure
            const signedTx = await wallet.signTx(response.tx, true);

            const txHash = await wallet.submitTx(signedTx);

            setAwaiting(true);
            setTxHash(txHash);

        } catch (err: any) {
            const message = err.response?.data?.message ?? "An error occurred while creating batches. Please contact support if the error persists.";
            console.error("Error message", message);
            setSpinnerLoading(false);
            setAwaiting(false);
            alert(message);

        }
    }

    const clearWarning = (msg: string) => {
        if (msg === warning) setWarning("");
    }
    const clearInfo = (msg: string) => {
        if (msg === info) setInfo("");
    }

    const handleCancel = async () => {
        if (!batchId) {
            console.error("BatchId not found");
            alert("Not able to cancel batch. Please contact support.");
            return;
        }

        await put(`assets/batch/${batchId}`, {paymentAddress});
        setInfo("Batch Cancelled");
        setWarning("");
        setTimeout(() => clearInfo("Batch Cancelled"), 5000);
    }

    return (
        <Box>
            {connected && (
                <>
                    <Box display="flex" justifyContent="center">
                        {warning && <Alert variant="standard" color="warning">{warning}</Alert>}
                        {info && <Alert variant="standard" color="info">{info}</Alert>}
                    </Box>
                    <Box display="flex" justifyContent="center">
                        <Button onClick={() => batchNext()} disabled={spinnerLoading}>Start Next Batch</Button>
                        {spinnerLoading && (
                            <>
                                <CircularProgress color="secondary"/>
                            </>
                        )}
                        {awaiting && (
                            <>
                                <Alert variant="standard" color="info">Waiting for Tx(s) on Chain</Alert>
                                <Button onClick={() => handleCancel()}>Cancel</Button>
                            </>
                        )}
                    </Box>

                </>
            )}
        </Box>
    )
}