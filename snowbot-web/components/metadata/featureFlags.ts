// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
export type FeatureFlagsJson = {
    testing: boolean;
    minting: boolean;
    deposits: boolean;
    admin: boolean;
    withdrawals: boolean;
    createProjectWallet: boolean;

}

export class FeatureFlags {
    static readonly ENABLED = true;
    static readonly DISABLED = false;

    hostname: string;
    constructor(hostname: string | undefined) {
        if (!hostname) {
            throw new Error("Hostname is required");
        }
        this.hostname = hostname;
    }

    json() : FeatureFlagsJson {
        return {
            testing: this.testing(),
            minting: this.minting(),
            deposits: this.deposits(),
            admin: this.admin(),
            withdrawals: this.withdrawals(),
            createProjectWallet: this.createProjectWallet(),
        }
    }

    testing() {
        return this.localhost() && process.env.CARDANO_NETWORK === "preprod"; //don't want to test on mainnet by accident
    }

    minting() {
        return this.localhost();
    }
    
    airdrop() {
        return this.localhost() || this.preprod() || this.prod();
    }

    deposits() {
        return this.localhost();
    }

    admin() {
        return this.localhost();
    }
    
    withdrawals() {
        return this.localhost();
    }

    createProjectWallet() {
        return this.localhost();
    }

    private localhost() {
        return this.hostname === "localhost:3000" && process.env.NEXTAUTH_URL === "http://localhost:3000"
            ? FeatureFlags.ENABLED
            : FeatureFlags.DISABLED;
    }

    private preprod() {
        return process.env.NEXTAUTH_URL === "https://"
            ? FeatureFlags.ENABLED
            : FeatureFlags.DISABLED;
    }

    private prod() {
        return process.env.NEXTAUTH_URL === "https://" || process.env.NEXTAUTH_URL === "https://www."
            ? FeatureFlags.ENABLED
            : FeatureFlags.DISABLED;
    }
}