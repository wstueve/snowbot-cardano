// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { formatIntegerAsDecimal, hexToString, stringToHex } from './stringUtil';

describe('hexToString', () => {
    it('should convert a hex string to a string', () => {
        const hex = "6d6f6f6e";
        const str = hexToString(hex);
        expect(str).toBe("moon");
    });
});

describe('stringToHex', () => {
    it('should convert a string to a hex string', () => {
        const str = "moon";
        const hex = stringToHex(str);
        expect(hex).toBe("6d6f6f6e");
    });
});

describe('formatIntegerAsDecimal', () => {
    it('should format integer as decimal with default separator', () => {
        expect(formatIntegerAsDecimal(123456, 2)).toBe('1234.56');
    });

    it('should format integer as decimal with custom separator', () => {
        expect(formatIntegerAsDecimal(123456, 2, ',')).toBe('1234,56');
    });

    it('should add leading zero if decimal index is 0', () => {
        expect(formatIntegerAsDecimal(99, 2)).toBe('0.99');
    });

    it('should add leading zero and pad with zeros if decimal index is less than 0', () => {
        expect(formatIntegerAsDecimal(9, 2)).toBe('0.09');
    });
});