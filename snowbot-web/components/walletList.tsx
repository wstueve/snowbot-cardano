// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { FaConnectdevelop, FaRegTrashAlt } from "react-icons/fa";
import { useUserWallet } from "./providers/wallet";
import { useWallet } from "@meshsdk/react";
import { useEffect, useState } from "react";
import { useIntl } from 'react-intl';
import { Box, Typography, Card, CardContent, Grid, Link } from '@mui/material';

const WalletList = () => {
  const { remove, userWallets } = useUserWallet();
  const { connected, wallet } = useWallet();
  const [userAddress, setUserAddress] = useState<string | undefined>(undefined);
  const { locale } = useIntl();

  useEffect(() => {
    if (connected) {
      (async () => {
        const addresses = await wallet.getRewardAddresses();
        setUserAddress(addresses[0]);
      })();
    } else {
      setUserAddress(undefined);
    }
  }, [connected, wallet, userWallets]);

  const removeWallet = async (e: any, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to unstake the wallet?")) {
      await remove(id);
    }
    return true;
  };

  return (
    <Box className="flex flex-col">
      {userWallets?.length === 0 ? (
        <div className="card">
          <p>No wallets found.</p>
        </div>
      ) : (
        <Grid container sx={{ padding: 1, justifyContent: 'center' }}>
          {userWallets?.map((userWallet: any) => {
            return (
              <Card key={userWallet.id} id={userWallet.id} sx={{ maxWidth: 300, minHeight: 140, margin: 1 }}>
                <CardContent>
                  <Link href={`https://pool.pm/${userWallet.rewardAddress}`} target="_blank" rel="noopener noreferrer">
                    <Typography
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {userWallet.rewardAddress}
                    </Typography>
                    <Typography className={"py-4"} sx={{ display: 'flex', justifyContent: 'center' }}>
                      ₳{" "}
                      {(userWallet.balance / 1000000).toLocaleString(locale, {
                        maximumFractionDigits: 2,
                      })}
                    </Typography>
                    <Box className="flex-auto">
                      {userAddress === userWallet.rewardAddress && (
                        <>
                          <Box className="flex-1 float-left">
                            <FaConnectdevelop
                              title={"This wallet is staked."}
                            />
                          </Box>
                        </>
                      )}
                      <Box className="flex-1 float-right">
                        <FaRegTrashAlt
                          title={"Unstake this wallet."}
                          className={"cursor-pointer"}
                          onClick={(e) => removeWallet(e, userWallet.id)}
                        />
                      </Box>
                    </Box>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default WalletList;
