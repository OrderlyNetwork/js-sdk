import { MemoryConfigStore } from "./configStore";

import { LocalStorageStore, MockKeyStore } from "./keyStore";
import { BaseSigner } from "./signer";

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

export const getMemoryConfigStore = () => {
  return new MemoryConfigStore();
};

//
