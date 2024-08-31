// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React, { createContext, use, useCallback, useContext, useEffect, useState } from "react";
import { useEpochs } from "./EpochsProvider";
import useSWR from "swr";
import { useAxios } from "../axios";
import {usePolicies} from "./PolicyProvider";

const UserRewardsContext = createContext<any>(undefined);

export const UserRewardsProvider = ({ children }: any) => {
    const { get } = useAxios();
    const { epoch } = useEpochs();
    const [epochId, setEpochId] = useState<string>("");
    const{ data, isLoading } = useSWR(epochId ? [`reward/epoch`, epochId] : null, getData);
    const { json : allPolicies } = usePolicies();

    const allPoliciesList = allPolicies();

    useEffect(() => {
      const targetEpochId = (epoch && epoch.status === "rewarded") ? epoch.id : "";
        if (targetEpochId !== epochId) setEpochId(targetEpochId);
    }, [epoch]);

    async function getData(params: string[]) {
      return get(`${params[0]}/${params[1]}`);
    }

    function json() {
        if (!isLoading && !!data) return JSON.parse(data);
    }

    function ledgers() {
      const rewards = json();
      if (!rewards) return [];

      return rewards?.rewardAccount?.ledgers ?? [];
    }

    function policies() {
      const rewards = json();
      if (!rewards) return [];

      //reducer to subtotal by policyId
      let policies:any = [];
      rewards?.rewardAccount?.ledgers?.reduce(function(res: any, value: any) {
        if (!res[value.asset.policyId]) {
          res[value.asset.policyId] = { policyId: value.asset.policyId, totals: [], ledgers: [] };
          policies.push(res[value.asset.policyId])
        }
        if (!res[value.asset.policyId].totals[value.policyId]) {
          res[value.asset.policyId].totals[value.policyId] = { policyId: value.policyId, amount: BigInt(0) };
        }
        res[value.asset.policyId].totals[value.policyId].amount += BigInt(value.amount);
        res[value.asset.policyId].ledgers.push(value);
        return res;
      }, {});

      allPoliciesList[0].map((policy:any) => {
            if (policy.type == 'REWARD' && !policies.find((p:any) => p.policyId === policy.policyId)) {
              policies.push({ policyId: policy.policyId, totals: [], ledgers: [] });
            }
      });
      
      return policies;
    }

    function received() {
      const rewards = json();
      if (!rewards || !rewards.summary) return [];
      return rewards.summary;
    }

  const value = {
    data,
    json,
    policies,
    received,
    ledgers,
    isLoading
  };

  return (
    <UserRewardsContext.Provider value={value}>
      {children}
    </UserRewardsContext.Provider>
  );
};

export const useUserRewards = () => useContext(UserRewardsContext);
