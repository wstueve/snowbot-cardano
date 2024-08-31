// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import type { NextApiRequest, NextApiResponse } from "next";
import { projects } from "../../components/metadata/project";
import { getProject } from "../../components/db/project";
import { getAssetFromChain } from "../../components/cardano/asset";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";

export const config = {
  maxDuration: 300,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      res.status(401).json({ message: "Not authenticated." });
      return;
    }
  }

  try {
    let health = { isHealthy: true, isdDbHealthy: true, isKoisHealthy: true, message: "Healthy" };
    const setUnhealthy = () => {
      health.isHealthy = false;
      health.message = "Unhealthy";
    };
  
    const project = await getProject(projects[0].name);
    if (!project) {
      console.error(`💔 Unhealthy DB Connection: Project [${projects[0].name}] not found `);

      setUnhealthy();
      health.isdDbHealthy = false;
      res.status(500).json(health);
      return;
    }

    //Get SnowSkelly47 from the chain
    const asset = await getAssetFromChain('40cc2fa3e16c997f7b2ea222c6e795e7aa9d63c271621f8e54b31d0a', '536e6f77536b656c6c793437');
    if (!asset) {
      console.error(`💔 Unhealthy Koios Connection: SnowSkelly47 not found `);

      setUnhealthy();
      health.isKoisHealthy = false;
      res.status(500).json(health);
      return;
    }

    //TODO: Check queue health when transaction queue is implemented

    res.status(200).json(health);
    console.log(`❤️ Healthy`);
  } catch (error) {
    console.error(`💔 Unhealthy General Error [${error}]`);
    res.status(500).json({ isHealthy: false, message: "Unhealthy" });
  }
}
  
