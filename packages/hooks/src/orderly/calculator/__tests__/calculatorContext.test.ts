import { API } from "@orderly.network/types";
import { CalculatorScope } from "../../../types";
import { useAppStore } from "../../appStore";
import { CalculatorContext } from "../calculatorContext";

jest.mock("../../appStore", () => ({
  useAppStore: {
    getState: jest.fn(),
  },
}));

const getStateMock = useAppStore.getState as unknown as jest.Mock;

const binaryRow = (symbol: string, imrFactor: number): API.SymbolExt =>
  ({
    symbol,
    base_imr: 1,
    base_mmr: 0,
    imr_factor: imrFactor,
  }) as unknown as API.SymbolExt;

const perpSymbolsInfo = () =>
  ({
    PERP_BTC_USDC: { base_imr: 0.05, base_mmr: 0.02 },
  }) as unknown as Record<string, API.SymbolExt>;

const accountInfo = () =>
  ({
    account_id: "test_account",
    imr_factor: { PERP_BTC_USDC: 0.1 },
  }) as unknown as API.AccountInfo;

const stateWith = (overrides: Record<string, unknown> = {}) => ({
  accountInfo: accountInfo(),
  symbolsInfo: perpSymbolsInfo(),
  fundingRates: {},
  tokensInfo: [],
  ...overrides,
});

/** One setCtxData pass on the shared singleton with the current mock state. */
const tick = () => CalculatorContext.create(CalculatorScope.POSITION, {});

describe("CalculatorContext.setCtxData composition memo", () => {
  beforeEach(() => {
    getStateMock.mockReset();
  });

  test("reuses the composed records while store inputs keep their references", () => {
    getStateMock.mockReturnValue(
      stateWith({
        binarySymbolsInfo: {
          PERP_BTC5M2609291200_USDC: binaryRow(
            "PERP_BTC5M2609291200_USDC",
            0.000000091,
          ),
        },
      }),
    );
    const ctx = tick();
    const symbolsInfo = ctx.symbolsInfo;
    const accountInfo = ctx.accountInfo;

    // The next tick must reuse the composed objects instead of re-spreading
    // the ~800-key records on every calculator update.
    tick();

    expect(ctx.symbolsInfo).toBe(symbolsInfo);
    expect(ctx.accountInfo).toBe(accountInfo);
  });

  test("recomposes when a binary snapshot reference changes", () => {
    const symbol = "PERP_BTC5M2609291200_USDC";
    getStateMock.mockReturnValue(
      stateWith({
        binarySymbolsInfo: { [symbol]: binaryRow(symbol, 0.000000091) },
      }),
    );
    const ctx = tick();
    const firstCompose = ctx.symbolsInfo;

    getStateMock.mockReturnValue(
      stateWith({
        binarySymbolsInfo: {
          [symbol]: binaryRow(symbol, 0.000000091),
          PERP_ETH5M2609291200_USDC: binaryRow(
            "PERP_ETH5M2609291200_USDC",
            0.000000091,
          ),
        },
      }),
    );
    tick();

    expect(ctx.symbolsInfo).not.toBe(firstCompose);
    expect(ctx.symbolsInfo?.PERP_ETH5M2609291200_USDC).toBeDefined();
  });

  test("recomposes when the accountInfo reference changes", () => {
    const binarySymbolsInfo = {
      PERP_BTC5M2609291200_USDC: binaryRow(
        "PERP_BTC5M2609291200_USDC",
        0.000000091,
      ),
    };
    // One state object so the "unchanged" pass reuses every inner reference.
    const state = stateWith({ binarySymbolsInfo });
    getStateMock.mockReturnValue(state);
    const ctx = tick();
    const beforeAccount = ctx.accountInfo;

    // Same inputs again: unchanged.
    tick();
    expect(ctx.accountInfo).toBe(beforeAccount);

    // New accountInfo reference: recompose (imr_factor fill reruns).
    getStateMock.mockReturnValue(
      stateWith({ binarySymbolsInfo, accountInfo: accountInfo() }),
    );
    tick();
    expect(ctx.accountInfo).not.toBe(beforeAccount);
  });

  test("fills imr_factor for binary symbols missing from client info", () => {
    const symbol = "PERP_BTC5M2609291200_USDC";
    getStateMock.mockReturnValue(
      stateWith({
        binarySymbolsInfo: { [symbol]: binaryRow(symbol, 0.000000091) },
      }),
    );
    const ctx = tick();

    expect(ctx.accountInfo?.imr_factor[symbol]).toBe(0.000000091);
    // Existing client-info entries are never overwritten.
    expect(ctx.accountInfo?.imr_factor.PERP_BTC_USDC).toBe(0.1);
  });

  test("passes symbolsInfo through by reference without a binary snapshot", () => {
    const state = stateWith();
    getStateMock.mockReturnValue(state);
    const ctx = tick();

    expect(ctx.symbolsInfo).toBe(state.symbolsInfo);
  });

  test("rehydrates accountInfo after clearCache on the next update", () => {
    getStateMock.mockReturnValue(stateWith());
    const ctx = tick();
    const composed = ctx.accountInfo;

    ctx.clearCache();
    expect(ctx.accountInfo).toBeUndefined();

    tick();
    expect(ctx.accountInfo).toBe(composed);
  });
});
