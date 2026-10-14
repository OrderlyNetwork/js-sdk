import { API, MarginMode } from "@orderly.network/types";
import { formatPortfolio as formatAccountPortfolio } from "../../../orderly/calculator/formatPortfolio";
import { formatPositions as formatAccountPositions } from "../../../orderly/calculator/formatPositions";
import { createGetter } from "../../../utils/createGetter";
import { formatPortfolio } from "../portfolio";
import { calcByPrice, formatPositions } from "../positions";

const binary = "PERP_BTC5M2608271200_USDC";
const plainSymbols = {
  PERP_ETH_USDC: { base_imr: 0.1, base_mmr: 0.05 },
} as unknown as Record<string, API.SymbolExt>;
const symbols = createGetter(plainSymbols);
const accountInfo = {
  imr_factor: { PERP_ETH_USDC: 0.0000001 },
} as unknown as API.AccountInfo;
const holding = [{ token: "USDC", holding: 100 }] as API.Holding[];
const markPrices = { PERP_ETH_USDC: 100, [binary]: 0.5 };
const row = {
  symbol: binary,
  position_qty: 10,
  mark_price: 0.5,
  average_open_price: 0.6,
  cost_position: 6,
  last_sum_unitary_funding: null,
  margin: 6,
  margin_mode: MarginMode.ISOLATED,
  pending_long_qty: 0,
  pending_short_qty: 0,
  mmr: 0,
  leverage: 1,
} as unknown as API.Position;

describe("shared current-account and subaccount equity", () => {
  test.each([
    { qty: 10, cost: 6, margin: 6, mark: 0.5, pnl: -1, value: 105 },
    { qty: 10, cost: 4, margin: 4, mark: 0.5, pnl: 1, value: 105 },
    { qty: -10, cost: -6, margin: 4, mark: 0.5, pnl: 1, value: 105 },
    { qty: -10, cost: -4, margin: 6, mark: 0.5, pnl: -1, value: 105 },
    { qty: 0, cost: 5, margin: 5, mark: 0, pnl: -5, value: 100 },
    { qty: 0, cost: -5, margin: -5, mark: 1, pnl: 5, value: 100 },
  ])("values qty=$qty and signed cost=$cost identically", (sample) => {
    const data = {
      rows: [
        {
          ...row,
          position_qty: sample.qty,
          cost_position: sample.cost,
          margin: sample.margin,
          mark_price: sample.mark,
        },
      ],
    } as API.PositionInfo;
    const subPositions = formatPositions(data, accountInfo, symbols, {});
    const mainPositions = formatAccountPositions(data, {
      accountInfo,
      symbolsInfo: plainSymbols,
      fundingRates: {},
    });
    expect(subPositions).toEqual(mainPositions);
    const sub = formatPortfolio({
      positions: subPositions,
      holding,
      markPrices,
      indexPrices: {},
      accountInfo,
      symbolsInfo: symbols,
    })!;
    const main = formatAccountPortfolio({
      positions: mainPositions,
      holding,
      markPrices,
      indexPrices: {},
      accountInfo,
      symbolsInfo: plainSymbols,
      perpSymbolsInfo: plainSymbols,
    });
    expect(sub).toEqual(main);
    expect(sub.totalValue.toNumber()).toBe(sample.value);
    expect(sub.unsettledPnL).toBe(sample.pnl);
    expect(sub.perpUnsettledPnL).toBe(0);
    expect(sub.availableBalance).toBe(100);
  });

  test("retains ordinary CROSS funding and risk calculations with the getter adapter", () => {
    const perp = {
      ...row,
      symbol: "PERP_ETH_USDC",
      position_qty: 1,
      mark_price: 100,
      average_open_price: 95,
      cost_position: 95,
      margin: 0,
      margin_mode: MarginMode.CROSS,
      leverage: 10,
      last_sum_unitary_funding: 0.1,
    };
    const funding = {
      PERP_ETH_USDC: { sum_unitary_funding: 0.2 },
    } as unknown as Record<string, API.FundingRate>;
    for (const mark of [0, 0.5, 1]) {
      const priced = calcByPrice({ rows: [perp, row] } as API.PositionInfo, {
        ...markPrices,
        [binary]: mark,
      })!;
      const positions = formatPositions(priced, accountInfo, symbols, funding);
      const assets = formatPortfolio({
        positions,
        holding,
        markPrices,
        indexPrices: {},
        accountInfo,
        symbolsInfo: symbols,
      })!;
      expect(positions.total_unsettled_cross_pnl).toBe(4.9);
      expect(assets.perpUnsettledPnL).toBe(4.9);
      expect(assets.availableBalance).toBe(104.9);
      expect(assets.freeCollateral.toNumber()).toBe(94.9);
    }
  });

  test("does not publish funds while ordinary symbol config is still loading", () => {
    expect(
      formatPortfolio({
        positions: { rows: [row] } as API.PositionsTPSLExt,
        holding,
        markPrices,
        indexPrices: {},
        accountInfo,
        symbolsInfo: createGetter(undefined),
      }),
    ).toBeNull();
  });
});
