// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { useWallet } from "@meshsdk/react";
import { createContext, useContext, useEffect } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useLocalStorage } from 'usehooks-ts';
import { useAxios } from "../axios";
import { useAuthenticatedUser } from "../user";

const UserWalletContext = createContext<any>(undefined);
export const useUserWallet = () => useContext(UserWalletContext);

export const UserWalletProvider = ({ children }: any) => {
  const [selectedWallet, setSelectedWallet] = useLocalStorage('snowbot-wallet', "none");
  const { post, get, del } = useAxios();
  const { connect, connected, wallet, name } = useWallet();
  const authUser = useAuthenticatedUser();
  const { data: userWallets} = useSWR("user/wallet/list", get);
  const {mutate} = useSWRConfig();



  useEffect(() => {
    if (authUser?.user) {
      reloadUserWallets().then(() => console.log("User wallets reloaded."));
    }
  }, [authUser?.user]);

  useEffect(() => {
    if (connected && (!selectedWallet || selectedWallet === "none" || selectedWallet != name)) {
      setSelectedWallet(name);
    } else if (!connected && selectedWallet !== "none") {
      setSelectedWallet("none");
    }
  }, [connected]);

  useEffect(() => {
    if (!!selectedWallet && selectedWallet !== "none") {
      connect(selectedWallet).then(() => console.log("Connected to Cardano wallet."));
    }
  }, [selectedWallet]);

  const createNonce = async (userAddress: string) => {
    return await post(`nonce/create`, { userAddress });
  };

  const reloadUserWallets = async () => {
    console.log("Reloading user wallets.");
    await mutate("user/wallet/list");
    await mutate("assets/boost");
  };

  const sign = async (userAddress: string, message: string) => {
    try {
      const signature = await wallet.signData(userAddress, message);
      const res = await verifySignature(message, userAddress, signature as string);
      return res.result;
    } catch (error) {
      console.warn("Error signing message.", error);
      throw error;
    }
  };

  const verifySignature = async (
    message: string,
    userAddress: string,
    signature: string
  ) => {
    return await post(`user/wallet/verify`, {
      message,
      userAddress,
      signature,
    });
  };

  const addConnectedWallet = async () => {
    try {
      if (connected) {
        const userAddress = (await wallet.getRewardAddresses())[0];
        const res = await createNonce(userAddress);
        try {
          const isValid = await sign(userAddress, res.nonce);
          if (isValid) {
             await reloadUserWallets();
          } else {
            return Error("Invalid signature.");
          }
        } catch (error: any) {
          if (
            error.message === "user declined to sign data" ||
            error.message === "user declined data"
          ) {
            // TODO: show better alert when connecting wallet is just closed.
            alert("Cancelled.");
          } else {
            alert("Error signing message: " + error.message);
            console.warn("Error signing message.", error);
          }
        }
      }
    } catch (error) {
      console.warn("Error adding user wallet.", error);
      throw error;
    }
  };

  const remove = async (userWalletId: string) => {
    try {
      await del(`user/wallet/${userWalletId}`);
      await reloadUserWallets();
    } catch (error) {
      console.warn("Error removing user wallet.", error);
      throw error;
    }
  };

  const value = {
    userWallets,
    createNonce,
    addConnectedWallet,
    reloadUserWallets,
    remove,
  };

  return (
    <UserWalletContext.Provider value={value}>
      {children}
    </UserWalletContext.Provider>
  );
};
