import { fromBase64 } from "@mysten/sui/utils";
import { verifyPersonalMessageSignature } from "@mysten/sui/verify";
import {
  SignatureDomain,
  isSupportedSuiPublicKeyScheme,
  normalizeSuiPublicKeyToBase58,
} from "@orderly.network/core";
import {
  HASH_ORDERLY_NETWORK,
  OFF_CHAIN_VERIFYING_CONTRACT,
  SUI_ALLOWED_SIGNATURE_FLAGS,
  SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR,
} from "./constants";
import { SuiDAppKitBridge, SuiSignatureMessage } from "./internalTypes";
import { bigintString, hex64 } from "./suiUtils";
import { SuiWalletProvider } from "./types";

const textEncoder = new TextEncoder();

export const assertEd25519PersonalMessageSignature = (signature: string) => {
  const bytes = fromBase64(signature);
  if (!SUI_ALLOWED_SIGNATURE_FLAGS.has(bytes[0])) {
    throw new Error(SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR);
  }
};

export const assertEd25519WalletAccount = (scheme?: number) => {
  if (!isSupportedSuiPublicKeyScheme(scheme)) {
    throw new Error(SUI_UNSUPPORTED_ACCOUNT_TYPE_ERROR);
  }
};

export const buildOffChainSuiDomain = (chainId: number): SignatureDomain => ({
  name: "Orderly",
  version: "1",
  chainId,
  verifyingContract: OFF_CHAIN_VERIFYING_CONTRACT,
});

export const buildDomainLines = (domain: SignatureDomain) => [
  `domain.name:${domain.name}`,
  `domain.version:${domain.version}`,
  `domain.chainId:${domain.chainId}`,
  `domain.verifyingContract:${domain.verifyingContract.toLowerCase()}`,
];

export const buildSuiRegistrationText = (
  domain: SignatureDomain,
  message: SuiSignatureMessage,
) =>
  [
    "Orderly Registration v1",
    ...buildDomainLines(domain),
    `brokerId:${String(message.brokerId)}`,
    `chainId:${bigintString(message.chainId)}`,
    `timestamp:${bigintString(message.timestamp)}`,
    `registrationNonce:${bigintString(message.registrationNonce)}`,
    "",
  ].join("\n");

export const buildSuiAddOrderlyKeyText = (
  domain: SignatureDomain,
  message: SuiSignatureMessage,
) =>
  [
    "Orderly AddOrderlyKey v1",
    ...buildDomainLines(domain),
    `brokerId:${String(message.brokerId)}`,
    `chainId:${bigintString(message.chainId)}`,
    `orderlyKey:${String(message.orderlyKey)}`,
    `scope:${String(message.scope)}`,
    `timestamp:${bigintString(message.timestamp)}`,
    `expiration:${bigintString(message.expiration)}`,
    "",
  ].join("\n");

export const buildSuiWithdrawText = (message: SuiSignatureMessage) =>
  [
    "Orderly Withdraw v1",
    `domain:${hex64(HASH_ORDERLY_NETWORK)}`,
    `brokerId:${String(message.brokerId)}`,
    `tokenSymbol:${String(message.token)}`,
    `chainId:${bigintString(message.chainId)}`,
    `receiver:${hex64(String(message.receiver))}`,
    `tokenAmount:${bigintString(message.amount)}`,
    `fee:${bigintString(message.fee)}`,
    `withdrawNonce:${bigintString(message.withdrawNonce)}`,
    `timestamp:${bigintString(message.timestamp)}`,
    "",
  ].join("\n");

export const buildSuiSettlePnlText = (
  domain: SignatureDomain,
  message: SuiSignatureMessage,
) =>
  [
    "Orderly SettlePnl v1",
    ...buildDomainLines(domain),
    `brokerId:${String(message.brokerId)}`,
    `chainId:${bigintString(message.chainId)}`,
    `settleNonce:${bigintString(message.settleNonce)}`,
    `timestamp:${bigintString(message.timestamp)}`,
    "",
  ].join("\n");

export const signSuiPersonalMessage = async (inputs: {
  text: string;
  address: string;
  account?: SuiWalletProvider["account"];
  accountBase58PublicKey?: string;
  dAppKit: SuiDAppKitBridge;
}) => {
  if (typeof inputs.dAppKit.signPersonalMessage !== "function") {
    throw new Error("SUI wallet does not support signPersonalMessage");
  }

  assertEd25519WalletAccount(inputs.account?.publicKeyScheme);

  const message = textEncoder.encode(inputs.text);
  const result = await inputs.dAppKit.signPersonalMessage({ message });

  if (!result?.signature) {
    throw new Error("SUI wallet did not return a personal-message signature");
  }

  assertEd25519PersonalMessageSignature(result.signature);
  const verifiedPublicKey = await verifyPersonalMessageSignature(
    message,
    result.signature,
    { address: inputs.address },
  );
  const verifiedBase58PublicKey =
    normalizeSuiPublicKeyToBase58(verifiedPublicKey);

  if (
    verifiedBase58PublicKey &&
    inputs.accountBase58PublicKey &&
    verifiedBase58PublicKey !== inputs.accountBase58PublicKey
  ) {
    throw new Error("SUI signature public key does not match wallet account");
  }

  return result.signature;
};
