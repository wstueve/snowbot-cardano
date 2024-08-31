// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import cardano_serialization_lib from "@emurgo/cardano-serialization-lib-nodejs";

function extractBech32StakeAddress(bech32PaymentAddress: string) {
    try {
        const addr = cardano_serialization_lib.Address.from_bech32(bech32PaymentAddress);
        const hex = Buffer.from(addr.to_bytes()).toString('hex');
        const stakeWords = "e1" + hex.slice(-56); //e1 for mainnet
        const stake = Buffer.from(stakeWords, 'hex');
        const stakeAddress = cardano_serialization_lib.Address.from_bytes(stake);
        return stakeAddress.to_bech32();
    }
    catch (error) {
        console.warn(`Error extracting stake address from ${bech32PaymentAddress}:` + error);
        return undefined;
    }
}

function isAddressValid(address: string) {
    try {
      let isValid = true;
      const cAddress = cardano_serialization_lib.Address.from_bech32(address);
      if (!cAddress || !cAddress.to_hex()) {
        console.error(`Invalid address: ${address}`);
        cAddress.free();
        isValid = false;
      }
      cAddress.free();
      return isValid;
    }
    catch (error) {
        console.warn(`Invalid address: ${address}` + error);
        return false;
    }
}

export {extractBech32StakeAddress, isAddressValid};