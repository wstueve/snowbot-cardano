// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Transaction } from "@meshsdk/core";
import { useWallet } from "@meshsdk/react";
import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText } from "@mui/material";
import { useState } from "react";
import { FaSnowflake, FaTrash } from "react-icons/fa";
import { useAxios } from "../../../providers/axios";
import AirdropBatchDetailDialog from "./AirdropBatchDetailDialog";

export interface AirdropBatch {
    id: string;
    airdropId: string;
    txId: string;
    status: string;
}

export interface AirdropBatchListProps {
    airdropBatchs: AirdropBatch[];
}

export default function AirdropBatchList({ airdropBatchs }: AirdropBatchListProps) {
    const { connected, wallet } = useWallet();
    const { put } = useAxios();
    const [open, setOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<AirdropBatch | null>(null);

    const handleClose = () => {
        setOpen(false);
    }

    const deleteBatch = async (batch: AirdropBatch) => {
        //delete batch api endpoint
    }

    const airdop = async (batchId: string) => {
        try {
            if (connected) {
                const tx = new Transaction({ initiator: wallet });
                tx.setChangeAddress(await wallet.getChangeAddress());
                tx.setRequiredSigners([(await wallet.getRewardAddresses())[0]]);
                const address = await wallet.getUsedAddress();

                const command = {
                    paymentAddress: address.to_bech32()
                };

                const response = await put(`assets/batch?batchId=${batchId}`, command);

                const signedTx = await wallet.signTx(response.tx, true);
                wallet.submitTx(signedTx);
            }
        } catch (err: any) {
            const message = err.response?.data?.message ?? "An error occurred while capturing rewards. Please contact support if the error persists.";
            console.log("Error message", message);
        }
    };
    return (
        <List>
            {airdropBatchs?.map((batch) => (
                <>
                    <ListItem key={batch.id} onClick={() => {
                                setSelectedBatch(batch);
                                setOpen(true);
                            }}>
                        <ListItemText
                            primary={`Batch: ${batch.id}`}
                            secondary={`status: ${batch.status}`}
                        />
                        <ListItemSecondaryAction>
                            <IconButton size="small" edge="end" aria-label="info" sx={{ m: 1 }} onClick={() => deleteBatch(batch)} >
                                <FaTrash />
                            </IconButton>
                            <IconButton size="small"  edge="end" aria-label="airdrop" sx={{ m: 1 }} onClick={() => airdop(batch.id)} disabled={!connected || batch.status !== 'new'}>
                                <FaSnowflake />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                    {selectedBatch && <AirdropBatchDetailDialog batch={selectedBatch} open={open} onClose={handleClose} />}
                </>

            ))}
        </List>
    );
}