// This is free and unencumbered software released into the public domain.
// Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.
// In jurisdictions that recognize copyright laws, the author or authors of this software dedicate any and all copyright interest in the software to the public domain. We make this dedication for the benefit of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of relinquishment in perpetuity of all present and future rights to this software under copyright law.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// For more information, please refer to <http://unlicense.org/>
export enum EpochStatus {
  ACCUMULATING = "accumulating",
  PROCESSING = "processing",
  REWARDED = "rewarded",
}

export enum JobStatus {
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum RewardAccountType {
  USER = "user",
  ASSET = "asset",
}

export enum LedgerTransactionType {
  EPOCH_ASSET_REWARD = "credit",
  EPOCH_TRANSFER_FROM_ASSET = "transfer-from-asset",
  EPOCH_TRANSFER_TO_USER = "transfer-to-user",
}

export enum SnapshotType {
  EPOCH_HOLDER = "epoch_holder",
}

export enum DistributionType {
  EPOCH_REWARDS = "epoch_rewards",
}

export enum WithdrawalStatus {
  PENDING = "pending", //limited by max number of concurrent withdrawals per project
  ON_CHAIN = "on_chain_found", //the transaction was found and processed to the blockchain
  ON_CHAIN_FINAL = "on_chain_final", //the transaction was not reversed for 6 blocks
  FAILED = "failed",
  SUCCESS = "success", //this is done only within the same transaction as the balance update and ledger creation
}

export enum AirdropBatchStatus {
  NEW = "new",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}