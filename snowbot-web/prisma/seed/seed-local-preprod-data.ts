// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { prisma } from "../../components/db/prisma";
import { projects } from "../../components/metadata/project";

async function makeProjectWallets() {
    for (const project of projects) {
        console.log(`Creating project wallet for ${project.name}`);
        const projectEntity = await prisma.project.findUniqueOrThrow({
            where: {name: project.name},
        });
        
        await prisma.projectWallet.upsert({
            where: {
                projectIdPolicyId: {
                    projectId: projectEntity.id,
                    policyId: "38e92ba6a6def9da88d310f7daff9a232d3816e0460db47b47cdedc9"
                }
            },
            update: {
                policyId: "38e92ba6a6def9da88d310f7daff9a232d3816e0460db47b47cdedc9",
                address: "",
                secretKey: "[guid1] [guid2]"

            },
            create: {
                id: "",
                projectId: projectEntity.id,
                policyId: "38e92ba6a6def9da88d310f7daff9a232d3816e0460db47b47cdedc9",
                address: "",
                secretKey: "[guid1] [guid2]"
            }
        });
    }
}

async function main() {
    try {
        await makeProjectWallets();

        // await makeNftPolicy(`Snow Skellies`, 'Snow Skellies are naughty little skeletons that love the snow!', SKELLY_POLICY_ID);
        // await makeNftPolicy(`Gold Founder's Badges`, "The Gold Founder's Badge is the premium founder's pass with a higher level of boost.", GOLD_BADGE_POLICY_ID, true);
        // await makeNftPolicy(`Silver Founder's Badges`, "The Silver Founder's Badge is the base founder's pass with boost.", SILVER_BADGE_POLICY_ID, true);

        // await makeFtPolicy({
        //     "id": 0,
        //     "name": "SKELLA - Snow Skellies Game and Utility Token",
        //     "ticker": "SKELLA",
        //     "image": `assets/images/${SKELLA_POLICY_ID}/logo.webp`,
        //     "description": "SKELLA is the utility token for the Snow Skellies game and rewards ecosystem. Utilize it for in-game items, product offerings and gain it by staking Skellies boosted by badges.",
        //     "url": "https://snowbot.cloud/skella-token/",
        //     "policyId": SKELLA_POLICY_ID,
        //     "decimals": 6,
        //     "maxSupply": "2.5 Billion",
        //     providesBoost: false,
        // });

        // await makeProjectDistributionPolicies();

        // await makeAssets(goldAssets, GOLD_BADGE_POLICY_ID, () => `assets/images/${GOLD_BADGE_POLICY_ID}/gold-founders-badge.gif`);
        // await makeAssets(silverAssets, SILVER_BADGE_POLICY_ID, () => `assets/images/${SILVER_BADGE_POLICY_ID}/silver-founders-badge.gif`);
        // await makeAssets(skellyAssets, SKELLY_POLICY_ID, (assetName) => `assets/images/${SKELLY_POLICY_ID}/${assetName}.png`);
    }
    catch (e) {
        console.log(e);
        throw e;
    }
}
main().then(async () => {
    console.log('done')
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })