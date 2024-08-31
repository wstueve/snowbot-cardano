// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React from "react";
import { MemberLayout } from "../../components/layouts/MemberLayout";
import { UserWalletProvider } from "../../components/providers/wallet";
import { WithdrawFromProject } from "../../components/ux/tx/WithdrawFromProject";
import { FeatureFlags } from "../../components/metadata/featureFlags";
import TitleCard from "../../components/ux/content/TitleCard";
import { projects } from "../../components/metadata/project";
import { ContentSection } from "../../components/ux/layout/ContentSection";

export async function getServerSideProps({req}: {req: any}) {
  const featureFlags = new FeatureFlags(req.headers.host);
  if (!featureFlags.withdrawals()) {
      return {
          redirect: {
              destination: "/",
              permanent: false,
          },
      };
  }
  return {
      props: {},
  };
}

export default function Balances() {
  return (
    <MemberLayout>
       <UserWalletProvider>
        <div className="mt-4">
          <div className="flex flex-col">
            <TitleCard props={{
              title: `Balances`,
              subheader: `A little $SKELLA can go a long way when you are preparing for battle.`,
              imageProps: {
                src: "/assets/project/Snow Skellies/balances.webp",
                alt: `${projects[0].name} Logo`,
                width: 300,
                height: 300
              },
              backgroundUrl: `/assets/project/${projects[0].name}/hero.png`,
            }} />
            <ContentSection title="Coins" subheader="Manage fungible token balances and withdrawals.">
              <WithdrawFromProject />
            </ContentSection>
          </div>
        </div>
        </UserWalletProvider>
    </MemberLayout>
  );
}
