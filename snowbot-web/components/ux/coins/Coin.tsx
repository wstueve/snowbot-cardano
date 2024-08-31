// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import {formatIntegerAsDecimal} from "../../util/stringUtil";
import Image from "next/image";
import { usePolicies } from "../../providers/reward/PolicyProvider";
import { Box, Typography } from '@mui/material';

export default function Coin(props: { policyId: string, amount: number | string | BigInt, index: string, className?: string }) {
    const { retrieve } = usePolicies();
    const { policyId, amount, index, className } = props;

    const policy = retrieve(policyId);
    if (!policy) return (<div></div>)

    const numAmount = Number(amount);
    return (
        <li className={className ?? "flex flex-col text-sm items-end"} key={index}>
            <Typography variant="h6" color="text.primary">{formatIntegerAsDecimal(numAmount, policy.decimals)}</Typography>
            <Box color="text.primary" key={index} className="flex flex-row text-xs">
                <Image src={`/assets/images/${policy.policyId}/logo.webp`} alt={policy.ticker} width="15" height="15" className="opacity-70 mr-1" />
               
                ${policy.ticker}
            </Box>
        </li>
    )
}