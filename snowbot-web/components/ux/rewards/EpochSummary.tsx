// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React from "react";
import { useEpochs } from "../../providers/reward";
import CoinList from "../coins/CoinList";
import { dateToLocaleString } from "../../util/dateUtil";
import { Box, Typography } from '@mui/material';

export default function EpochSummary() {
    const {
        epoch,
        isLoading
    } = useEpochs();

    if (isLoading) return <div>Loading...</div>

    return (
        <Box>
            <Box className="flex border-t border-slate-500 bg-transparent px-4 py-2 sm:px-6 flex-wrap">
                <Typography className="text-sm text-slate-500 w-1/4">Rewards</Typography>
                <Typography color="text.primary" variant= "h6" className="text-end pr-4 text-sm w-1/4">{epoch?.status}</Typography>
                <Typography className="text-sm text-slate-500 w-1/4">Start</Typography>
                <Typography color="text.primary" variant= "h6" className="text-end pr-4 w-1/4">{dateToLocaleString(epoch?.startTime)}</Typography>
                <Typography className="text-sm text-slate-500 w-1/4">Rewards Time</Typography>
                <Typography color="text.primary" variant= "h6" className="text-end pr-4 w-1/4">{epoch?.status !== "accumulating" ? dateToLocaleString(epoch?.statusTime) : ""}</Typography>
                <Typography className="text-sm text-slate-500 w-1/4">End</Typography>
                <Typography color="text.primary" variant= "h6" className="text-end pr-4 w-1/4">{dateToLocaleString(epoch?.endTime)}</Typography>
            </Box>
            {epoch?.status === "rewarded" && (<div className="flex mb-4 border-slate-500 bg-transparent px-4 py-2 sm:px-6 flex-wrap w-full">
                <Typography className="text-sm text-slate-500 w-1/4">Distributed</Typography>
                <Typography color="text.primary" variant= "h6" className=" w-1/4">
                    <CoinList list={[{ policyId: epoch?.distributedRewards?.policyId, amount: epoch.distributedRewards?.totalamount }]}
                        className="mr-4"
                    />
                </Typography>
                <Typography className="text-sm text-slate-500 w-1/4">Accumulated</Typography>
                <Typography className="text-sm text-slate-500 w-1/4">
                    <CoinList list={[{ policyId: epoch?.accumulatedRewards?.policyId, amount: epoch.accumulatedRewards?.totalamount }]}
                        className="mr-4"
                    />
                </Typography>
            </div>)}
        </Box>
    );
}