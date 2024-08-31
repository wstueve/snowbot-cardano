// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React from "react";
import { MemberLayout } from "../../components/layouts/MemberLayout";
import { AccumulatingRewardsProvider, EpochsProvider, PoliciesProvider, UserRewardsProvider } from "../../components/providers/reward";
import EpochSummary from "../../components/ux/rewards/EpochSummary";
import EpochTitle from "../../components/ux/rewards/EpochTitle";
import UserTitle from "../../components/ux/rewards/UserTitle";
import UserSummary from "../../components/ux/rewards/UserSummary";
import LedgerTitle from "../../components/ux/rewards/LedgerTitle";
import LedgerDetail from "../../components/ux/rewards/LedgerDetail";
import AccumulatingTitle from "../../components/ux/rewards/AccumulatingTitle";
import AccumulatingSummary from "../../components/ux/rewards/AccumulatingSummary";
import AccumulatingDetail from "../../components/ux/rewards/AccumulatingDetail";
import AccumulatingDetailTitle from "../../components/ux/rewards/AccumulatingDetailTitle";
import { Box } from '@mui/material'

export default function Rewards() {
  return (
    <MemberLayout>
      <EpochsProvider>
        <PoliciesProvider>
          <UserRewardsProvider>
            <AccumulatingRewardsProvider>
              <Box className="mt-4">
                <EpochTitle />
                <EpochSummary />
                <AccumulatingTitle />
                <AccumulatingSummary />
                <AccumulatingDetailTitle />
                <AccumulatingDetail />
                <UserTitle />
                <UserSummary />
                <LedgerTitle />
                <LedgerDetail />
              </Box>
            </AccumulatingRewardsProvider>
          </UserRewardsProvider>
        </PoliciesProvider>
      </EpochsProvider>
    </MemberLayout>
  );
}
