// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { NextApiRequest, NextApiResponse } from "next";
import { FeatureFlags } from "../../../../components/metadata/featureFlags";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { isTestAuthorized } from "../../../../components/util/httpUtil";
import { CreateProjectWalletRequest, GetProjectWalletRequest } from "../../../../components/type/transaction";
import { ProjectWallet } from "@prisma/client";
import { handleCreateProjectWallet, handleGetProjectWallet } from "../../../../components/logic/transaction/deposit";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const featureFlags = new FeatureFlags(req.headers.host ?? "");
    if (!featureFlags.createProjectWallet()) {
        res.status(503).json({ message: "Wallet creation Unavailable" });
        return;
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
        if (!isTestAuthorized(req)) {
            res.status(401).json({ message: "Not authenticated." });
            return;
        }
    }

    if(req.method === 'GET') {
        const walletRequest = { ...req.query as GetProjectWalletRequest};
        console.log(`walletRequest: ${JSON.stringify(walletRequest)}`);

        if (!walletRequest
            || !walletRequest.policyId) {
            res.status(400).json({ message: "Bad Request." });
            return;
        }
        const projectWallet = await handleGetProjectWallet(walletRequest.policyId);
        res.status(200).json({ address: projectWallet.address });
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' })
        return
    }

    const createWalletReq = { ...req.body as CreateProjectWalletRequest };
    if (!createWalletReq
        || !createWalletReq.policyId) {

        res.status(400).json({ message: "Bad Request." });
        return;
    }

    const projectWallet: ProjectWallet = await handleCreateProjectWallet(createWalletReq.policyId);

    res.status(200).json({ address: projectWallet.address });
}


