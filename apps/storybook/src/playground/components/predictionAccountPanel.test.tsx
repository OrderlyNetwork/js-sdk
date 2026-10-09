import React, { useState } from "react";
import { act, create } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import { PredictionAccountPanel } from "@orderly.network/prediction/src/prediction/dataPanels/predictionAccountPanel.widget";
import { usePredictionPanelMarketView } from "@orderly.network/prediction/src/prediction/hooks/usePredictionPanelMarketView";

const mocks = vi.hoisted(() => ({ account: vi.fn(), panel: vi.fn() }));
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountData",
  () => ({
    usePredictionAccountData: () => {
      mocks.account();
      return {};
    },
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/dataPanels/predictionDataPanel.ui",
  () => ({
    PredictionDataPanel: (props: unknown) => {
      mocks.panel(props);
      return null;
    },
  }),
);
it("form edits and book changes do not render an unrelated account tab", () => {
  let edit!: (value: string) => void,
    price!: (value: number) => void,
    tab!: (value: any) => void;
  function Page() {
    const [amount, setAmount] = useState(""),
      [up, setPrice] = useState(0.5),
      [activeTab, setActiveTab] = useState<any>("openOrders");
    edit = setAmount;
    price = setPrice;
    tab = setActiveTab;
    const marketView = usePredictionPanelMarketView({
      activeTab,
      outcomePrices: { up, down: 0.5 },
      round: 1,
      roundPhase: "trading",
      isRoundTradable: true,
    });
    return (
      <>
        <span>{amount}</span>
        <PredictionAccountPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          marketView={marketView}
          isSubmitting={false}
          isRegionRestricted={false}
        />
      </>
    );
  }
  let root!: ReturnType<typeof create>;
  act(() => {
    root = create(<Page />);
  });
  expect(mocks.account).toHaveBeenCalledTimes(1);
  act(() => {
    edit("100");
    price(0.6);
  });
  expect(mocks.account).toHaveBeenCalledTimes(1);
  act(() => tab("predictions"));
  expect(mocks.account).toHaveBeenCalledTimes(2);
  act(() => edit("200"));
  expect(mocks.account).toHaveBeenCalledTimes(2);
  act(() => price(0.7));
  expect(mocks.account).toHaveBeenCalledTimes(3);
  expect(
    mocks.panel.mock.calls.at(-1)?.[0].state.marketView.outcomePrices.up,
  ).toBe(0.7);
  act(() => root.unmount());
});
