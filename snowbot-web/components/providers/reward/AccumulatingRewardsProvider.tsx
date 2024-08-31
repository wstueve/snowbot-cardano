// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React, { createContext, useContext } from "react";
import useSWR from "swr";
import { useAxios } from "../axios";
import {usePolicies} from "./PolicyProvider";

const AccumulatingRewardsContext = createContext<any>(undefined);

export const AccumulatingRewardsProvider = ({ children }: any) => {
    const { get } = useAxios();
    const{ data, isLoading } = useSWR(`reward/accumulating`, get);
    const { rewardPolicies } = usePolicies();


    function assets() {
      let j: any[] = json();
      if (j) {
        return j.sort((a: any, b: any) => a.policyId.localeCompare(b.policyId));
      }
    }

    function json() {
        if (!isLoading && !!data) return JSON.parse(data);
    }

    function policies() {
        const rps = rewardPolicies();
        if (isLoading || !rps || rps.length <= 0) return [];

        //each asset has a policyId and amount
        //we need to subtotal an amount per reward policy based on the policyId of the asset
        let policies:any = [];
        assets()?.reduce(function(res: any, value: any) {
          if (!res[value.policyId]) {
                res[value.policyId] = { policyId: value.policyId, totals: [], accumulating:[]};
                policies.push(res[value.policyId])
            }

            for (const reward of value.rewards) {
                if (!res[value.policyId].totals[reward.policyId]) {
                    res[value.policyId].totals[reward.policyId] = { policyId: reward.policyId, amount: BigInt(0) };
                }
                res[value.policyId].totals[reward.policyId].amount += BigInt(reward.amount);
            }   
            if (value.balances) {
              for (const bal of value.balances) {
                if (!res[value.policyId].accumulating[bal.policyId]) {
                    res[value.policyId].accumulating[bal.policyId] = { policyId: bal.policyId, amount: BigInt(0) };
                }
                res[value.policyId].accumulating[bal.policyId].amount += BigInt(bal.balance);
              }   
            }

          return res;
        }, {});

      rps.map((policy:any) => {
            if (!policies.find((p:any) => p.policyId === policy.policyId)) {
              policies.push({ policyId: policy.policyId, totals: []});
            }
      });
        return policies;
    }

  const value = {
    data,
    assets,
    policies,
    isLoading
  };

  return (
    <AccumulatingRewardsContext.Provider value={value}>
      {children}
    </AccumulatingRewardsContext.Provider>
  );
};

export const useAccumulatingRewards = () => useContext(AccumulatingRewardsContext);
