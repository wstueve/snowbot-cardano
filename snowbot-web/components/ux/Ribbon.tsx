// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React from "react";

export function Ribbon(props: { onClick?: React.MouseEventHandler<HTMLButtonElement> }) {
    return (
        <div className="w-8 aspect-square absolute -top-1 -right-1 overflow-hidden rounded-sm">
            <div className="absolute h-1 top-0 left-0 aspect-square bg-blue-700"></div>
            <div className="absolute h-1 bottom-0 right-0 aspect-square bg-blue-700"></div>
            <button onClick={props.onClick} className="pt-1.5 bg-blue-500 text-blue-200 font-semibold text-xs 
            tracking-wider block w-square-diagonal text-center absolute bottom-0 right-0 rotate-45 
            origin-bottom-right shadow-sm hover:bg-blue-400 active:bg-blue-300 focus:outline-none"
            ><div className="-rotate-45">🎁</div></button>
        </div>
    );
}