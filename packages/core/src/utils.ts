import { definedTypes } from "./constants";

export type SignatureDomain = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
};

export const base64url = function (aStr: string): string {
  return aStr.replace(/\+/g, "-").replace(/\//g, "_");
};

export function getVerifyingContract() {
  return "0x8794E7260517B1766fc7b55cAfcd56e6bf08600e";
}

export function getDomain(chainId: number, onChainDomain?: boolean) {
  return {
    name: "Orderly",
    version: "1",
    chainId,
    verifyingContract: onChainDomain
      ? getVerifyingContract()
      : "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
  };
}

export function generateRegisterAccountMessage(inputs: {
  chainId: number;
  registrationNonce: number;
}) {
  const { chainId, registrationNonce } = inputs;
  const now = Date.now();
  const primaryType = "Registration";
  const message = {
    brokerId: "woofi_dex",
    chainId,
    timestamp: now,
    registrationNonce,
  };

  const typeDefinition = {
    EIP712Domain: definedTypes.EIP712Domain,
    [primaryType]: definedTypes[primaryType],
  };

  return [
    message,
    {
      domain: getDomain(chainId),
      message,
      primaryType,
      types: typeDefinition,
    },
  ];
}

export function generateAddOrderlyKeyMessage(inputs: {
  publicKey: string;
  chainId: number;
  primaryType: string;
  expiration: number;
}) {
  const { publicKey, chainId, primaryType, expiration = 365 } = inputs;
  const now = Date.now();
  // message;
  const message = {
    brokerId: "woofi_dex",
    orderlyKey: publicKey,
    scope: "read,trading",
    chainId,
    timestamp: now,
    expiration: now + 1000 * 60 * 60 * 24 * expiration,
  };

  const typeDefinition = {
    EIP712Domain: definedTypes.EIP712Domain,
    [primaryType]: definedTypes[primaryType],
  };

  const toSignatureMessage = {
    domain: getDomain(chainId),
    message,
    primaryType,
    types: typeDefinition,
  };

  return [message, toSignatureMessage];
}

export function generateSettleMessage(inputs: {
  chainId: number;
  settlePnlNonce: string;
  domain: SignatureDomain;
}) {
  const { chainId, settlePnlNonce, domain } = inputs;
  const primaryType = "SettlePnl";
  const timestamp = new Date().getTime();

  const typeDefinition = {
    EIP712Domain: definedTypes.EIP712Domain,
    [primaryType]: definedTypes[primaryType],
  };

  const message = {
    brokerId: "woofi_dex",
    chainId: chainId,
    timestamp: timestamp,
    settleNonce: settlePnlNonce,
  };

  const toSignatureMessage = {
    domain,
    message,
    primaryType,
    types: typeDefinition,
  };

  return [message, toSignatureMessage];
}
