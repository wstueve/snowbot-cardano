// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
const GOLD_BADGE_POLICY_ID = '5bfa19922cc65ff4d882755ed1fc94fbb2f76e40bea9f44ed44dc7fa';
const SILVER_BADGE_POLICY_ID = 'e60f013d8ef912b1b6b2e447fe43ff02dea3fdc3f271d4502a54e280';
const SKELLY_POLICY_ID = '40cc2fa3e16c997f7b2ea222c6e795e7aa9d63c271621f8e54b31d0a';
const SKELLA_POLICY_ID = '05630e6bf1caf403144c3d77e9308de954a22727d03ccf37ef29ed13';

const projects = [
    {
        id: "[db id]",
        name: 'Snow Skellies', 
        epochRewardsConfig: {
            epochLengthDays: 5,
            maxConcurrentWithdrawals: 4,
            startEpoch: {
                "epoch_no": 447,
                "out_sum": "132373995169666643",
                "fees": "104111334647",
                "tx_count": 302829,
                "blk_count": 21214,
                "start_time": 1699307091,
                "end_time": 1699739091,
                "first_block_time": 1699307150,
                "last_block_time": 1699739089,
                "active_stake": "23015951543513577",
                "total_rewards": "10092906628872",
                "avg_blk_reward": "475766316"
            },
            policyConfigs: [
                {
                    policyId: SKELLY_POLICY_ID,
                    name: 'Snow Skellies',
                    rewards: [{ 
                        policyId: SKELLA_POLICY_ID,
                        amount: 25000000,
                        perEveryDays: 1,
                        decimals: 6,
                    }],
                    isPolicyEnabled: true,
                    providesBoost: false,
                },
                {
                    policyId: GOLD_BADGE_POLICY_ID,
                    name: 'Gold Founder\'s Badges',
                    rewards: [{ 
                        policyId: SKELLA_POLICY_ID,
                        amount: 200000000,
                        perEveryDays: 1,
                        decimals: 6,
                    }],             
                    isPolicyEnabled: true,
                    providesBoost: true,
                },
                {
                    policyId: SILVER_BADGE_POLICY_ID,
                    name: 'Silver Founder\'s Badges',
                    rewards: [{ 
                        policyId: SKELLA_POLICY_ID,
                        amount: 100000000,
                        perEveryDays: 1,
                        decimals: 6,
                    }],             
                    isPolicyEnabled: true,
                    providesBoost: true,
                },
            ],
        }
    }
];
export {projects, GOLD_BADGE_POLICY_ID, SILVER_BADGE_POLICY_ID, SKELLY_POLICY_ID, SKELLA_POLICY_ID };