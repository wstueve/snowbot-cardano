// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React from "react";
import Image from "next/image";

export type TitleCardProps = {
    title: string;
    subheader: string;
    backgroundUrl?: string;
    imageProps?: any;
    url?: string;
}

export default function TitleCard({ props }: { props: TitleCardProps }) {

    return (
        <div className="flex align-text-top w-full flex-wrap text-center">
            <div className="w-full relative">
                <div className="w-full p-5 bg-no-repeat bg-cover bg-center" style={{backgroundImage: `url('${props.backgroundUrl}')`}}>
                    {props.imageProps &&
                        <div className="flex justify-center">
                            <Image {...props.imageProps} />
                        </div>
                    }
                </div>
            </div>
            <div className="w-full pt-3 pb-3 bg-slate-900">
                    <h1 className="uppercase text-slate-200 text-center text-3xl font-semibold">{props.title}</h1>
                    <div className="w-full mt-2 text-slate-400 italic">{props.subheader}</div>
                    {props.url && <div className="text-blue-500 text-sm">
                        <a href={props.url} target="_blank" rel="noreferrer">link</a>
                    </div>}
                </div>
        </div>
    )
}
