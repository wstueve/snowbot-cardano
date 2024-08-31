#!/bin/bash
# This is free and unencumbered software released into the public domain.
# Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
# In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
# successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
# For more information, please refer to <http://unlicense.org/>

# Gets all the assets and addresses for a policy id on cardano

if [ -z "$1" ]; then
  echo "Usage: $0 <policy_id> <asset_name> [bearer_token]"
  exit 1
fi

if [ -z "$2" ]; then
  echo "Usage: $0 <policy_id> <asset_name> [bearer_token]"
  exit 1
fi

if [ -z "$3" ]; then
  curl -X GET "https://api.koios.rest/api/v1/asset_addresses?_asset_policy=$1&_asset_name=$2" \
    -H "accept: application/json" >> out.json
else
  curl -X GET "https://api.koios.rest/api/v1/asset_addresses?_asset_policy=$1&_asset_name=$2" \
    -H "accept: application/json" >> out.json \
    -H "authorization: Bearer $3"
fi

cat out.json | jq -r '.[]| join(",")' >> out.csv

rm out.json

