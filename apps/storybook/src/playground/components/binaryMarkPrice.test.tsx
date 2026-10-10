import React from "react";
import { act, create } from "react-test-renderer";
import { describe, expect, it, vi } from "vitest";
import { useBinaryMarkPrice } from "@orderly.network/prediction/src/prediction/binary/useBinaryMarkPrice";
import { DesktopMarkPrice } from "@orderly.network/trading-common/src/components/desktop/orderBook/markPrice.desktop";
import { MarkPrice as MobileMarkPrice } from "@orderly.network/trading-common/src/components/mobile/orderBook/markPrice";

const mocks = vi.hoisted(() => ({
  callbacks: new Map<string, (message: any) => void>(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
}));
const ws = { subscribe: mocks.subscribe };
vi.mock("@orderly.network/hooks", () => ({ useWS: () => ws }));

vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({
  cn: (...values: unknown[]) => values.filter(Boolean).join(" "),
  Flex: ({ children }: any) => <div>{children}</div>,
  Text: ({ children }: any) => <span>{children}</span>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
}));
vi.mock(
  "@orderly.network/trading-common/src/components/base/orderBook/orderContext",
  () => ({
    useOrderBookContext: () => ({
      showTotal: false,
      symbolInfo: { quote_dp: 2 },
    }),
  }),
);
vi.mock(
  "@orderly.network/trading-common/src/components/base/orderBook/midPriceView",
  () => ({
    MiddlePriceView: () => <span>default-price</span>,
  }),
);
vi.mock(
  "@orderly.network/trading-common/src/components/base/orderBook/markPrice",
  () => ({
    MarkPriceView: () => <span>flagged-mark</span>,
  }),
);

const Price = ({ symbol, active }: { symbol?: string; active: boolean }) => {
  const price = useBinaryMarkPrice(symbol, active);
  return <span>{price ?? "--"}</span>;
};

describe("prediction mark-price lifecycle", () => {
  it("clears on round changes, rejects late messages and stops while inactive", () => {
    mocks.subscribe.mockImplementation((topic, handlers) => {
      mocks.callbacks.set(topic, handlers.onMessage);
      return mocks.unsubscribe;
    });
    let view: ReturnType<typeof create>;
    act(() => {
      view = create(<Price symbol="A" active />);
    });
    expect(view!.root.findByType("span").children).toEqual(["--"]);
    act(() => {
      mocks.callbacks.get("A@markprice")!({ data: { symbol: "A", price: 0 } });
    });
    expect(view!.root.findByType("span").children).toEqual(["0"]);
    act(() => {
      view!.update(<Price symbol="B" active />);
    });
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(1);
    expect(view!.root.findByType("span").children).toEqual(["--"]);
    act(() => {
      mocks.callbacks.get("A@markprice")!({
        data: { symbol: "A", price: 0.6 },
      });
    });
    expect(view!.root.findByType("span").children).toEqual(["--"]);
    act(() => {
      mocks.callbacks.get("B@markprice")!({
        data: { symbol: "B", price: 0.7 },
      });
    });
    expect(view!.root.findByType("span").children).toEqual(["0.7"]);
    act(() => {
      view!.update(<Price symbol="B" active={false} />);
    });
    expect(view!.root.findByType("span").children).toEqual(["--"]);
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(2);
    act(() => {
      mocks.callbacks.get("B@markprice")!({
        data: { symbol: "B", price: 0.8 },
      });
    });
    expect(view!.root.findByType("span").children).toEqual(["--"]);
    act(() => {
      view!.update(<Price symbol="B" active />);
    });
    expect(view!.root.findByType("span").children).toEqual(["--"]);
    act(() => {
      view!.unmount();
    });
    expect(mocks.unsubscribe).toHaveBeenCalledTimes(3);
  });
});

describe("orderbook middle-price slots", () => {
  it.each([DesktopMarkPrice, MobileMarkPrice])(
    "renders the custom price and preserves the default without a slot",
    (Component) => {
      const props = {
        markPrice: 0.6,
        lastPrice: [0.5, 0.6],
        asks: [],
        bids: [],
        symbolInfo: { quote_dp: 2 } as any,
        showMarkPrice: false,
      };
      let view: ReturnType<typeof create>;
      act(() => {
        view = create(
          <Component
            {...props}
            middlePriceContent={<span>binary-mark</span>}
          />,
        );
      });
      expect(JSON.stringify(view!.toJSON())).toContain("binary-mark");
      expect(JSON.stringify(view!.toJSON())).not.toContain("default-price");
      if (Component === DesktopMarkPrice)
        expect(JSON.stringify(view!.toJSON())).toContain("0%");
      act(() => {
        view!.update(<Component {...props} />);
      });
      expect(JSON.stringify(view!.toJSON())).toContain("default-price");
      act(() => {
        view!.unmount();
      });
    },
  );
});
