// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React from "react";
import CoinList from "../coins/CoinList";
import {useEpochs, usePolicies, useUserRewards} from "../../providers/reward";
import PolicyTitle from "./PolicyTitle";

export default function UserSummary () {
    const { epoch } = useEpochs();
    const {     
      isLoading,
      policies,
      received,
    } = useUserRewards();

    if (isLoading) return <div>Loading...</div>

    const rewardsReceived = received();
    const userPolicies = policies();

    return epoch?.status === "rewarded" && (
        <div className="mt-1 border-t border-slate-500">
            <div className="mt-4">
                <div>
                    {userPolicies.map((policy:any, index: number) => (
                        <div className="flex mb-4 bg-transparent px-4 py-2 sm:px-6 flex-wrap">
                            <PolicyTitle reward={policy} index={index.toString()} />
                        </div>)
                    )}
                </div>
                <div className="flex mb-4 px-4 py-2 sm:px-6 flex-wrap">
                        <div className="text-sm text-slate-500 w-3/4">{rewardsReceived.length > 1 ? "Totals":"Total"}</div>
                        <div className="flex flex-col items-end text-sm text-slate-500 w-1/4">
                            <CoinList list={rewardsReceived.map((r:any) => ({policyId: r.policyId, amount: r.totalamount}))}
                                className="text-slate-100"
                            />
                        </div>
                    </div>
            </div>
        </div>
    );
}