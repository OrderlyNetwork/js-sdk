import { describe, expect, it } from "vitest";
import {
  DEFAULT_WALLET_MODE,
  parseWalletMode,
  WALLET_MODES,
} from "./walletMode";

describe("parseWalletMode", () => {
  it.each(WALLET_MODES)("accepts the %s wallet mode", (mode) => {
    expect(parseWalletMode(mode)).toBe(mode);
  });

  it.each([undefined, null, "", "PRIVY", "external", "false", "unknown"])(
    "defaults to Privy for %s",
    (value) => {
      expect(parseWalletMode(value)).toBe(DEFAULT_WALLET_MODE);
    },
  );
});
