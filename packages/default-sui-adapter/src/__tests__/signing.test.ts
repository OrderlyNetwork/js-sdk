import { describe, expect, it } from "vitest";
import {
  buildOffChainSuiDomain,
  buildSuiAddOrderlyKeyText,
  buildSuiRegistrationText,
  buildSuiSettlePnlText,
  buildSuiWithdrawText,
} from "../signing";

describe("SUI signing text builders", () => {
  it("builds registration text", () => {
    expect(
      buildSuiRegistrationText(buildOffChainSuiDomain(101), {
        brokerId: "orderly",
        chainId: 101,
        timestamp: 1700000000000,
        registrationNonce: 7,
      }),
    ).toBe(
      [
        "Orderly Registration v1",
        "domain.name:Orderly",
        "domain.version:1",
        "domain.chainId:101",
        "domain.verifyingContract:0xcccccccccccccccccccccccccccccccccccccccc",
        "brokerId:orderly",
        "chainId:101",
        "timestamp:1700000000000",
        "registrationNonce:7",
        "",
      ].join("\n"),
    );
  });

  it("builds add orderly key text", () => {
    expect(
      buildSuiAddOrderlyKeyText(buildOffChainSuiDomain(202), {
        brokerId: "orderly",
        chainId: 202,
        orderlyKey: "ed25519:abc",
        scope: "read,trading",
        timestamp: 1700000000000,
        expiration: 1700086400000,
      }),
    ).toBe(
      [
        "Orderly AddOrderlyKey v1",
        "domain.name:Orderly",
        "domain.version:1",
        "domain.chainId:202",
        "domain.verifyingContract:0xcccccccccccccccccccccccccccccccccccccccc",
        "brokerId:orderly",
        "chainId:202",
        "orderlyKey:ed25519:abc",
        "scope:read,trading",
        "timestamp:1700000000000",
        "expiration:1700086400000",
        "",
      ].join("\n"),
    );
  });

  it("builds withdraw text", () => {
    expect(
      buildSuiWithdrawText({
        brokerId: "orderly",
        token: "USDC",
        chainId: 303,
        receiver: "0xabc",
        amount: "1000000",
        fee: "100",
        withdrawNonce: "9",
        timestamp: 1700000000000,
      }),
    ).toBe(
      [
        "Orderly Withdraw v1",
        "domain:0x768a5991f3d52b299dee3ad82f4adaeaa9fb91ffcf7afbecbac40c39201773b4",
        "brokerId:orderly",
        "tokenSymbol:USDC",
        "chainId:303",
        "receiver:0x0000000000000000000000000000000000000000000000000000000000000abc",
        "tokenAmount:1000000",
        "fee:100",
        "withdrawNonce:9",
        "timestamp:1700000000000",
        "",
      ].join("\n"),
    );
  });

  it("builds settle pnl text", () => {
    expect(
      buildSuiSettlePnlText(
        {
          name: "Orderly",
          version: "1",
          chainId: 404,
          verifyingContract: "0xABCDEF",
        },
        {
          brokerId: "orderly",
          chainId: 404,
          settleNonce: "11",
          timestamp: 1700000000000,
        },
      ),
    ).toBe(
      [
        "Orderly SettlePnl v1",
        "domain.name:Orderly",
        "domain.version:1",
        "domain.chainId:404",
        "domain.verifyingContract:0xabcdef",
        "brokerId:orderly",
        "chainId:404",
        "settleNonce:11",
        "timestamp:1700000000000",
        "",
      ].join("\n"),
    );
  });
});
