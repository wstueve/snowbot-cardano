// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { extractBech32StakeAddress } from "./util";

//unit test the function
describe("extractBech32StakeAddress", () => {
    it("should extract the stake address from a bech32 payment address", () => {
        const paymentAddress = "addr1qxdvcswn0exwc2vjfr6u6f6qndfhmk94xjrt5tztpelyk4yg83zn9d4vrrtzs98lcl5u5q6mv7ngmg829xxvy3g5ydls7c76wu";
        const stakeAddress = extractBech32StakeAddress(paymentAddress);
        expect(stakeAddress).toBe("stake1uxyrc3fjk6kp343gznlu06w2qddk0f5d5r4znrxzg52zxlclk0hlq");
    });

    //test for enterprise address
    it("should return undefined for short address", () => {
        const actual = extractBech32StakeAddress("addr1q9gq2");
        expect(actual).toBe(undefined);
    });

    it("should return undefined for enterprise address", () => {
        const actual = extractBech32StakeAddress("addr1v9u7va2sktlnz8dp3qadpnxxlv4m03672jy6elmntlxxs7q9nnwl9");
        expect(actual).toBe(undefined);
    });
});
