// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { CardanoWallet, useWallet } from "@meshsdk/react";
import { Alert, Autocomplete, Box, Button, TextField } from "@mui/material";
import {useEffect, useState} from "react";
import useSWR from "swr";
import { useAxios } from "../../../providers/axios";
import SbAppbar from "../../layout/SbAppbar";
import AirdropDialog from "./AirdropDialogue";
import {AirdropBatchStatus} from '../../../../components/type/enum';
import AirdropBatchNextButton from "./AirdropBatchNextButton";


interface AirdropDetailUiProps {
    airdropId: string;
}

export default function AirdropBatchUi({ airdropId }: AirdropDetailUiProps) {
  const [airdropOpen, setAirdropOpen] = useState(false);
  const [filter, setFilter] = useState(AirdropBatchStatus.NEW);
  const { connected, wallet } = useWallet();
  const [paymentAddress, setPaymentAddress] = useState('');

    const { get } = useAxios();

    useEffect(() => {
      if (connected) {
        wallet.getChangeAddress().then((address) => {
          setPaymentAddress(address);
        });
      } else {
          setPaymentAddress('');
      }
    }, [connected]);

  const { data, error, isLoading } = useSWR(`assets/airdrop/nfts?airdropId=${airdropId}`, get);
  
  if (isLoading) return <Alert variant="standard" color="info">Loading...</Alert>
  if (error) return <Alert variant="standard" color="error">Error...</Alert>

  console.log(`paymentAddress: ${paymentAddress} connected: ${connected} airdropId: ${airdropId}`);
  return (
    <Box>
      <Box sx={{ mb: 6 }} color="text.secondary">
        <CardanoWallet label="Connect wallet" />
      </Box>
      <Box sx={{ width: "75vw" }}>
        <SbAppbar props={{ title: "Airdrops : " + airdropId, link: "/member/airdrop", buttonName: "Add", onclick: () => setAirdropOpen(true) }} />
      </Box>
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={Object.values(AirdropBatchStatus)}
        defaultValue={AirdropBatchStatus.NEW}
        sx={{ width: 300, mt: 2 }}
        onChange={(event, value) => setFilter(value as AirdropBatchStatus)}
        renderInput={(params) => <TextField {...params} label="Status" />}
      />
      <Box>
        <Alert variant="standard" color="info">
          Number of NFT's to mint {data.remainingNftsCount}.
        </Alert>
        {!connected && (
          <Alert variant="standard" color="info">
            Connect your wallet to start a batch.
          </Alert>
        )}
        {(connected && paymentAddress) && (
          // <Button onClick={() => setFilter(AirdropBatchStatus.NEW)}>Start Next Batch</Button>
            <AirdropBatchNextButton airdropId={airdropId} connected={connected} paymentAddress={paymentAddress} wallet={wallet} />
        )}
      </Box>
      <AirdropDialog open={airdropOpen} onClose={() => setAirdropOpen(false)} airdropId={airdropId} />
    </Box>

  )
}