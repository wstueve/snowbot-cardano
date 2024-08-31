// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { NextApiRequest } from "next";
import { KeyValuePair } from "../type/keyValuePair";
import { FeatureFlags } from "../metadata/featureFlags";

export function buildQueryString(queryParams: KeyValuePair<string, any>[]) {
    var queryString = "";
    for (const keyValuePair of queryParams) {
        queryString += `&${keyValuePair[0]}=${encodeURIComponent(keyValuePair[1])}`;
    }

    if (queryString.length > 0) {
        queryString = `?${queryString.substring(1)}`;
    }
    return queryString;
}

export function isTestAuthorized(req: NextApiRequest) {
    if (req.headers['x-integration-testing'] === "true") {
        const featureFlags = new FeatureFlags(req.headers.host ?? "");
        if (featureFlags.testing()) {
            const authHeader = req.headers['authorization'];
            if (authHeader === `Bearer ${process.env.TEST_SECRET}`) {
                console.log("‼️ 🔥 Integration test authorized 🔥 ‼️");
                return true;
            }
        }
    }
    return false;
}
