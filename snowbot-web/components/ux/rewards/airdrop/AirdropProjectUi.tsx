// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Transaction } from "@meshsdk/core";
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { Box, Button, Card, CardContent, Grid, Link as MuiLink, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import useSWR from "swr";
import { useAxios } from "../../../providers/axios";
import SbAppbar from "../../layout/SbAppbar";
import AirdropDialog from "./AirdropDialogue";
import AirdropProjectDialog from "./AirdropProjectDialog";

export interface AirdropProject {
    id: string;
    name: string;
    policyId: string;
    script: object;
}

export default function AirdropUi() {

    const { get, post, del  } = useAxios();
    
    const { connected, wallet } = useWallet();
    const [open, setOpen] = useState(false);
    const [generatedAddresses, setGeneratedAddresses] = useState<string[]>([]);
    const [numberOfAddresses, setNumberOfAddresses] = useState(100);
    const [airdropOpen, setAirdropOpen] = useState(false);

    const { data, error, isLoading } = useSWR(`assets/airdrop`, get);

    if (isLoading) return <div>Loading...</div>
    if (error) return <div>Error...</div>

    const handleCloseDialog = () => {
        setOpen(false);
    };

    const removeProject = async (e: any, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Remove project", id);
        await del(`assets/airdrop/${id}`);
        return true;
    };

    const generateAddresses = async () => {
        try {
            const command = {
                count: numberOfAddresses
            };
            const response = await post("address/batch", command);
            setGeneratedAddresses(response.data.map((addressSeedPhrase: any) => `${addressSeedPhrase.address}, ${addressSeedPhrase.seedPhrase}`).join("\n"));
        } catch (err: any) {
            console.log("Error generating addresses", err);
        }
    }

    const handleNumberOfAddressesChange = (e: any) => {
        try {
            setNumberOfAddresses(e.target.value);
        }
        catch (err: any) {
            console.log("Error setting number of addresses", err);
        }
    }

    return (
        <Box>

            <Box className="flex flex-col" sx={{ width: "75vw" }}>
                <SbAppbar props={{ title: "Airdrops", buttonName: "Create", onclick: () => setOpen(true) }} />
                <Grid container sx={{ padding: 1, justifyContent: 'center' }}>
                    {data?.airdrops?.map((airDropProject: AirdropProject) => {
                        return (
                            <Card key={airDropProject.policyId} id={airDropProject.policyId} sx={{ maxWidth: 300, minHeight: 140, margin: 1, padding: 2 }}>
                                <CardContent>
                                    <MuiLink>
                                        <Link href={`/member/airdrop/${airDropProject.id}`}>
                                            <Typography className={"py-4"} sx={{ display: 'flex', justifyContent: 'center' }}>
                                                {airDropProject.name}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {airDropProject.policyId}
                                            </Typography>
                                        </Link>
                                    </MuiLink>
                                </CardContent>

                                <Box className="flex-1 float-right">
                                    <FaRegTrashAlt
                                        title={"Delete this project."}
                                        className={"cursor-pointer"}
                                        onClick={(e) => removeProject(e, airDropProject.id)}
                                    />
                                </Box>
                            </Card>
                        );
                    })}
                </Grid>
            </Box>
            <Box>
                <Box>
                    <TextField label="Number of Addresses" fullWidth placeholder="[1-2000]" type="number" inputProps={{ min: 1, max: 2000 }} onChange={handleNumberOfAddressesChange} value={numberOfAddresses} />
                </Box>
                <Box>
                    <Button onClick={() => generateAddresses()}>Generate Addresses</Button>
                    <TextField label="Address, Seed Phrase" fullWidth multiline rows={4} disabled={true} value={generatedAddresses} />
                </Box>
            </Box>
            <AirdropProjectDialog open={open} onClose={handleCloseDialog} />
            <AirdropDialog open={airdropOpen} onClose={() => setAirdropOpen(false)} airdropId="" />
        </Box>

    )
}
