// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Box, Dialog, List, ListItem, ListItemText, Typography } from '@mui/material';
import { AirdropBatch } from './AirdropBatchList';
import useSWR from "swr";
import { useAxios } from "../../../providers/axios";

export interface AirdropNft {
  id: number;
  airdropBatchId: string;
  address: string;
  metadata: any;
}

interface AirdropBatchDialogProps {
  batch: AirdropBatch;
  open: boolean;
  onClose: () => void;
}

export default function AirdropBatchDetailDialog({ open, onClose, batch }: AirdropBatchDialogProps) {


  const { get } = useAxios();
    
  const { data, error, isLoading} = useSWR(`assets/batch/${batch.id}`, get);

  if(isLoading) return <div></div>
  if(error) return <Typography variant="h5" color="text.secondary">Error...</Typography>

  return (
    <Dialog open={open} onClose={onClose}>
      <Box
        sx={{
          padding: 2,
          display: 'flex',
          flexDirection: 'row',
          gap: 2,

        }}
      >
        {data?.airdropBatch &&
          <Box>
            <Typography variant="h4">
              ID: {batch.id}
            </Typography>
            <Typography variant="h5">
              Status: {batch.status}
            </Typography>
            <List>
              {data?.airdropBatch?.airdropNfts?.map((nft: AirdropNft) => (
                <ListItem key={nft.id}>
                  <ListItemText
                    primary={`Address: ${nft.address}`}
                    secondary={`Metadata: ${JSON.stringify(nft.metadata)}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        }

      </Box>
    </Dialog>
  );
}