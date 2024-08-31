// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import { CreateSecretCommand, GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { CreateProjectMintPolicyCommand, PolicySecrets } from '../type/mint';
import { SaveWalletSeedCommand } from '../type/transaction';

export async function getCompositeSecret(secretKeys: string): Promise<string> {
    const keys = secretKeys.split(" ");
   
    //don't use async map here, it will not work as expected as it's not deterministic
    const secrets: string[] = [];
    for (let i = 0; i < keys.length; i++) {
        secrets[i] = await getSecretString(`${process.env.SECRETS_PREFIX}/${keys[i]}`);
    }

    return secrets.join(" ").replace(/\"/g, "");
}

async function getSecretString(secretKey: string): Promise<string> {
    const client = new SecretsManagerClient({
        region: "us-east-1",
    });

    let response;

    try {
        response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretKey,
                VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            })
        );
    } catch (error) {
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw error;
    }

    const secret = response.SecretString;
    if (!secret) {
        throw new Error("Failed to retrieve secret");
    }
    return secret;
}

export async function getSecrets(projectMintPolicy: any): Promise<PolicySecrets> {
    const secret = await getSecretString(`${process.env.SECRETS_PREFIX}/${projectMintPolicy.secretKey}`);
    return JSON.parse(secret);
}

export async function saveSecrets(projectMintPolicy: CreateProjectMintPolicyCommand, policySecret: any) {
    const secret_name = `${process.env.SECRETS_PREFIX}/${projectMintPolicy.secretKey}`;
    return await saveSecretInternal(secret_name, JSON.stringify(policySecret));
}

export async function saveWalletSeed(saveWalletSeedCommand: SaveWalletSeedCommand) {
    for (const chunk of saveWalletSeedCommand.chunks) {
        const name = `${process.env.SECRETS_PREFIX}/${chunk.secretId}`;
        await saveSecretInternal(name, chunk.seedChunk);
    }
}

async function saveSecretInternal(name: string, secret: string) {
    const client = new SecretsManagerClient({
        region: "us-east-1",
    });

    let response;

    console.log(`Saving secret: ${name} with value: ${secret}`)

    try {
        response = await client.send(
            new CreateSecretCommand({
                Name: name,
                SecretString: secret,
            })
        );
        return response;
    } catch (error) {
        console.error(error);
        // For a list of exceptions thrown, see
        // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
        throw error;
    }
}