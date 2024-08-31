// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React from "react";
import { useAccumulatingRewards, useEpochs } from "../../providers/reward";
import useSWR from "swr";
import { useAxios } from "../../providers/axios";
import AccumulatingAsset from "./AccumulatingAsset";

export default function AccumulatingDetail () {
    const { epoch } = useEpochs();

    const {     
        isLoading,
        assets
    } = useAccumulatingRewards();
    const { get } = useAxios();
    const { data: boostData } = useSWR("assets/boost", get);

    if (isLoading) return <div>Loading...</div>

    const list = assets() ;

    return epoch?.status === "accumulating" && (
        <div className="mt-1 border-t border-slate-500">
            <div className="mt-4">
                {list.map((item: any, index: number) => (<AccumulatingAsset asset={item} index={index} boost={boostData?.boost ?? 0} />))}
            </div>
        </div>
    );
}