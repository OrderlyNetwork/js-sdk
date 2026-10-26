import { useLayoutEffect } from "react";
import { act, create } from "react-test-renderer";
import { expect, it } from "vitest";
import type { BinaryInfoRow } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import {
  useAccountEstimates,
  type AccountEstimatesArgs,
} from "@orderly.network/prediction/src/prediction/hooks/tradingActions/useAccountEstimates";
import { usePredictionOrderForm } from "@orderly.network/prediction/src/prediction/hooks/usePredictionOrderForm";

const symbol = "PERP_BTC5M2610150000_USDC";
const config = {
  symbol,
  base_tick: 0.01,
  base_min: 0.01,
  base_max: 10000,
  quote_tick: 0.01,
  min_notional: 5,
} as BinaryInfoRow;
const resources = {
  accountReady: true,
  balanceReady: true,
  balance: 30000,
  availableQuantity: () => 0,
  getCollateralSnapshot: () => ({
    positionQty: 0,
    pendingBuyQty: 0,
    pendingSellQty: 0,
    orders: [],
    reservations: [],
    mode: "detailed",
  }),
} as unknown as AccountEstimatesArgs["resources"];

it.each(["up", "down"] as const)(
  "uses the same rounded %s shares for the principal, fee and 3%% funding buffer",
  (outcome) => {
    let form!: ReturnType<typeof usePredictionOrderForm>;
    let estimates!: ReturnType<typeof useAccountEstimates>;
    function Consumer() {
      const account = useAccountEstimates({
        resources,
        active: true,
        configBySymbol: new Map([[symbol, config]]),
        selectedSymbol: symbol,
        feeRates: { makerRate: 0, makerBps: 0, takerRate: 0.03, takerBps: 300 },
        hasFeeConfig: true,
      });
      const next = usePredictionOrderForm({
        marketId: "PERP_BTC5M_USDC",
        symbol,
        baseMax: 10000,
        executablePrices: {
          buy: { up: 0.99, down: 0.99 },
          sell: { up: 0.99, down: 0.99 },
        },
        marketPrice: () => 0.99,
        balance: 30000,
        ...account,
        positions: [],
        isRoundTradable: true,
        isRegionRestricted: false,
      });
      useLayoutEffect(() => {
        form = next;
        estimates = account;
      });
      return null;
    }
    let view!: ReturnType<typeof create>;
    act(() => {
      view = create(<Consumer />);
    });
    try {
      act(() => {
        form.setTradeMode("market");
        form.setSelectedOutcome(outcome);
      });
      act(() => form.setAmount("19800.01"));
      expect(form.requestedQuantity).toBe(20000.01);
      expect(form.orderQuantity).toBe(20000);
      expect(form.orderNotional).toBe(19800);
      expect(form.requiredFrozen).toBe(20394);
      expect(
        estimates.estimateFee(
          form.orderQuantity,
          outcome === "up" ? 0.99 : 0.01,
          true,
        ),
      ).toBe(5.94);
      expect(form.canPlaceOrder).toBe(true);
    } finally {
      act(() => view.unmount());
    }
  },
);
