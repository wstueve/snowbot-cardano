// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
import Ajv, { ValidateFunction } from "ajv";

const ajv = new Ajv();

// Define the schema for NftMetadataAsset validation
const nftMetadataAssetSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    image: { type: ["string", "array"], items: { type: "string" } },
  },
  required: ["name", "image"],
  additionalProperties: true,
};

const nftMetadataAssetNameSchema = {
  type: "object",
  patternProperties: {
    "^.*$": nftMetadataAssetSchema,
  },
};

// Define the schema for NftMetadataPolicy validation
const nftMetadataPolicySchema = {
  type: "object",
  patternProperties: {
    "^.*$": nftMetadataAssetNameSchema,
  },
  additionalProperties: false,
};

// Define the schema for NftMetadata validation
const nftMetadataSchema = {
  type: "object",
  properties: {
    721: {
      type: "object",
      patternProperties: {
        "^.*$": nftMetadataPolicySchema,
      },
      additionalProperties: false,
    },
    version: { type: "number", enum: [1, 2] },
  },
  required: ["721"],
};

// Compile the schemas
export const validateNftMetadataAsset: ValidateFunction = ajv.compile(nftMetadataAssetSchema);
export const validateNftMetadataAssetName: ValidateFunction = ajv.compile(nftMetadataAssetNameSchema);
export const validateNftMetadataPolicy: ValidateFunction = ajv.compile(nftMetadataPolicySchema);
export const validateNftMetadata: ValidateFunction = ajv.compile(nftMetadataSchema);
