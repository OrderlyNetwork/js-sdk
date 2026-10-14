import React, { type ReactElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { HoldingsTableUI } from "@orderly.network/prediction/src/prediction/dataPanels/holdings/holdingsTable.ui";
import { MobilePredictionPositions } from "@orderly.network/prediction/src/prediction/dataPanels/predictionMobileCards.ui";
import * as tableModule from "@orderly.network/prediction/src/prediction/dataPanels/table";

// OR-7521: each holdings row counts down against its own expiry, including
// when the trading page supplies a selected round.

const stableI18n = vi.hoisted(() => ({ t: (key: string) => key }));
const clock = vi.hoisted(() => ({ now: 0 }));
const fixtures = vi.hoisted(() => ({ realRows: false }));
const holdingsRows = vi.hoisted(
  () =>
    [
      {
        id: "selected-round",
        position: {
          symbol: "PERP_BTC5M2601011200_USDC",
          round: 1767278400,
          outcome: "up",
          quantity: 10,
          averagePrice: 0.4,
        },
        isSelectedRound: true,
        lastPrice: 0.5,
        uPnL: 1.2,
        availableQuantity: 10,
        roundInfo: { expire_at: 120_000, status: "ACTIVE" },
      },
      {
        id: "other-round",
        position: {
          symbol: "PERP_BTC5M2601011205_USDC",
          round: 1767278405,
          outcome: "down",
          quantity: 5,
          averagePrice: 0.6,
        },
        isSelectedRound: false,
        lastPrice: 0.5,
        uPnL: -0.2,
        availableQuantity: 5,
        roundInfo: { expire_at: 180_000, status: "ACTIVE" },
      },
      {
        id: "round-outside-snapshot",
        position: {
          round: 1767278410,
          outcome: "up",
          quantity: 1,
          averagePrice: 0.3,
        },
        isSelectedRound: false,
        lastPrice: 0.5,
        uPnL: 0,
        availableQuantity: 1,
        roundInfo: undefined,
      },
    ] as any[],
);

vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: stableI18n.t }),
  i18n: { t: stableI18n.t },
}));
vi.mock("@orderly.network/ui", async () => {
  const { createElement } = await import("react");
  return {
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(" "),
    Divider: () => null,
    EmptyDataState: () => null,
    Text: (props: any) => createElement("span", null, props?.children),
  };
});
vi.mock("@orderly.network/ui-connector", () => ({
  useAuthGuard: () => true,
  AuthGuardEmpty: () => null,
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/cells",
  async (importOriginal) => ({
    ...(await importOriginal<object>()),
    RoundSymbol: () => null,
    OutcomeBadge: () => null,
    TableNumber: () => null,
    PredictionPnl: () => null,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/history/predictionHistoryTable.script",
  () => ({
    usePredictionHistoryTableScript: () => ({}),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/orders/predictionOrderCell.ui",
  () => ({
    PredictionOrderCell: () => null,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/useRoundCountdown",
  () => ({ useRoundNow: () => clock.now }),
);
vi.mock("@orderly.network/prediction/src/prediction/predictionShared", () => ({
  formatCountdown: (seconds: number) => `cd-${seconds}`,
  formatPredictionPnl: (value: number) => `pnl-${value}`,
  usePredictionFormatters: () => ({}),
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/orderEntry/sellPosition",
  () => ({ SellPosition: () => null }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/filters/predictionFilters.ui",
  () => ({ PredictionFilters: () => null }),
);
vi.mock("@orderly.network/prediction/src/prediction/dataPanels/table", () => ({
  PredictionDataTable: () => null,
  tableColumn: (title: unknown, width: unknown, opts: object = {}) => ({
    title,
    width,
    ...opts,
  }),
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/holdings/holdingsTable.script",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("@orderly.network/prediction/src/prediction/dataPanels/holdings/holdingsTable.script")
      >();
    return {
      useHoldingsTableScript: () => ({ filters: {} }),
      useHoldingsPositionRows: (state: any) =>
        fixtures.realRows
          ? actual.buildHoldingsPositionRows(state, () => true)
          : holdingsRows.map((row) => ({
              ...row,
              isSelectedRound:
                !!row.position.symbol &&
                row.position.symbol === state.marketView?.selectedRow?.symbol,
            })),
    };
  },
);

let root: ReactTestRenderer | undefined;
let cellRoot: ReactTestRenderer | undefined;
const mountTable = (state: unknown) => {
  act(() => {
    root = create(<HoldingsTableUI state={state as any} filters={{} as any} />);
  });
  const dataTable = root!.root.findAllByType(
    tableModule.PredictionDataTable,
  )[0];
  return dataTable.props.rows as Array<{
    id: string;
    cells: Array<ReactElement>;
  }>;
};
/** Countdown cells are leaf elements; render one to assert what the user sees. */
const renderCell = (cell: ReactElement) => {
  act(() => {
    cellRoot = create(cell);
  });
  return JSON.stringify(cellRoot!.toJSON());
};

afterEach(() => {
  act(() => root?.unmount());
  act(() => cellRoot?.unmount());
  clock.now = 0;
  fixtures.realRows = false;
  holdingsRows[0].roundInfo = { expire_at: 120_000, status: "ACTIVE" };
  root = undefined;
  cellRoot = undefined;
});

it("portfolio rows count down against their own rounds", () => {
  const rows = mountTable({});
  expect(rows[0].cells[7].props.roundInfo.expire_at).toBe(120_000);
  expect(rows[1].cells[7].props.roundInfo.expire_at).toBe(180_000);
  expect(renderCell(rows[0].cells[7])).toContain("cd-120");
});

it("rows without round metadata keep the placeholder", () => {
  const rows = mountTable({});
  expect(renderCell(rows[2].cells[7])).toContain("--");
});

it("expired rounds show their closed phase instead of a zero countdown", () => {
  clock.now = 180_000;
  const rows = mountTable({});
  expect(renderCell(rows[1].cells[7])).toContain("prediction.phase.closed");
  clock.now = 0;
});

it.each([0, 1])("all rows keep countdowns when row %i is selected", (index) => {
  const rows = mountTable({
    marketView: {
      selectedRow: {
        symbol: holdingsRows[index].position.symbol,
        expire_at: holdingsRows[index].roundInfo.expire_at,
      },
      outcomePrices: { up: 0.6, down: 0.4 },
      round: 1767278400,
      roundPhase: "trading",
      isRoundTradable: true,
    },
  });
  // Selection does not hide other rounds' countdowns.
  expect(rows[0].cells[7].props.roundInfo.expire_at).toBe(120_000);
  expect(renderCell(rows[0].cells[7])).toContain("cd-120");
  expect(rows[1].cells[7].props.roundInfo.expire_at).toBe(180_000);
  expect(renderCell(rows[1].cells[7])).toContain("cd-180");
  expect(renderCell(rows[2].cells[7])).toContain("--");
});

it.each([0, 1])(
  "mobile cards keep both countdowns when row %i is selected",
  (index) => {
    act(() => {
      root = create(
        <MobilePredictionPositions
          state={
            {
              marketView: {
                selectedRow: { symbol: holdingsRows[index].position.symbol },
                isRoundTradable: true,
              },
            } as any
          }
        />,
      );
    });
    const content = JSON.stringify(root!.toJSON());
    expect(content).toContain("cd-120");
    expect(content).toContain("cd-180");
    expect(content).toContain("--");
  },
);

it.each(["UP", "DOWN"])(
  "desktop preserves resolved %s across selection changes",
  (outcome) => {
    holdingsRows[0].roundInfo = {
      expire_at: 120_000,
      status: "DELISTING",
      result_committed_at: 121_000,
      outcome,
    };
    clock.now = 122_000;
    let rows = mountTable({
      marketView: { selectedRow: { symbol: holdingsRows[0].position.symbol } },
    });
    const expected =
      outcome === "UP"
        ? "prediction.phase.resolvedUp"
        : "prediction.phase.resolvedDown";
    expect(renderCell(rows[0].cells[7])).toContain(expected);
    act(() => {
      root!.update(
        <HoldingsTableUI
          state={
            {
              marketView: {
                selectedRow: { symbol: holdingsRows[1].position.symbol },
              },
            } as any
          }
          filters={{} as any}
        />,
      );
    });
    rows = root!.root.findAllByType(tableModule.PredictionDataTable)[0].props
      .rows;
    expect(renderCell(rows[0].cells[7])).toContain(expected);
  },
);

it.each(["UP", "DOWN"])(
  "portfolio and mobile show resolved %s from row metadata",
  (outcome) => {
    holdingsRows[0].roundInfo = {
      expire_at: 120_000,
      status: "DELISTING",
      result_committed_at: 121_000,
      outcome,
    };
    clock.now = 122_000;
    const expected =
      outcome === "UP"
        ? "prediction.phase.resolvedUp"
        : "prediction.phase.resolvedDown";
    const rows = mountTable({});
    expect(renderCell(rows[0].cells[7])).toContain(expected);
    act(() => root!.unmount());
    act(() => {
      root = create(
        <MobilePredictionPositions
          state={
            {
              marketView: {
                selectedRow: { symbol: holdingsRows[1].position.symbol },
              },
            } as any
          }
        />,
      );
    });
    expect(JSON.stringify(root!.toJSON())).toContain(expected);
  },
);

it("result metadata arriving after expiry updates Closed to Resolved", () => {
  clock.now = 122_000;
  const rows = mountTable({});
  expect(renderCell(rows[0].cells[7])).toContain("prediction.phase.closed");
  act(() => {
    cellRoot!.update(
      React.cloneElement(rows[0].cells[7], {
        roundInfo: {
          ...holdingsRows[0].roundInfo,
          result_committed_at: 121_000,
          outcome: "DOWN",
        },
      }),
    );
  });
  expect(JSON.stringify(cellRoot!.toJSON())).toContain(
    "prediction.phase.resolvedDown",
  );
});

it("price and PnL follow the round lifecycle without changing column names", () => {
  fixtures.realRows = true;
  const round = {
    symbol: "A",
    expire_at: 2_000,
    status: "ACTIVE",
    s0: 100,
    s1: null,
    result_committed_at: null,
    outcome: null,
    settlement_price_per_share: null,
  };
  const state = {
    roundNow: 1_000,
    positions: [
      {
        symbol: "A",
        outcome: "up",
        quantity: 10,
        averagePrice: 0.4,
        markPrice: 0.6,
      },
    ],
    availableQuantity: () => 10,
    roundBySymbol: () => round,
    marketView: {
      selectedRow: round,
      outcomePrices: { up: 0.7, down: 0.3 },
      roundPhase: "trading",
      isRoundTradable: true,
    },
  };
  let rows = mountTable(state);
  expect(rows[0].cells[5].props.value).toBe(0.6);
  expect(rows[0].cells[6].props.value).toBe(2);
  const update = (nextState: any) => {
    act(() =>
      root!.update(<HoldingsTableUI state={nextState} filters={{} as any} />),
    );
    return root!.root.findAllByType(tableModule.PredictionDataTable)[0].props
      .rows;
  };
  rows = update({ ...state, roundNow: 2_000 });
  expect(renderCell(rows[0].cells[5])).toContain("--");
  expect(renderCell(rows[0].cells[6])).toContain("--");
  const resolved = {
    ...round,
    s1: 101,
    outcome: "UP",
    settlement_price_per_share: 1,
    result_committed_at: 2_100,
  };
  rows = update({ ...state, roundNow: 2_200, roundBySymbol: () => resolved });
  expect(rows[0].cells[5].props.value).toBe(1);
  expect(rows[0].cells[6].props.value).toBe(6);
  rows = update({
    ...state,
    roundNow: 2_200,
    roundBySymbol: () => resolved,
    marketView: undefined,
  });
  expect(rows[0].cells[5].props.value).toBe(1);
  expect(rows[0].cells[6].props.value).toBe(6);
  const columns = root!.root.findAllByType(tableModule.PredictionDataTable)[0]
    .props.columns;
  expect(columns[5].title).toBe("prediction.lastPrice");
  expect(columns[6].title).toBe("common.unrealizedPnl");
});
