// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React, { createContext, useContext, useState } from "react";
import { useAxios } from "../axios";
import useSWR from "swr";

const PoliciesContext = createContext<any>(undefined);

export const PoliciesProvider = ({ children }: any) => {
  const { get } = useAxios();
  const { data, isLoading } = useSWR(`reward/policy/list`, get);
 
  function json() {
    if (!isLoading && !!data) return JSON.parse(data);
  }

  function retrieve(policyId: string) {
    if (!isLoading && !!data) {
      const policies = JSON.parse(data)[0];
      const policy = policies.find((policy: any) => policy.policyId === policyId);
      return policy;
    }
  }

  function rewardPolicies() {
    if (!isLoading && !!data) {
      const policies = JSON.parse(data)[0];
      const list = policies.filter((policy: any) => policy.type === "REWARD");
      return list;
    }
  }

  const value = {
    json,
    retrieve,
    rewardPolicies,
    isLoading
  };

  return (
    <PoliciesContext.Provider value={value}>
      {children}
    </PoliciesContext.Provider>
  );
};

export const usePolicies = () => useContext(PoliciesContext);
