// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../../../components/db/prisma';
import {signOut} from "next-auth/react";

function unixTimestamp (date = Date.now()) {
    return Math.floor(date / 1000)
}

const refreshToken = async (refreshToken, client_id, client_secret) => {
    const url = `https://discord.com/api/oauth2/token`
    const data = {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: client_id,
        client_secret: client_secret
    }

    const response = await fetch(
        url,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(data)
    });

    const newToken = await response.json()
    if (!!newToken.error) {
        throw new Error(newToken.error)
    }
    return newToken
}

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    callbacks: {
        async signIn({ user, account, profile }) {
            //if we are signing in again, we need to update our account and user information from the provider
            const savedAccount = await prisma.account.findFirst({ where: { userId: user.id, provider: 'discord' } });
            if (savedAccount) {
                await prisma.account.update({
                    where: { id: savedAccount.id },
                    data: { ...account }
                })
            }

            const savedUser = await prisma.user.findFirst({ where: { id: user.id } });
            if (savedUser) {
                await prisma.user.update({
                    where: { id: savedUser.id },
                    data: {
                        name: profile.global_name,
                        email: profile.email,
                        emailVerified: !user.emailVerified && profile.verified ? new Date() : user.emailVerified,
                        image: profile.image_url
                    }
                })
            }
            return true
        },
        async session({ session, user }) {
            if (session?.user) {
                session.user.id = user.id;
                const account = await prisma.account.findFirst({ where: { userId: session.user.id, provider: 'discord' } });
                if (!account) {
                    console.warn("No account found for user", session.user.id)
                    await prisma.session.deleteMany({where: {userId: session.user.id}});
                    await signOut();
                    return null;
                }
                
                session.user.providerId = account.providerAccountId;

                const roles = await prisma.userRole.findMany({
                    where: { userId: session.user.id },
                    include: { role: true }
                }) ?? [];

                session.user.roles = roles.map(r => r.role.name);
                session.user.isAdmin = session.user.roles.includes("admin") ?? false;

                if (account.expires_at <= unixTimestamp()) {
                    try {
                        const newToken = await refreshToken(account.refresh_token, process.env.DISCORD_CLIENT_ID, process.env.DISCORD_CLIENT_SECRET)

                        account.access_token = newToken.access_token
                        account.expires_at = unixTimestamp() + newToken.expires_in
                        account.refresh_token = newToken.refresh_token

                        await prisma.account.update({
                            where: {id: account.id},
                            data: {
                                access_token: account.access_token,
                                expires_at: account.expires_at,
                                refresh_token: account.refresh_token
                            }
                        })
                    }
                    catch (e) {
                        console.warn("Failed to refresh token", e)
                        if (e.message === "invalid_grant") {
                            //only update where the refresh token is the same. multiple requests could have been made
                            //so, the account will ignore any requests after the first one. But if the token is really
                            //invalid, then we need to revoke the session
                            const updatedAccount = await prisma.account.update({
                                where: {
                                    id: account.id,
                                    refresh_token: account.refresh_token
                                },
                                data: {
                                    access_token: null,
                                    expires_at: null,
                                    refresh_token: null
                                }
                            })
                            if (!!updatedAccount) {
                                //revoke any active sessions
                                await prisma.session.deleteMany({where: {userId: session.user.id}});
                                await signOut();
                                return null;
                            }
                        }
                    }
                }

                //sync the session expiration with the discord token expiration
                const accountExpirationDate = new Date(account.expires_at * 1000)
                if (session.expires !== accountExpirationDate) {
                    session.expires = accountExpirationDate
                }
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/"))
                return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl)
                return url;
            return baseUrl;
        }
    },
    providers: [
        DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            authorization: { params: { scope: 'identify email guilds' } }
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions)