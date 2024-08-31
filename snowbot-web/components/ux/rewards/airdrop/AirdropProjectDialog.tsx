// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { FormEvent, useState } from 'react';
import { Dialog, TextField, Button, Box } from '@mui/material';
import { useAxios } from "../../../providers/axios";

type createAirdropPayload = {
  name: string;
  policyId: string;
  policyScript: string;
  skey: string;
};

export default function AirdropProjectDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [airdropName, setAirdropName] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [script, setScript] = useState('');
  const [skey, setSkey] = useState('');

  const { post } = useAxios();
  
  const handleSubmit = async (event: FormEvent<any>) => {
    event.preventDefault();
    // Add your form submission logic here

    const payload: createAirdropPayload = {
      name: airdropName,
      policyId: policyId,
      policyScript: JSON.stringify(JSON.parse(script)),
      skey: JSON.stringify(JSON.parse(skey))
    };

    await post(`assets/airdrop`, payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Box
        sx={{
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
          <TextField label="Airdrop Name" fullWidth onChange={(e) => setAirdropName(e.target.value)} required />
          <TextField label="Policy Id" fullWidth onChange={(e) => setPolicyId(e.target.value)} required />
          <TextField label="Script" fullWidth multiline rows={4} onChange={(e) => setScript(e.target.value)} required/>
          <TextField label="Skey" fullWidth multiline rows={4} onChange={(e) => setSkey(e.target.value)} required/>

          <Button type="submit" sx={{ m: 2 }} disabled={!airdropName || !policyId || !script || !skey}>Create</Button>
        </Box>
      </Box>
    </Dialog>
  );
}