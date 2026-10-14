import { act, renderHook } from "@testing-library/react";
import { API, MarginMode } from "@orderly.network/types";
import { CalculatorScope } from "../../../types";
import { useAppStore } from "../../appStore";
import { useCollateral } from "../../useCollateral";
import { usePerpUnsettledPnL } from "../../usePerpUnsettledPnL";
import { CalculatorContext } from "../calculatorContext";
import { IndexPriceCalculatorName } from "../indexPrice";
import { MarketCalculatorName } from "../markPrice";
import { PortfolioCalculator } from "../portfolio";
import { PositionCalculator } from "../positions";

const binarySymbol = "PERP_BTC5M2609290635_USDC";
const perpSymbolsInfo = {
  PERP_BTC_USDC: { base_imr: 0.1, base_mmr: 0.05 },
  PERP_ETH_USDC: { base_imr: 0.1, base_mmr: 0.05 },
} as unknown as Record<string, API.SymbolExt>;
const binaryConfig = {
  [binarySymbol]: { base_imr: 1, base_mmr: 0, imr_factor: 0 },
} as unknown as Record<string, API.SymbolExt>;

function binaryPosition(overrides: Partial<API.Position> = {}): API.Position {
  return {
    symbol: binarySymbol,
    position_qty: 10,
    cost_position: 6,
    average_open_price: 0.6,
    mark_price: 0.5,
    margin: 6,
    margin_mode: MarginMode.ISOLATED,
    pending_long_qty: 0,
    pending_short_qty: 0,
    last_sum_unitary_funding: null,
    leverage: 1,
    mmr: 0,
    unsettled_pnl: 99,
    ...overrides,
  } as unknown as API.Position;
}

function createChain(rows: API.Position[]) {
  const positions = new PositionCalculator();
  const portfolio = new PortfolioCalculator();
  const ctx = new CalculatorContext(CalculatorScope.POSITION, {});
  ctx.saveOutput(IndexPriceCalculatorName, {});
  ctx.saveOutput(MarketCalculatorName, {
    PERP_BTC_USDC: 100,
    PERP_ETH_USDC: 50,
  });

  const calculate = (scope: CalculatorScope, data: unknown) => {
    const input =
      scope === CalculatorScope.MARK_PRICE
        ? {
            ...ctx.get(
              (output) =>
                output[MarketCalculatorName] as Record<string, number>,
            ),
            ...(data as Record<string, number>),
          }
        : data;
    if (scope === CalculatorScope.MARK_PRICE) {
      ctx.saveOutput(MarketCalculatorName, input);
    }
    const result = positions.calc(scope, input, ctx)!;
    ctx.saveOutput(positions.name, result);
    const assets = portfolio.calc(scope, input, ctx)!;
    ctx.saveOutput(portfolio.name, assets);
    return { result, assets };
  };

  return {
    calculate,
    initial: calculate(CalculatorScope.POSITION, {
      rows,
      total_unsettled_pnl: 123,
    }),
    portfolio,
    ctx,
  };
}

