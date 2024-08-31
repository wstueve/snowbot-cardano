// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { getJson, postJson } from "./kois";
import { KeyValuePair } from "../type/keyValuePair";

export type AssetPolicyList = {
    policyId: string;
    assetName: string;
}
export async function getAssetFromChain(policyId: string, assetName: string): Promise<any> {
    const assets = await postAssetInfo([{ policyId, assetName }]);
    if (!!assets && assets.length > 0) {
        return assets[0];
    }
}

export async function getAssetListFromChain(assetPolicyList: AssetPolicyList[]): Promise<any> {
    const results = [];
    let batch = [];
    let batchSizeInKB = 0;

    for (const assetPolicy of assetPolicyList) {
        const potentialBatch:any = [...batch, assetPolicy];
        const potentialBatchSizeInKB = getJsonSizeInKB(createBody(potentialBatch));

        // batch requests to kois are caped at 5 kb
        if (potentialBatchSizeInKB > 4) {
            const assets = await postAssetInfo(batch);
            results.push(...assets);
            batch = [assetPolicy];
            batchSizeInKB = getJsonSizeInKB(createBody(batch));
        } else {
            batch = potentialBatch;
            batchSizeInKB = potentialBatchSizeInKB;
        }
    }

    if (batch.length > 0) {
        const assets = await postAssetInfo(batch);
        results.push(...assets);
    }

    return results;
}

async function postAssetInfo(batch: AssetPolicyList[]) {
    const body = createBody(batch);
    const assets = await postJson(`asset_info`, body);
    return !!assets && assets.length > 0 ? assets : [];
}

function createBody(assetPolicyList: AssetPolicyList[]) {
    return {
        '_asset_list': assetPolicyList.map(asset => [asset.policyId, asset.assetName])
    };
}

function getJsonSizeInKB(jsonObject: any) {
    const jsonString = JSON.stringify(jsonObject);
    const byteSize = Buffer.byteLength(jsonString, 'utf8');
    const sizeInKB = byteSize / 1024;
    return sizeInKB;
}

export async function getAssetAddressesFromChain(policyId: string, assetName: string): Promise<any> {
    let queryString: KeyValuePair<string, string>[] = [];

    queryString.push(['_asset_policy', policyId]);
    queryString.push(['_asset_name', assetName]);

    const assetAddresses = await getJson(`asset_addresses`, queryString);
    if (!!assetAddresses && assetAddresses.length > 0) {
        console.log(`🐛 Found ${assetAddresses.length} addresses for ${policyId}.${assetName}: ${JSON.stringify(assetAddresses)}`);
        return assetAddresses;
    }
}
