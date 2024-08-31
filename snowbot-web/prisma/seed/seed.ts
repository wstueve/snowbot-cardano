// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Policy, PrismaClient } from '@prisma/client'
import { fieldEncryptionExtension } from 'prisma-field-encryption'
import goldAssets from '../../components/metadata/gold'
import silverAssets from '../../components/metadata/silver'
import skellyAssets from '../../components/metadata/skellies'
import { SKELLA_POLICY_ID, projects } from '../../components/metadata/project'

import { GOLD_BADGE_POLICY_ID, SILVER_BADGE_POLICY_ID, SKELLY_POLICY_ID } from '../../components/metadata/project'
import { EpochStatus } from '../../components/type/enum'
import { convertUnixTimestamp } from '../../components/util/dateUtil'
import { createAsset } from '../../components/db/asset'

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
        db: {
            url: process.env.POSTGRES_URL
        },
    }
}).$extends(fieldEncryptionExtension());

async function makeNftPolicy(name: string, description: string, policyId: string, providesBoost = false) {
    await prisma.policy.upsert({
        where: {policyId: `${policyId}`},
        update: {
            name: `${name}`,
            url: `https://www.jpg.store/collection/${policyId}`,
            image: `assets/images/${policyId}/logo.webp`,
            providesBoost: providesBoost,
            description: description,
        },
        create: {
            policyId: `${policyId}`,
            name: `${name}`,
            url: `https://www.jpg.store/collection/${policyId}`,
            image: `assets/images/${policyId}/logo.webp`,
            providesBoost: providesBoost,
            description: description,
        }
    });
}

async function makeFtPolicy(policy: Policy) {
    await prisma.policy.upsert({
        where: {policyId: `${policy.policyId}`},
        update: {},
        create: {
            policyId: `${policy.policyId}`,
            name: `${policy.name}`,
            ticker: `${policy.ticker}`,
            url: `${policy.url}`,
            image: `${policy.image}`,
            description: `${policy.description}`,
            decimals: policy.decimals,
            maxSupply: `${policy.maxSupply}`,
            providesBoost: policy.providesBoost,
        }
    });
}

async function makeAssets(assets: any[], policyId: string, callback: (s: string) => string) {
    for (const asset of assets) {
        await createAsset(asset, policyId, callback)
    }
}

async function makeProjects() {
    for (const project of projects) {
        await prisma.project.upsert({
            where: {name: project.name},
            update: {
                epochRewardsConfig: project.epochRewardsConfig
            },
            create: {
                name: project.name,
                epochRewardsConfig: project.epochRewardsConfig
            }
        });
    }
}

async function makeProjectDistributionPolicies() {
    for (const project of projects) {
        const projectEntity = await prisma.project.findUniqueOrThrow({
            where: {name: project.name}
        });
        for (const policy of project.epochRewardsConfig.policyConfigs) {
            for (const reward of policy.rewards) {
                const rewardPolicyEntity = await prisma.policy.findUniqueOrThrow({
                    where: {policyId: reward.policyId}
                });
    
                const assetPolicyEntity = await prisma.policy.findUniqueOrThrow({
                    where: {policyId: policy.policyId}
                });
                const pdpEntity = await prisma.projectDistributionPolicy.upsert({
                    where: {policyIdProjectId: {
                        projectId: projectEntity.id,
                        policyId: rewardPolicyEntity.id
                    }},
                    update: {},
                    create: {
                        projectId: projectEntity.id,
                        policyId: rewardPolicyEntity.id,
                    }
                });
    
                await prisma.projectDistributionReward.upsert({
                    where: {projectDistributionPolicyIdPolicyId: {
                        projectDistributionPolicyId: pdpEntity.id,
                        policyId: assetPolicyEntity.id
                    }},
                    update: {},
                    create: {
                        projectDistributionPolicyId: pdpEntity.id,
                        policyId: assetPolicyEntity.id,
                        amount: reward.amount,
                        perEveryDays: reward.perEveryDays,
                    }
                });
            }
        }
    }
}

