import { ADI_TESTNET_CHAINID } from "@orderly.network/types";
import { isTestnet } from "../src/chain";

describe("chain", () => {
  test("identifies ADI Testnet as a testnet chain", () => {
    expect(isTestnet(ADI_TESTNET_CHAINID)).toBe(true);
  });
});
