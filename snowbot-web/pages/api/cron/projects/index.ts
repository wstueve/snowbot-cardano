// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
    const authHeader = req.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (req.method !== 'GET') {
    res.status(405).send({ message: 'Only GET requests allowed' })
    return
  }

  await syncPolicies();
  res.status(200).json({ result: true });
}

async function syncPolicies() {
  let page = 1;
  let keepFetching = true;
  let errorCount = 0;

  while (keepFetching) {
    console.debug(`Fetching page ${page} of policies...`);

    const response = await fetch(`https://server.jpgstoreapis.com/policy/verified?page=${page}`);
    const data = await response.json();

    if (data.length === 0) {
      keepFetching = false;
      break;
    }

    for (const nft of data) {
      try {
        console.log(`Upserting policy with ID ${JSON.stringify(nft)}`);
        if (nft.url) {
        //     await raffleDbClient.nft.upsert({
        //     where: { policyId: nft.policy_id },
        //     update: {
        //         displayName: nft.display_name,
        //         url: nft.url,
        //         name: nft.name,
        //     },
        //     create: {
        //         displayName: nft.display_name,
        //         url: nft.url,
        //         policyId: nft.policy_id,
        //         name: nft.name,
        //     },
        //     });
        // } else {
        //     console.log(`Policy with ID ${nft.policy_id} has no URL. Name: ${nft.name}. Skipping.`)
        // }
        }

      } catch (e) {
        console.log(`Error upserting policy with ID ${nft.policy_id}: ${e}`);
        errorCount++;
        if (errorCount > 10) {
          throw new Error(`Too many errors syncing policies. Aborting.`);
        }
      }
    }

    page++;
  }
}