async function makeEpochs() {
    for (const project of projects) {
        const projectEntity = await prisma.project.findUniqueOrThrow({
            where: {name: project.name},
        });
        
        const startEpoch = project.epochRewardsConfig.startEpoch;

        await prisma.epoch.upsert({
            where: {
                epochNumberProjectId: {
                    epochNumber: startEpoch.epoch_no,
                    projectId: projectEntity.id
                }
            },
            update: {},
            create: {
                epochNumber: startEpoch.epoch_no,
                startTime: convertUnixTimestamp(startEpoch.start_time),
                endTime: convertUnixTimestamp(startEpoch.end_time),
                projectId:projectEntity.id,
                status: EpochStatus.ACCUMULATING,
                statusTime: new Date(),
                metadata: startEpoch,   
            }
        });
    }
}

async function makeUserRoles(adminProviderIds: string[]) {
    // check if admin role exists
    let adminRole = await prisma.role.findUnique({
        where: { name: 'admin' },
    });

    if (adminRole === null) {
        // create admin role
        adminRole = await prisma.role.create({
            data: {
                name: 'admin'
            }
        });
    }

    adminProviderIds.forEach(async providerId => {
        const adminAcc = await prisma.account.findFirst({
            where: { providerAccountId: providerId },
            include: { user: true }
        });

        if(adminAcc && adminAcc.user && adminRole) {
            await assignAdminRoleToUser(adminAcc.user.id, adminRole.id);
        }
    
    });
}

async function assignAdminRoleToUser(userId: string, adminRoleId: string) {
    const adminUser = await prisma.user.findFirst({
        where: { id: userId },
        include: { userRoles: true },
    });

    if (adminUser) {
        const hasAdminRole = adminUser.userRoles.some(userRole => userRole.roleId === adminRoleId);

        if (!hasAdminRole) {
            await prisma.userRole.create({
                data: {
                    userId: adminUser.id,
                    roleId: adminRoleId,
                },
            });
        }
    }
}

async function main() {
    try {
        await makeProjects();

        await makeEpochs();

        await makeNftPolicy(`Snow Skellies`, 'Snow Skellies are naughty little skeletons that love the snow!', SKELLY_POLICY_ID);
        await makeNftPolicy(`Gold Founder's Badges`, "The Gold Founder's Badge is the premium founder's pass with a higher level of boost.", GOLD_BADGE_POLICY_ID, true);
        await makeNftPolicy(`Silver Founder's Badges`, "The Silver Founder's Badge is the base founder's pass with boost.", SILVER_BADGE_POLICY_ID, true);

        await makeFtPolicy({
            "id": 0,
            "name": "SKELLA - Snow Skellies Game and Utility Token",
            "ticker": "SKELLA",
            "image": `assets/images/${SKELLA_POLICY_ID}/logo.webp`,
            "description": "SKELLA is the utility token for the Snow Skellies game and rewards ecosystem. Utilize it for in-game items, product offerings and gain it by staking Skellies boosted by badges.",
            "url": "https://snowbot.cloud/skella-token/",
            "policyId": SKELLA_POLICY_ID,
            "decimals": 6,
            "maxSupply": "2.5 Billion",
            providesBoost: false,
        });

        await makeProjectDistributionPolicies();

        await makeAssets(goldAssets, GOLD_BADGE_POLICY_ID, () => `assets/images/${GOLD_BADGE_POLICY_ID}/gold-founders-badge.gif`);
        await makeAssets(silverAssets, SILVER_BADGE_POLICY_ID, () => `assets/images/${SILVER_BADGE_POLICY_ID}/silver-founders-badge.gif`);
        await makeAssets(skellyAssets, SKELLY_POLICY_ID, (assetName) => `assets/images/${SKELLY_POLICY_ID}/${assetName}.png`);

        await makeUserRoles(['', '']); // admin provider ids for devs
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