// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { ISODateString } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import { NextRouter, useRouter } from "next/router";
import React, { createContext, useContext, useEffect } from "react";

export type AuthenticatedUserContextType = {
    user?: {
        name?: string | null
        image?: string | null
      },
    expires?: ISODateString,
    selectedMenu?: string,
    setSelectedMenu?: any,
    isLoggedIn: () => boolean,
    isAdmin: () => boolean,
    handleLogout?: any,
    router?: NextRouter,
    session?: ReturnType<typeof useSession>
};

const AuthenticatedUserContext = createContext<AuthenticatedUserContextType | undefined>(undefined);

const AuthenticatedUserProvider = ({ children } : any) => {
    const session = useSession();
    const router = useRouter();
    const [authenticatedUser, setAuthenticatedUser] = React.useState<AuthenticatedUserContextType | undefined>();
    const [selectedMenu, setSelectedMenu] = React.useState();

  const handleLogout : () => Promise<void> = async () => {
    await signOut();
  };
  
  const isLoggedIn = (session:any)=>(session?.status === "authenticated");

  const isAdmin = (session:any)=>(isLoggedIn(session) && session.data?.user?.isAdmin);

  useEffect(() => {

    if (!session || session.status !== "authenticated") {
      if (session.status === "loading") {
        return;
      }
      router.push("/");
      return;
    }

      const authUser : AuthenticatedUserContextType = {
        user: {
            name: session.data?.user?.name,
            image: session.data?.user?.image
        },
        expires: session.data?.expires,
        selectedMenu, 
        setSelectedMenu, 
        isLoggedIn: () => isLoggedIn(session),
        isAdmin: () => isAdmin(session),
        handleLogout,
        session,
        router
    };
    setAuthenticatedUser(authUser);

    }, [session.status]);

    return isLoggedIn(session) && (<AuthenticatedUserContext.Provider value={authenticatedUser}>{children}</AuthenticatedUserContext.Provider>);
}

const useAuthenticatedUser = () => useContext(AuthenticatedUserContext);
export { AuthenticatedUserProvider, useAuthenticatedUser };