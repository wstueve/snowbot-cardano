// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { FormEvent, useState } from 'react';
import { Dialog, TextField, Button, Box, Typography } from '@mui/material';
import { useAxios } from '../../../providers/axios';
import { AddBulkAirdropNftCommand } from "../../../type/airdrop";

interface AirdropDialogProps {
  open: boolean;
  onClose: () => void;
  airdropId: string;
}

export default function AirdropDialog({ open, onClose, airdropId }: AirdropDialogProps) {
  const { post } = useAxios();

  const [metaData, setMetaData] = useState('');
  const [wallets, setWallets] = useState('');

  const handleSubmit = async (event: FormEvent<any>) => {
    event.preventDefault();

    const metaDataList = metaData.indexOf('[') === 0
      ? JSON.parse(metaData)
      : JSON.parse("[" + metaData + "]");
    
    console.log(wallets);
    const walletList =
      wallets.indexOf(',') <0
        ? wallets.split("\n").map(s => s.trim())
        : wallets.split(',').map(s => s.trim());

    if (metaDataList.length !== walletList.length) {
      alert('Meta Data and Wallets must have the same length');
      return;
    }

    const payloadCommand: AddBulkAirdropNftCommand = {
      airdropId: airdropId,
      addresses: walletList,
      metadata: metaDataList
    };

    await post('assets/batch', payloadCommand);
    onClose();
  };

  const updateMetaData = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMetaData(event.target.value);
  }

  const updateAddresses = (event: React.ChangeEvent<HTMLInputElement>) => {
    const wallets = event.target.value?.replace(/[\r\t' "]+/g, '');
    setWallets(wallets);
  }


  return (
    <Dialog open={open} onClose={onClose}>
      <Typography variant="h6" component="div" sx={{ p: 2 }}>
        Add list of your meta data & destination wallet addresses separated by comma
      </Typography>
      <Box
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
          <TextField label="Meta Data List" fullWidth multiline rows={10} sx={{ m: 1 }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              updateMetaData(event);
            }} />

          <TextField label="Wallet List" fullWidth multiline rows={10} sx={{ m: 1 }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              updateAddresses(event);
            }} />

          <Button type="submit" sx={{ m: 2 }}>Batch</Button>
        </Box>
      </Box>
    </Dialog>
  );
}