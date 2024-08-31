// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React from "react";
import { usePolicies } from "../../providers/reward";
import PolicyLogo from "../policy/PolicyLogo";
import CoinList from "../coins/CoinList";
import { Box } from '@mui/material';
import { H6 } from "../layout/H6";
import { Body3 } from "../layout/Body3";

export default function PolicyTitle (props: {reward: any, index: string }) {
    const { 
        reward, 
        index, 
    } = props;

    const {
        retrieve
    } = usePolicies();

    if (!reward) return <div>Loading...</div>

    const policy = retrieve(reward.policyId);
    
    let totals = [];
    for (const key of Object.keys(reward.totals)) {
        totals.push({policyId: reward.totals[key].policyId, amount: reward.totals[key].amount});
    }

    return (
        !!policy && (<div className="flex align-text-top w-full flex-wrap" key={index}>
            <div className="flex flex-row text-sm w-3/4">
                <div className="mt-1 w-1/8">
                    <PolicyLogo policyId={policy.policyId} alt={policy.name} width={60} height={60} className="w-full h-auto" />
                </div>
                <Box className="pl-2 relative w-3/4">
                    <H6>{policy.name}</H6>
                    <Body3>{policy.description}</Body3>
                    <div className="text-blue-500 text-xs">
                        <a href={policy.url} target="_blank" rel="noreferrer">shop</a>
                    </div>
                </Box>
            </div>
            <div className="flex flex-col items-end relative text-slate-100 text-sm w-1/4">
                <CoinList list={totals} />
            </div>
        </div>)
    );
}