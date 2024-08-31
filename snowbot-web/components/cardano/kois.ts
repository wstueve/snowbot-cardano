// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { KeyValuePair } from "../type/keyValuePair";
import { fetchWithRetry } from "../util/fetchRetry";
import { buildQueryString } from "../util/httpUtil";

const BASE_URL = process.env.KOIS_API_URL ||
    "https://api.koios.rest/api/v1/";
const DEFAULT_HEADERS = {
    'accept': 'application/json',
    'Authorization': `Bearer ${process.env.KOIS_ACCESS_TOKEN}`
};

export async function getJson(relativeUrl: string, queryParams: KeyValuePair<string, any>[] = []) : Promise<any> {
    const queryString = buildQueryString(queryParams);
    const relativeUrlHasQueryString = relativeUrl.indexOf('?') > -1;
    let targetUrl = `${BASE_URL}${relativeUrl}`;

    if (queryString.length > 0) {
        targetUrl += `${relativeUrlHasQueryString ? '&' : '?'}${queryString.substring(1)}`;
    }
   const koisResponse = await fetchWithRetry(`${targetUrl}`, {
        headers: DEFAULT_HEADERS
    });

    if (koisResponse.ok) {
        const responseJson = await koisResponse.json();
        const contentRange = koisResponse.headers.get('content-range');
        if (!!contentRange) {
            const end = parseInt(contentRange.split('/')[0].split('-')[1]);
            //if the end is 999, 1999, 2999, etc. then we need to fetch the next page
            if (end % 1000 === 999) {
                //check if the query params already contain an offset and remove it if so
                console.log(`🚨 >>>>>>>>> Fetching next page for ${targetUrl}`);
                for (let i = 0; i < queryParams.length; i++) {
                    if (queryParams[i][0] === 'offset') {
                        queryParams.splice(i, 1);
                        break;
                    }
                }
                const newQueryParams = queryParams.concat([['offset', end + 1]]);
                return responseJson.concat(await getJson(targetUrl, newQueryParams));
            }
        }
        return responseJson;
    } else {
        throw new Error(`Failed to fetch ${targetUrl} with status ${koisResponse.status}`);
    }
}

export async function postJson(relativeUrl: string, body: any) {
    const koisResponse = await fetchWithRetry(`${BASE_URL}${relativeUrl}`, {
        method: "POST",
        headers: {...DEFAULT_HEADERS, 'content-type': 'application/json'},
        body: JSON.stringify(body)
    });

    //TOOD: Handle header response which indicates pagination
    //https://api.koios.rest/#overview--pagination-offsetlimit

    if (koisResponse.ok) {
        return await koisResponse.json();
    } else {
        console.log(`Failed to fetch ${relativeUrl} with status ${koisResponse.status}`);
        throw new Error(`Failed to fetch ${relativeUrl} with status ${koisResponse.status}`);
    }
}