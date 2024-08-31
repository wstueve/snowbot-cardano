// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React from "react";

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

let cNumPoints : number, cRadius : number
function random(min: number, max: number) {
    return min + Math.random() * (max - min + 1);
};
  function drawSnowflake(ctx: any) {
    const numPoints = randomInt(2, 8) * 2
    const cRadius = randomInt(1, 10) / 2.0
    const innerRadius = cRadius * 0.4
    const outerRadius = cRadius * 0.8

    for (let n = 1; n < numPoints * 2; n++) {
      var gradient = ctx.createRadialGradient( 
        0,  // The x-axis coordinate of the start circle. 
       0,  // The y-axis coordinate of the start circle.
        0,                    // The radius of the start circle.
        1,  // The x-axis coordinate of the end circle.
        1,  // The y-axis coordinate of the end circle.
        1 // The radius of the end circle
        );


        gradient.addColorStop(0, "rgba(255, 255, 255," + random(0.1, 1) + ")");  // white
        gradient.addColorStop(.8, "rgba(210, 236, 242," + random(0.1, 1) + ")");  // bluish
        gradient.addColorStop(1, "rgba(237, 247, 249," + random(0.1, 1) + ")");   // lighter bluish
    
        ctx.beginPath(); 

    
        ctx.arc(
        0, // The x-axis (horizontal) coordinate of the arc's center.
        0, // The y-axis (vertical) coordinate of the arc's center.
        1, // The radius. Must be non-negative.
        0,                        // The angle at which the arc starts,
        Math.PI*2,                // The angle at which the arc ends
        false                     //  parametar whitch indicates wether the arc to be drawn counter-clockwise 
        );

    ctx.fillStyle = gradient;      }
    ctx.fill()
    ctx.stroke()
    ctx.closePath()
    console.log("ctx", ctx)
  }
  
  
export function CelebrateDialog(props: { children: any }) {
    const [isOpen, setIsOpen] = React.useState(true);
    const { children } = props;

    return (
<></>)
}