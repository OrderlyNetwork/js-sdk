import { definedTypes } from "@orderly.network/types";
import { LocalStorageStore, MockKeyStore } from "./keyStore";
import { BaseSigner } from "./signer";
import { SignatureDomain } from "./utils";

export const getMockSigner = (secretKey?: string) => {
  const mockKeyStore = new MockKeyStore(
    secretKey || "AFmQSju4FhDwG93cMdKogcnKx7SWmViDtDv5PVzfvRDF"
    // "c24fe227663f5a73493cad3f4049514f70623177272d57fffa8cb895fa1f92de"
  );

  return new BaseSigner(mockKeyStore);
};

export const getDefaultSigner = () => {
  if (typeof window === "undefined") {
    throw new Error("the default signer only supports browsers.");
  }

  const localStorageStore = new LocalStorageStore("");

  return new BaseSigner(localStorageStore);
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

/**
 * generate `registerAccount` data and to be signed message structure
 */
export function generateRegisterAccountMessage(inputs: {
  chainId: number;
  registrationNonce: number;
  brokerId: string;
  timestamp?: number;
}) {
  const {
    chainId,
    registrationNonce,
    brokerId,
    timestamp = Date.now(),
  } = inputs;
  // const now = Date.now();
  const primaryType = "Registration";
  const message = {
    brokerId,
    chainId,
    timestamp,
    registrationNonce,
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

  return [message, toSignatureMessage] as const;
}

/**
 * generate `addOrderlyKey` data and to be signed message structure
 */
export function generateAddOrderlyKeyMessage(inputs: {
  publicKey: string;
  chainId: number;
  brokerId: string;
  primaryType: keyof typeof definedTypes;
  expiration?: number;
  timestamp?: number;
  scope?: string;
}) {
  const {
    publicKey,
    chainId,
    primaryType,
    brokerId,
    expiration = 365,
    timestamp = Date.now(),
    scope = "read,trading",
  } = inputs;
  // const now = Date.now();
  // message;
  const message = {
    brokerId,
    orderlyKey: publicKey,
    scope,
    chainId,
    timestamp,
    expiration: timestamp + 1000 * 60 * 60 * 24 * expiration,
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

  return [message, toSignatureMessage] as const;
}

/**
 * generate `settle` data and to be signed message structure
 */
export function generateSettleMessage(inputs: {
  chainId: number;
  brokerId: string;
  settlePnlNonce: string;
  domain: SignatureDomain;
}) {
  const { chainId, settlePnlNonce, domain, brokerId } = inputs;
  const primaryType = "SettlePnl";
  const timestamp = new Date().getTime();

  const typeDefinition = {
    EIP712Domain: definedTypes.EIP712Domain,
    [primaryType]: definedTypes[primaryType],
  };

  const message = {
    brokerId,
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

  return [message, toSignatureMessage] as const;
}
