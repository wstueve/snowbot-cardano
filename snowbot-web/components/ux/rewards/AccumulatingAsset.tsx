// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React, { useState } from "react";
import CoinList from "../coins/CoinList";
import Image from "next/image";
import { Ribbon } from "../Ribbon";
import CelebrateModal from "../dialogs/CelebrateModal";
import { useSWRConfig } from "swr";
import { useAxios } from "../../providers/axios";

export default function AccumulatingDetail(props: { asset: any, index: number, boost: number }) {
    const {mutate} = useSWRConfig();
    const [isOpen, setIsOpen] = useState(false);
    const { post } = useAxios();
    const [error, setError] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [balances, setBalances] = useState<any[]>([]);

    const {
        asset,
        index,
        boost
    } = props;


    const hasBalance = asset.balances?.length > 0;
    if (hasBalance && balances.length === 0) {
        setBalances([...asset.balances]);
    }

    const withBalanceClasses = hasBalance
        ? "hover:shadow-xl hover:shadow-blue-800/40 active:shadow-blue-800/60 cursor-pointer"
        : "";
    
    const captureRewards = hasBalance ? (): Promise<any> => {
        const body = {
            policyId: asset.policyId,
            assetName: asset.assetName
        };

        return post("reward/accumulating/capture", body).then(res => res.data);
    } : undefined;
    
    const handleRibbonClick = hasBalance ? async (e: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;
        
        setIsLoading(true);
        setIsOpen(true);
        if (captureRewards) {
            try {
                await captureRewards();
            } catch (err: any) {
                console.log("Error capturing asset", err);
                const message = err.response?.data?.message ?? "An error occurred while capturing rewards. Please contact support if the error persists.";
                console.log("Error message", message);
                setError(message);
            }
        }
        setIsLoading(false);

        mutate("reward/accumulating");
        mutate("balance")
    } : undefined;
    
    return  (
        <div
            className={`flex relative mt-1 mb-4 bg-transparent px-4 py-2 sm:px-6 ml-2 flex-wrap shadow-md shadow-blue-900/10 ${withBalanceClasses}`}
            onClick={handleRibbonClick}
            key={index}>
            {hasBalance && <Ribbon />}
        <div className="flex flex-row w-1/2">
            {asset && (<Image src={`/${asset.imageUrl}`} alt={asset.name ?? ""} height={50} width={50}/>)}
            <div>
                {asset && (<div className="text-sm text-slate-100 ml-2">{asset.name}</div>)}
                <div className="text-sm text-slate-400 ml-2">accumulating</div>
                {balances?.length > 0 && <div className="text-sm text-slate-400 ml-2">+ bonus</div>}
            </div>
        </div>
        <div className="flex flex-col assets-end text-right relative w-1/2">
            <CoinList list={asset.rewards} className="text-slate-100 " />
            {boost > 0 && (<div className="text-xs text-slate-500">Boost {boost}</div>)}
            </div>
            {(hasBalance || isOpen) && <CelebrateModal error={error} isLoading={isLoading} isOpen={isOpen} setIsOpen={setIsOpen} title="Skellybrate!" showSkellyInTitle={false} >
                <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                        {!error && <Image src="/assets/images/skellybrate.webp" alt="skellybrate" height={150} width={150} className="m-2" />}
                        {!isLoading && !error && <><div className="text-slate-100 text-lg m-1">Rewards captured!</div>
                            <div className="m-1"><CoinList list={balances.map((b: any) => { return { amount: b.balance, policyId: b.policyId } })} /></div>
                            </>}
                        {!isLoading && error && <div className="text-red-300 m-1">{error}</div>}
                    </div>
                </div>
            </CelebrateModal>}
    </div>)
}