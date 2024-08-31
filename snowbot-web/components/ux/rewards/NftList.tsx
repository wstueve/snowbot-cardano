// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React, { useEffect, useState } from "react";
import { useUserWallet } from "../../providers/wallet";
import { useAxios } from "../../providers/axios";
import { hexToString } from "../../util/stringUtil"
import Image from "next/image";

export default function NftList (props : {policyId: string}) {
    const {userWallets} = useUserWallet();
    const [stakes, setStakes] = useState<any[]>([]);
    const { get } = useAxios();
    const { policyId } = props;

    useEffect(() => {
        if (userWallets?.length === 0) {
            setStakes([]);
        }

        get(`assets/${policyId}}`).then((res: any) => {
            setStakes(res);
        }).catch((err: any) => {
            console.error(`unable to retreive asset for policyId = ${policyId}`);
            console.error(err);
        });
    }, [userWallets, policyId]);

    return (
        <div className="grid">
            {stakes.map((stake: any) => {
                return stake.data.map((nft: any) => {
                return (
                    <div className="card">
                        <p className="overflow-visible">
                            <Image alt="Snow Skelly" src={`/assets/images/${policyId}/${hexToString(nft.unit.slice("40cc2fa3e16c997f7b2ea222c6e795e7aa9d63c271621f8e54b31d0a".length))}.png`} width={100} height={100} />
                        </p>
                    </div>
                );
                })
            })}
        </div>
    );
}