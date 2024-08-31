// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { useState } from "react";
import useSWR from "swr";
import { useAxios } from "../../providers/axios";

export function ProjectWallet() {
    const { get, post } = useAxios();
    const [input, setInput]= useState("");

    const { data, error, isLoading } = useSWR("project/wallet?policyId=38e92ba6a6def9da88d310f7daff9a232d3816e0460db47b47cdedc9", get);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading</div>;

    const handleCreateWallet = async () => {
        post("project/wallet", { policyId: input })
        .then(() => {
            console.log("Wallet created successfully");
        });
    }
    return (
        data
            ? <div>{data.address}</div> // Replace with how you want to display the data
            : <div>
                <div>&nbsp;</div>
                <div>
                    <input
                        type="text"
                        minLength={1}
                        maxLength={15}
                        className="text-gray-900"

                        value={input}
                        onChange={e => setInput(e.target.value)}
                    ></input>
                    <button onClick={handleCreateWallet}>Create</button>
                </div>
            </div>

    );

}