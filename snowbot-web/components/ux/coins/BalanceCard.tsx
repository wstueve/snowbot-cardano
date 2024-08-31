// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { formatIntegerAsDecimal } from '../../util/stringUtil';
import { useIntl } from 'react-intl';

type RewardAccount = {
  id: number;
  accountType: string;
  foreignId: string;
};

type Balance = {
  id: number;
  policyId: string;
  balance: string;
  decimals: number;
  rewardAccountId: number;
  rewardAccount: RewardAccount;
  ticker: string;
};

export default function BalanceCard({ props }: { props: { balance: Balance } }) {
  const theme = useTheme();
  const { locale } = useIntl();
  const { balance } = props;
  const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <CardMedia
          component="img"
          sx={{ width: 151, m: 1 }}
          image={`/assets/images/${balance.policyId}/logo.webp`}
          alt={balance.ticker}
        />

      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h5">
            ${balance.ticker}
          </Typography>
          <Typography variant="body3">
            {Number(formatIntegerAsDecimal(Number(balance.balance), balance.decimals))
              .toLocaleString(locale, {
                minimumFractionDigits: 0,
                maximumFractionDigits: balance.decimals,
              })
            }
          </Typography>
        </CardContent>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Checkbox />
        </CardContent>
      </Box>

    </Card>
  );
}