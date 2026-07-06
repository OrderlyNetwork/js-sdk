export const SUI_DEPOSIT_EXECUTION_GAS = BigInt("100000000");

// Dev-inspect overpay cap used only to let LayerZero build the simulated send PTB;
// the UI and final transaction use the nativeFee parsed from that simulation.
export const SUI_DEPOSIT_QUOTE_PROBE_FEE = BigInt("1000000000");

export const DEFAULT_RECEIPT_BASE_INTERVAL = 1_000;
export const DEFAULT_RECEIPT_MAX_INTERVAL = 10_000;
export const DEFAULT_RECEIPT_MAX_RETRIES = 30;

export const SUI_SIGNATURE_VERSION = "v2";
export const SUI_ED25519_SIGNATURE_FLAG = 0x00;

// Only Ed25519 is supported today. Supporting Secp256k1 or other schemes
// requires updating identity/accountId, deposit, link-device, and backend
// verification flows together because they currently assume Ed25519 public keys.
export const SUI_ALLOWED_SIGNATURE_FLAGS = new Set([
  SUI_ED25519_SIGNATURE_FLAG,
]);

export const SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR =
  "connector.sui.unsupportedAccountType";

export const OFF_CHAIN_VERIFYING_CONTRACT =
  "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC";

// keccak256("Orderly Network"). Fixed Orderly domain hash included in Sui
// withdraw personal-message signing.
export const HASH_ORDERLY_NETWORK =
  "0x768a5991f3d52b299dee3ad82f4adaeaa9fb91ffcf7afbecbac40c39201773b4";
