// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React from "react";
import Head from "next/head";
import { MemberLayout } from "../../components/layouts/MemberLayout";
import { CardanoWallet } from "@meshsdk/react";
import { UserWalletProvider } from "../../components/providers/wallet";
import { DepositToProject } from "../../components/ux/tx/DepositToProject";
import { ProjectWallet } from "../../components/ux/tx/ProjectWallet";
import { getSession } from "next-auth/react";

export async function getServerSideProps({ req }: { req: any }) {

  const session = await getSession({ req: req });

  if (session && session.user && session.user.isAdmin) {
    return {
      props: {},
    };
  }

  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };

}

export default function Admin() {
    return (
    <MemberLayout>
      <UserWalletProvider>
        <Head>
          <title>Snowbot Cardano Experience - Project Admin</title>
          <meta name="description" content="Snowbot NFT web3 application. Fun, games, staking and art." />
        </Head>
        <div className="container">
          <main className="main bg-gray-800">
                        <div><CardanoWallet label="Connect Wallet" /></div>
                        <DepositToProject />
                        <div>Your project Wallet</div>
                        <ProjectWallet />
          </main>
        </div>
      </UserWalletProvider>
    </MemberLayout>
  );
}
