// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { Epoch, Project } from "@prisma/client";
import { getEpochFromChain } from "../../cardano/epoch";
import { createEpoch, getMostRecentEpoch, saveEpoch } from "../../db/epoch";
import { EpochStatus } from "../../type/enum";

export async function createNextEpoch(epochNumber: number, projectId: string, timestamp: Date) {
    const epoch = await getEpochFromChain(epochNumber) as any;
    if (!epoch) {
        throw new Error(`Epoch ${epochNumber} could not be retrieved.`);
    }

    return await createEpoch(projectId, epoch, timestamp, EpochStatus.ACCUMULATING);
}

export async function setEpochProcessing(epoch: Epoch, timestamp: Date) {
    epoch.status = EpochStatus.PROCESSING;
    epoch.statusTime = timestamp;
    return await saveEpoch(epoch);
}

export async function setEpochRewarded(epoch: Epoch, timestamp: Date) {
    epoch.status = EpochStatus.REWARDED;
    epoch.statusTime = timestamp;
    return await saveEpoch(epoch);
}

export async function getEpochForProcessing(project: Project, timestamp: Date) : Promise<Epoch | undefined> {
    let epoch = await getMostRecentEpoch(project.id);
    if (epoch.status === EpochStatus.REWARDED) {
        epoch = await createNextEpoch(epoch.epochNumber + 1, project.id, timestamp);
    }

    if (epoch.status === EpochStatus.ACCUMULATING) {
        if (timestamp < epoch.endTime) {
            return undefined;
        }

        epoch = await setEpochProcessing(epoch, timestamp); 
    }

    return epoch;
}