import { LocalStorageStore, MockKeyStore } from "./keyStore";
import { BaseSigner } from "./signer";

export const getMockSigner = (secretKey?: string) => {
  const mockKeyStore = new MockKeyStore(
    secretKey ||
      "0cc31f8a253c92b5cf9461f8d7a128ef24083eb8556f5a73831558fade2c3ff4"
  );

  return new BaseSigner(mockKeyStore);
};

export const getDefaultSigner = () => {
  if (typeof window === "undefined") {
    throw new Error("the default signer only supports browsers.");
  }

  const localStorageStore = new LocalStorageStore("", "");

  return new BaseSigner(localStorageStore);
};
