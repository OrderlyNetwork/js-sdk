import React from "react";
import { act, create } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { PredictionOrderBook } from "@orderly.network/prediction/src/prediction/orderEntry/predictionOrderBook.ui";

const mocks = vi.hoisted(() => ({
  isMobile: false,
  desktopLadder: vi.fn(),
  mobileLadder: vi.fn(),
}));

vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/trading-shared", () => ({
  OrderBookLadder: (props: any) => {
    mocks.desktopLadder(props);
    return null;
  },
  MobileOrderBookLadder: (props: any) => {
    mocks.mobileLadder(props);
    return null;
  },
}));
vi.mock("@orderly.network/ui", async () => {
  const { createElement, Fragment } = await import("react");
  const wrapper = ({ children }: { children?: React.ReactNode }) =>
    createElement(Fragment, null, children);
  return {
    Text: { numeral: wrapper },
    Tooltip: wrapper,
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(" "),
    useObserverElement: () => {},
    useScreen: () => ({ isMobile: mocks.isMobile }),
  };
});

const renderBook = (
  props: Partial<React.ComponentProps<typeof PredictionOrderBook>> = {},
) =>
  act(() => {
    create(
      <PredictionOrderBook
        orderBook={{
          asks: [{ price: 0.62, quantity: 10 }],
          bids: [{ price: 0.37, quantity: 5 }],
        }}
        pendingOrderPrices={[0.37, 0.62]}
        selectedOutcome="up"
        markPrice={0.5}
        setLimitPrice={vi.fn()}
        setOrderType={vi.fn()}
        isRoundTradable
        roundPhase={"open" as any}
        selectedRow={{ quote_tick: 0.01, base_tick: 1 } as any}
        market={{ quote: "USDC" } as any}
        {...props}
      />,
    );
  });

describe("PredictionOrderBook pending order dots", () => {
  it("matches pending prices at the quote tick precision, not the base tick", () => {
    mocks.isMobile = false;
    mocks.desktopLadder.mockClear();
    renderBook();

    const props = mocks.desktopLadder.mock.calls.at(-1)![0];
    expect(props.depth).toBe("0.01");
    expect(props.pendingOrders).toEqual([0.37, 0.62]);
  });

  it("drops pending dots once the round is over", () => {
    mocks.isMobile = false;
    mocks.desktopLadder.mockClear();
    renderBook({ roundPhase: "closed" as any });

    expect(mocks.desktopLadder.mock.calls.at(-1)![0].pendingOrders).toBe(
      undefined,
    );
  });

  it("keeps the mobile ladder without pending dots, like perps", () => {
    mocks.isMobile = true;
    mocks.mobileLadder.mockClear();
    renderBook();

    const props = mocks.mobileLadder.mock.calls.at(-1)![0];
    expect(props.depth).toBe("0.01");
    expect(props.pendingOrders).toBeUndefined();
  });
});