describe("Prediction equity and ordinary Perp funding PnL", () => {
  beforeEach(() => {
    useAppStore.getState().actions.cleanAll();
    useAppStore.setState({
      accountInfo: {
        imr_factor: { PERP_BTC_USDC: 0.0000001, PERP_ETH_USDC: 0.0000001 },
      } as unknown as API.AccountInfo,
      symbolsInfo: perpSymbolsInfo,
      binarySymbolsInfo: undefined,
      fundingRates: {
        PERP_BTC_USDC: { sum_unitary_funding: 0.25 },
        PERP_ETH_USDC: { sum_unitary_funding: 0.5 },
      } as unknown as Record<string, API.FundingRate>,
    });
    useAppStore
      .getState()
      .actions.restoreHolding([{ token: "USDC", holding: 100 } as API.Holding]);
  });

  afterEach(() => {
    act(() => useAppStore.getState().actions.cleanAll());
  });

  describe.each([false, true])("Binary config present: %s", (configured) => {
    test.each([
      { qty: 10, cost: 6, margin: 6, mark: 0.5, pnl: -1, value: 105 },
      { qty: 10, cost: 4, margin: 4, mark: 0.5, pnl: 1, value: 105 },
      { qty: -10, cost: -6, margin: 4, mark: 0.5, pnl: 1, value: 105 },
      { qty: -10, cost: -4, margin: 6, mark: 0.5, pnl: -1, value: 105 },
      { qty: 0, cost: 5, margin: 5, mark: 0, pnl: -5, value: 100 },
      { qty: 0, cost: -5, margin: -5, mark: 1, pnl: 5, value: 100 },
      {
        qty: 10,
        cost: 6.0015,
        margin: 6,
        mark: 0.5,
        pnl: -1.0015,
        value: 104.9985,
      },
    ])("values signed position $qty with cost $cost", (sample) => {
      if (configured) {
        useAppStore.getState().actions.setBinarySymbolsInfo(binaryConfig);
      }
      const row = binaryPosition({
        position_qty: sample.qty,
        cost_position: sample.cost,
        average_open_price: 0.6,
        margin: sample.margin,
        mark_price: sample.mark,
      });
      const { initial } = createChain([row]);
      expect(initial.result.rows[0].unsettled_pnl).toBe(sample.pnl);
      expect(initial.result.total_unsettled_pnl).toBe(sample.pnl);
      expect(initial.result.total_unsettled_isolated_pnl).toBe(sample.pnl);
      expect(initial.result.total_unsettled_cross_pnl).toBe(0);
      expect(initial.result.rows[0].mm).toBe(0);
      expect(initial.assets.totalValue.toNumber()).toBe(sample.value);
      expect(initial.assets.unsettledPnL).toBe(sample.pnl);
      expect(initial.assets.perpUnsettledPnL).toBe(0);
      expect(initial.assets.availableBalance).toBe(100);
      expect(initial.assets.freeCollateral.toNumber()).toBe(100);
      expect(row.unsettled_pnl).toBe(99);
    });
  });

  test("revalues repeated mark ticks including exact zero without duplicating PnL", () => {
    const chain = createChain([binaryPosition()]);
    for (const [mark, pnl, value] of [
      [0, -6, 100],
      [0, -6, 100],
      [1, 4, 110],
      [1, 4, 110],
      [0.5, -1, 105],
    ]) {
      const { result, assets } = chain.calculate(CalculatorScope.MARK_PRICE, {
        [binarySymbol]: mark,
      });
      expect(result.rows[0].mark_price).toBe(mark);
      expect(result.total_unsettled_pnl).toBe(pnl);
      expect(assets.totalValue.toNumber()).toBe(value);
      expect(assets.availableBalance).toBe(100);
    }
  });

  test("preserves mixed Perp funding and CROSS risk limits before and after Binary config loads", () => {
    const rows = [
      {
        ...binaryPosition(),
        symbol: "PERP_BTC_USDC",
        position_qty: 1,
        mark_price: 100,
        average_open_price: 95,
        cost_position: 95,
        last_sum_unitary_funding: 0.05,
        margin_mode: MarginMode.CROSS,
        margin: 0,
        leverage: 10,
      },
      {
        ...binaryPosition(),
        symbol: "PERP_ETH_USDC",
        position_qty: 2,
        mark_price: 50,
        average_open_price: 52,
        cost_position: 104,
        last_sum_unitary_funding: 0.2,
        margin: 20,
        leverage: 5,
      },
      binaryPosition(),
    ];
    const chain = createChain(rows);
    const { result, assets } = chain.initial;
    expect(result.total_unsettled_pnl).toBe(-0.8);
    expect(result.total_unsettled_isolated_pnl).toBe(-5.6);
    expect(result.total_unsettled_cross_pnl).toBe(4.8);
    expect(assets.totalValue.toNumber()).toBe(125.2);
    expect(assets.perpUnsettledPnL).toBe(0.2);
    expect(assets.availableBalance).toBe(100.2);
    expect(assets.totalCollateral.toNumber()).toBe(104.8);

    useAppStore.getState().actions.setBinarySymbolsInfo(binaryConfig);
    const configured = createChain(rows).initial;
    expect(configured.assets.totalValue.eq(assets.totalValue)).toBe(true);
    expect(configured.assets.perpUnsettledPnL).toBe(0.2);

    for (const mark of [0, 1]) {
      const next = chain.calculate(CalculatorScope.MARK_PRICE, {
        [binarySymbol]: mark,
      });
      expect(next.assets.perpUnsettledPnL).toBe(assets.perpUnsettledPnL);
      expect(next.assets.availableBalance).toBe(assets.availableBalance);
      expect(next.assets.totalCollateral.eq(assets.totalCollateral)).toBe(true);
      expect(next.assets.freeCollateral.eq(assets.freeCollateral)).toBe(true);
      expect(next.result.total_unsettled_cross_pnl).toBe(4.8);
    }
  });

  test("keeps separate rounds and their residual signed margins in account equity", () => {
    const { initial } = createChain([
      binaryPosition(),
      binaryPosition({
        symbol: "PERP_BTC5M2609290640_USDC",
        position_qty: -10,
        cost_position: -4,
        margin: 6,
      }),
      binaryPosition({
        symbol: "PERP_BTC5M2609290630_USDC",
        position_qty: 0,
        cost_position: -5,
        margin: -5,
      }),
    ]);
    expect(initial.result.total_unsettled_pnl).toBe(3);
    expect(initial.assets.totalValue.toNumber()).toBe(110);
    expect(initial.assets.availableBalance).toBe(100);
  });

  test("publishes full equity PnL publicly and clears internal funding PnL with the account", () => {
    const chain = createChain([binaryPosition()]);
    const { result } = renderHook(() => ({
      collateral: useCollateral(),
      fundingPnL: usePerpUnsettledPnL(),
    }));
    act(() => {
      chain.portfolio.update(
        chain.initial.assets as unknown as Parameters<
          PortfolioCalculator["update"]
        >[0],
        CalculatorScope.POSITION,
      );
    });
    expect(result.current.collateral.unsettledPnL).toBe(-1);
    expect(result.current.collateral.totalValue).toBe(105);
    expect(result.current.fundingPnL).toBe(0);
    act(() => {
      useAppStore.getState().actions.batchUpdateForPortfolio({
        perpUnsettledPnL: 20,
      });
      useAppStore.getState().actions.cleanAll();
    });
    expect(result.current.collateral.unsettledPnL).toBe(0);
    expect(result.current.fundingPnL).toBe(0);
  });

  test("waits for Perp config instead of publishing zero funding PnL at startup", () => {
    const fundingRates = useAppStore.getState().fundingRates;
    useAppStore.setState({ symbolsInfo: undefined, fundingRates: undefined });
    const row = {
      ...binaryPosition(),
      symbol: "PERP_ETH_USDC",
      position_qty: 1,
      cost_position: 980,
      mark_price: 1000,
      average_open_price: 980,
      margin: 50,
      unsettled_pnl: 20,
      last_sum_unitary_funding: 0.5,
      leverage: 10,
    };
    expect(createChain([row]).initial.assets).toBeNull();
    useAppStore.setState({ symbolsInfo: perpSymbolsInfo, fundingRates });
    const { assets } = createChain([row]).initial;
    expect(assets.perpUnsettledPnL).toBe(20);
    expect(assets.availableBalance).toBe(120);
    expect(assets.totalValue.toNumber()).toBe(170);
  });
});
