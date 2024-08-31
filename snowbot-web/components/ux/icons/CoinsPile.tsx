// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import React from "react";

export function CoinsPile(props: { className?: string, width?: number, height?: number}) {
    return (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}><path d="M431.1 23.53c-9.5 17.34-25.4 23.34-49.6 14.15 17.9 10.24 28.5 24.99 24.6 48.64 12.4-21.29 29.2-24.49 49.4-14.11-18.3-11.28-33.4-24.22-24.4-48.68zM206 45.39c-3.4 27.17-10.8 51.2-46.9 52.1 27.4 3.11 44.3 19.11 46.9 52.21 2.3-26.1 14.6-45.7 46.8-52.21-34.1-4.65-48-23.18-46.8-52.1zM85.7 101.2c-5.5 22-19 32.5-43.2 27.8 20.4 12.6 24.5 30.3 20.4 50.6 9-24.3 24-32.3 43.4-28-24.4-9.4-24.2-29.2-20.6-50.4zm310.4.8c3.6 21.2 3.8 41-20.5 50.4 19.3-4.3 34.3 3.7 43.3 28-4.1-20.2 0-38 20.4-50.6-24.2 4.7-37.7-5.8-43.2-27.8zm-139.4 52c-9.6 0-18.1 2.4-23.7 5.8-5.5 3.4-7.3 6.7-7.3 9.3 0 2.6 1.8 5.9 7.3 9.3 5.6 3.3 14.1 5.7 23.7 5.7 3.9 0 7.7-.4 11.1-1.1 5.5-6.1 12.5-10.2 19.7-12.6.6-4.9-4.7-9.1-7.1-10.6-5.6-3.4-14.1-5.8-23.7-5.8zm-45.1 28.2c-6.2.9-9.1 3.1-10.2 5.4-1.9 12.5 13 22.2 22.1 26.5 8.7 3.9 17.5 5.2 23.9 4.5 6.4-.7 9.4-3.1 10.5-5.4 1.1-2.4.8-6.1-2.6-11.1-12-.2-22.8-3.1-31.5-8.3-4.9-3-9.3-6.9-12.2-11.6zm98.6 2.6c-9.6 0-18.1 2.4-23.7 5.7-5.5 3.4-7.3 6.7-7.3 9.3 0 2.6 1.8 5.9 7.3 9.3 5.6 3.3 14.1 5.7 23.7 5.7s18.1-2.4 23.7-5.7c5.5-3.4 7.3-6.7 7.3-9.3 0-2.6-1.8-5.9-7.3-9.3-5.6-3.3-14.1-5.7-23.7-5.7zm48.8 12.3c5.1 10.4-10.3 23.8-17.6 28.4 1.4.7 3.2 1.3 5.5 1.8 6.4 1.2 15.2.6 24.2-2.7 7.7-2.8 14.1-7 18.4-11.3.4-5.7 1.2-11 4.7-15-10.5-6.9-24.8-5.1-35.2-1.2zm-202-1.5c-9.6 0-18.1 2.4-23.7 5.7 4.6 6.3 5.7 13.2 4.5 20.8 5.2 2.1 11.9 3.5 19.2 3.5 9.6 0 18.1-2.4 23.7-5.7 5.5-3.4 7.3-6.7 7.3-9.3 0-2.6-1.8-5.9-7.3-9.3-5.6-3.3-14.1-5.7-23.7-5.7zm251.1 14.2c-2.7 12.2 11.8 23 20.5 27.7 8.5 4.4 17.1 6.2 23.6 5.9 6.4-.4 9.6-2.5 10.8-4.8 1.2-2.3 1.2-6.1-2.2-11.6-3.4-5.5-9.8-11.6-18.3-16.1-6.5-3.1-28.9-11.1-34.4-1.1zm-302.5-.9c-5.9-.1-13.1 1.2-20.3 4.2-8.8 3.7-15.7 9.2-19.5 14.4-3.8 5.3-4.2 9-3.2 11.4 1 2.4 4 4.8 10.4 5.8 6.3.9 15.1-.2 24-4 8.9-3.7 15.8-9.2 19.6-14.4 3.8-5.3 4.2-9 3.2-11.4-4.3-4.9-8.5-6-14.2-6zm168 13.1c-3.1 5.8-8.3 9.8-14.4 12.1 6.4 3.9 11.5 9.7 13.1 17.2 2.2 10.5-3 20.4-10.7 27.5-7.7 7.2-18.2 12.4-30.5 14.9-12.2 2.6-24 2.1-33.9-1.3-9.9-3.4-18.6-10.4-20.8-20.8-2.2-10.5 2.9-20.4 10.6-27.5 7.1-6.6 16.7-11.6 27.7-14.3-4.4-2-8.4-4.4-12-7.1-2.9 5.2-7.5 9.4-12.8 12.6-9 5.4-20.4 8.3-32.9 8.3-9.9 0-19.1-1.8-27-5.3-6.1 7.9-15.2 14.5-26 19-10.5 4.4-21 6.3-30.6 5.5-3.8 7.5-11.4 12.4-19.6 15-10.1 3.1-21.9 3.2-34 .2-.3-.1-.6-.1-.8-.2V324c2.8-1.5 5.9-2.6 9-3.3 3.4-.8 7-1.2 10.7-1.3v-.2c-2.9-10.3 1.7-20.5 8.9-28.1 7.2-7.6 17.4-13.5 29.5-16.8 11.56-3 23.1-3.7 33.9-.8 10.1 2.8 19.3 9.2 22.1 19.5 2.9 10.3-1.6 20.5-8.9 28.1-7.2 7.6-17.4 13.4-29.5 16.8-1.8.5-3.7.9-5.6 1.3 7.46 8.4 11.8 21.7 9.3 30.2-3.3 10.1-12.7 16.1-22.9 18.5-10.3 2.4-22 1.6-33.9-2.2-8.7-2.8-16.4-6.9-22.6-12.1v113.9h77.2c-4-10.7 3.9-11.4-7.2-16.1-11.6-4.7-21-11.8-27.3-20.2-6.3-8.4-9.5-19.1-5.5-29 4.1-9.8 13.9-15.1 24.3-16.7 10.4-1.5 22.1.1 33.6 4.9 11.6 4.7 21 11.8 27.3 20.2 2.3 3.1 4.2 6.4 5.5 9.9 8.4-.6 16.4.4 23.5 2.8 9.9 3.4 18.6 10.4 20.8 20.8 1.8 8.6-1.3 16.8-6.7 23.4h256.1c-6.3-7.3-10-16.6-7.4-26.2 2.8-10.3 11.9-16.7 22-19.6 10.1-2.9 21.9-2.7 33.9.6 1.7.5 3.3 1 4.9 1.6V342.7c-11 1.8-21.6 1.1-30.6-2-9.9-3.4-18.6-10.4-20.8-20.8-2.2-10.5 2.9-20.4 10.6-27.5 13.2-10.1 25.8-15.4 40.8-16.3V275c-15 .2-35.9-5.5-44.9-13.6-9.3-.2-19.2-2.9-28.9-8-10.7-5.6-19.1-13.1-24.6-21.7-5.3 4-11.5 7.3-18.3 9.8-11.8 4.3-23.5 5.5-33.8 3.5-8.6-1.7-16.7-5.9-21.3-13.1-3.8.6-7.9.9-12 .9-12.5 0-23.9-2.9-32.9-8.3-1.3-.8-2.5-1.6-3.7-2.5zm207 5.9c1.9 11.1.3 19.9-8 26.7 7.8 2.2 14.2 2.9 21.4 2.4v-29.6c-4.5-.3-9.3-.2-13.4.5zM18 229.7v28.9c9.44 3.2 21.18 4.7 30.4 2 3.3-1 5.5-2.2 7-3.6-7.21-5.3-11.24-12.3-11.3-20.7-3.7-2-8-3.7-12.8-4.9-4.6-1.1-9.2-1.7-13.3-1.7zm203.2 17.1c-9.4 2-17.2 6.1-22 10.4-4.7 4.5-5.7 8.1-5.2 10.7.5 2.5 3 5.4 9.1 7.5 6.1 2.1 14.9 2.7 24.3.7s17.2-6.1 22-10.4c4.7-4.5 5.8-8.1 5.3-10.6-.6-2.6-3-5.4-9.1-7.6-8.3-2.4-16.6-2.4-24.4-.7zM81.9 291.6c-9.3 2.6-16.9 7.2-21.3 11.8-4.4 4.8-5.3 8.4-4.6 11 .7 2.5 3.3 5.1 9.6 7 6.1 1.7 15 1.7 24.3-.9 9.2-2.5 16.9-7.1 21.3-11.8 4.4-4.7 5.3-8.4 4.6-10.9-.7-2.5-3.4-5.2-9.6-7-7.91-2-16.83-1.3-24.3.8zm261 .1c6.5.1 12.6 1.1 18.2 3 10 3.5 18.7 10.4 20.9 20.9 1 4.9.4 9.8-1.4 14.3 9.9 3.4 18.3 8.6 24.6 15 7.2 7.6 11.8 17.8 9 28.1-2.8 10.3-11.9 16.8-22 19.6-10.1 2.9-21.8 2.7-33.9-.6-12.1-3.2-22.3-9-29.6-16.6-4.4-4.6-7.9-10.1-9.2-16.1-4.4-.4-8.7-1.3-12.6-2.7-9.9-3.4-18.6-10.3-20.8-20.8-2.2-10.5 3-20.3 10.7-27.5 7.6-7.1 18.2-12.3 30.4-14.9 5.4-1.1 10.6-1.7 15.7-1.7zm151.1 2.4c-2.2.2-4.4.5-6.6 1-9.4 2-17.2 6.1-22 10.4-4.7 4.5-5.7 8.1-5.2 10.7.5 2.5 3 5.4 9 7.5 6.2 2.1 15 2.7 24.4.7.1 0 .3-.1.4-.1zM330.9 311c-9.3 2-17.2 6.1-22 10.5-4.6 4.4-5.7 8-5.2 10.6.5 2.5 3 5.4 9.1 7.6 6.1 2.1 14.9 2.7 24.3.7s17.3-6.1 22-10.5c4.7-4.5 5.8-8.1 5.3-10.6-.6-2.5-3-5.4-9.1-7.6-8.3-2.4-16.6-2.4-24.4-.7zm-133.4 5.7c12.2 2.6 22.7 7.9 30.4 15.1 7.6 7.2 12.8 17.1 10.5 27.5-2.3 10.5-11 17.4-21 20.8-9.9 3.3-21.7 3.8-33.9 1.1-12.2-2.6-22.7-7.9-30.4-15-7.6-7.2-12.8-17.1-10.5-27.6 2.3-10.5 11-17.4 21-20.7 11.5-3.6 23-3.4 33.9-1.2zm-28.2 18.2c-6.1 2.1-8.6 5-9.1 7.5-.6 2.6.5 6.2 5.2 10.6 4.7 4.5 12.5 8.6 21.9 10.6 9.4 2.1 18.2 1.5 24.4-.5 6.1-2.2 8.5-5 9.1-7.6.5-2.5-.5-6.1-5.2-10.6-4.8-4.4-12.6-8.6-21.9-10.6-8-1.5-16.7-1.8-24.4.6zM32 338.2c-6.2 1.5-9 4.1-9.8 6.6-.8 2.5-.1 6.1 4.1 11.1 4.3 4.8 11.7 9.7 20.8 12.7 9.2 2.9 18 3.3 24.3 1.8 6.3-1.5 9-4.1 9.8-6.6.8-2.4.1-6.1-4.1-11.1-4.3-4.8-11.6-9.7-20.8-12.7-8.27-2.3-16.36-3.4-24.3-1.8zm336.9 7c-10.3 6.9-20.1 11.5-30.6 13.3 5.3 8.5 16.8 14 24.7 16.2 9.3 2.5 18.1 2.4 24.4.7 6.2-1.9 8.8-4.6 9.5-7.1.6-2.5-.2-6.2-4.7-10.9-7.7-6.2-15.2-10.4-23.3-12.2zm-53.7 34.9c9.9 3.4 18.6 10.3 20.8 20.8 2.2 10.5-3 20.4-10.7 27.5-7.6 7.1-18.2 12.3-30.4 14.9-12.3 2.6-24 2.1-33.9-1.3-10-3.5-18.7-10.4-20.9-20.9-2.2-10.4 3-20.3 10.7-27.5 7.7-7.1 18.2-12.3 30.4-14.9 11.1-2.3 23.6-2.2 34 1.4zM285 396.3c-9.4 2-17.3 6.1-22 10.5-4.7 4.5-5.8 8.1-5.3 10.6.6 2.6 3 5.4 9.1 7.6 6.1 2.1 15 2.7 24.4.7 9.3-2 17.2-6.1 22-10.5 4.6-4.4 5.7-8 5.2-10.6-.5-2.5-3-5.4-9.1-7.6-8.1-2.3-16.3-2.3-24.3-.7zm-201.8 27c-6.4 1-9.3 3.4-10.3 5.8s-.6 6.1 3.2 11.4c3.9 5.2 10.9 10.6 19.7 14.3 9 3.6 17.7 4.6 24.2 3.7 6.3-1 9.3-3.4 10.3-5.8.9-2.4.5-6.1-3.3-11.4-3.9-5.2-10.8-10.6-19.7-14.3-8.15-2.8-16.13-4.7-24.1-3.7zm387.9 34.5c-6.5.1-18.5 1-20.5 8.2-.1 12.5 16 19.8 25.6 22.5H494v-25.3c-7.3-3.4-15.2-5.2-22.9-5.4zm-323.8.8c-4.3 9.9-16.3 16.3-24.7 17.7-3 .4-6.1.6-9.3.5-1.9 6.1 5.6 10.3 9.7 11.7h25.2c8.6-2 15.7-6 20.1-10 4.7-4.5 5.9-8.1 5.3-10.6-.5-2.6-3-5.4-9.1-7.6-6.2-1.6-11.4-2.4-17.2-1.7z"/></svg>);
}