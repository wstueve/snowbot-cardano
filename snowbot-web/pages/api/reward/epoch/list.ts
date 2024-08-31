// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import JsonSerializer from "../../../../components/util/jsonUtil";
import { getProject } from "../../../../components/db/project";
import { projects } from "../../../../components/metadata/project";
import { getEpochTotals, getEpochs } from "../../../../components/db/epoch";
import { EpochTotal } from "../../../../components/type/epoch";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
  
    if (req.method !== 'GET') {
      res.status(405).send({ message: 'Only GET requests allowed' })
      return
    }
  
    const project = await getProject(projects[0].name);
    const epochs = await getEpochs(project.id);
    const epochTotals = await getEpochTotals(project.id);

    const viewModels = epochs.map((epoch) => {return{
      ...epoch,
      accumulatedRewards: epochTotals?.find((epochTotal: EpochTotal) => epochTotal.id === epoch.id && epochTotal.accountType === "asset"),
      distributedRewards: epochTotals?.find((epochTotal: EpochTotal) => epochTotal.id === epoch.id && epochTotal.accountType === "user"),
    }});
    res.status(200).json(JsonSerializer(viewModels));
  }

  
