// @vitest-environment jsdom
import React, { useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  act,
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  resolveBinaryCollateral,
  type BinaryCollateralSnapshot,
} from "@orderly.network/prediction/src/prediction/binary/binaryCollateral";
import { useAccountEstimates } from "@orderly.network/prediction/src/prediction/hooks/tradingActions/useAccountEstimates";
import type { OneTapOrderEvaluation } from "@orderly.network/prediction/src/prediction/hooks/tradingActions/useOneTapOrders";
import {
  usePredictionAccountResources,
  type PredictionAccountResources,
} from "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountResources";
import { usePredictionOrderForm } from "@orderly.network/prediction/src/prediction/hooks/usePredictionOrderForm";
import { useTradePanelScript } from "@orderly.network/prediction/src/prediction/orderEntry/tradePanel.script";
import { TradePanel } from "@orderly.network/prediction/src/prediction/orderEntry/tradePanel.ui";
import {
  AccountStatusEnum,
  MarginMode,
  type API,
} from "@orderly.network/types";

const accountMocks = vi.hoisted(() => ({
  accountId: "account-a" as string | undefined,
  collateral: {
    freeCollateral: 82.16,
    totalValue: 82.16 as number | null,
    accountInfo: { account_id: "account-a" },
  },
}));
const tipsMocks = vi.hoisted(() => ({
  isMobile: false,
  alert: vi.fn(),
  placeOneTapOrder: vi.fn(),
}));

vi.mock("@orderly.network/ui/src/hooks", () => ({
  useScreen: () => ({ isMobile: tipsMocks.isMobile }),
}));
vi.mock("@orderly.network/ui/src/modal", () => ({
  modal: { alert: tipsMocks.alert },
}));
vi.mock("@orderly.network/ui/src/tooltip", () => ({
  Tooltip: ({
    children,
    content,
  }: {
    children: React.ReactNode;
    content: React.ReactElement<{ children: string }>;
  }) => <div data-tips-content={content.props.children}>{children}</div>,
}));

vi.mock("@orderly.network/hooks", async () => {
  const { useState } = await import("react");
  return {
    useLocalStorage: (_key: string, initial: unknown) => useState(initial),
    useAccount: () => ({
      state: {
        accountId: accountMocks.accountId,
        status: AccountStatusEnum.EnableTrading,
        subAccounts: [],
      },
      isMainAccount: true,
    }),
    useCollateral: () => accountMocks.collateral,
    usePositions: () => [],
    usePrivateQuery: () => ({ data: { rows: [] } }),
    useMarkPricesStream: () => ({ data: {} }),
    useSubAccountQuery: () => ({}),
    useSubAccountMutation: () => [() => {}],
  };
});
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/useBinaryPendingOrders",
  () => ({
    useBinaryPendingOrders: () => ({ orders: [], complete: true, stream: {} }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionOrderHistory",
  () => ({ usePredictionOrderHistory: () => ({}) }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionSettlementHistory",
  () => ({ usePredictionSettlementHistory: () => ({}) }),
);
vi.mock("@orderly.network/i18n", () => ({
  i18n: {
    t: (key: string, options?: Record<string, string>) =>
      options &&
      (key === "prediction.message.oneTapUpMinimumOrder" ||
        key === "prediction.message.oneTapDownMinimumOrder")
        ? `${key}:${JSON.stringify(options)}`
        : key,
    language: "en",
  },
  useTranslation: () => ({ t: (key: string) => key }),
  useLocaleCode: () => "en",
}));
vi.mock("@orderly.network/ui", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@orderly.network/ui")>();
  const { Tips } = await import("@orderly.network/ui/src/tips/tips");
  const { forwardRef } = await import("react");
  const Children = ({ children }: { children?: React.ReactNode }) => children;
  return {
    ...actual,
    Button: forwardRef<HTMLButtonElement, React.ComponentProps<"button">>(
      ({ children, disabled, onClick }, ref) => (
        <button ref={ref} disabled={disabled} onClick={onClick}>
          {children}
        </button>
      ),
    ),
    Text: Object.assign(Children, { numeral: Children }),
    Flex: Children,
    Tooltip: ({
      children,
      content,
      open,
    }: React.ComponentProps<typeof actual.Tooltip>) => (
      <div data-tooltip-content={content} data-tooltip-open={open}>
        {children}
      </div>
    ),
    Tips,
    Input: Object.assign(
      ({ value }: { value: string }) => <input value={value} readOnly />,
      {
        tooltip: ({
          id,
          value,
          tooltip,
        }: {
          id: string;
          value: string;
          tooltip?: string;
        }) => <input id={id} value={value} data-error={tooltip} readOnly />,
      },
    ),
    useScreen: () => ({ isMobile: tipsMocks.isMobile }),
    AddCircleIcon: () => null,
  };
});
vi.mock("@orderly.network/prediction/src/prediction/orderEntry/form", () => ({
  PercentageControls: ({
    disabled,
    trailing,
  }: {
    disabled: boolean;
    trailing: React.ReactNode;
  }) => (
    <div>
      <input aria-label="percentage" disabled={disabled} />
      {trailing}
    </div>
  ),
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/orderEntry/form/binarySlippage.ui",
  () => ({ BinarySlippage: () => null }),
);

const symbol = "PERP_BTC5M2610140220_USDC";
const config = {
  symbol,
  base_tick: 0.01,
  base_min: 0.01,
  base_max: 10000,
  min_notional: 5,
} as API.BinaryInfoRow;
// Reconstructed screenshot state, with known prices but no order margin mode or Mark.
const qaSnapshot = resolveBinaryCollateral({
  symbol,
  positions: [
    {
      symbol,
      position_qty: -18.6,
      pending_long_qty: 0,
      pending_short_qty: 37.93,
      margin_mode: MarginMode.ISOLATED,
    } as API.Position,
  ],
  orders: [
    {
      symbol,
      order_id: 9686028278,
      side: "SELL",
      price: 0.71,
      quantity: 37.93,
      total_executed_quantity: 0,
      created_time: 1791943459021,
      updated_time: 1791943459021,
      status: "NEW",
    } as API.Order,
  ],
  ordersComplete: true,
});
const flatSnapshot: BinaryCollateralSnapshot = {
  positionQty: 0,
  pendingBuyQty: 0,
  pendingSellQty: 0,
  orders: [],
  reservations: [],
  mode: "detailed",
};
type Props = {
  snapshot?: BinaryCollateralSnapshot | null;
  configured?: boolean;
  accountReady?: boolean;
  active?: boolean;
  balance?: number;
  price?: number;
  symbol?: string;
  configChanges?: Partial<API.BinaryInfoRow>;
  resources?: PredictionAccountResources;
  oneTapEvaluation?: OneTapOrderEvaluation;
};
let root: ReactTestRenderer | undefined;
let estimates: ReturnType<typeof useAccountEstimates>;
let form: ReturnType<typeof usePredictionOrderForm>;
function Probe({
  snapshot = qaSnapshot,
  configured = true,
  accountReady = true,
  active = true,
  balance = 82.16,
  price = 0.65,
  symbol: selectedSymbol = symbol,
  configChanges,
  resources,
  oneTapEvaluation,
}: Props) {
  const feeRates = {
    makerBps: 0,
    takerBps: 6,
    makerRate: 0,
    takerRate: 0.0006,
  };
  const accountEstimates = useAccountEstimates({
    resources:
      resources ??
      ({
        accountReady,
        balanceReady: true,
        balance,
        getCollateralSnapshot: (requestedSymbol: string) =>
          requestedSymbol === symbol ? (snapshot ?? undefined) : undefined,
        availableQuantity: () => 0,
      } as unknown as PredictionAccountResources),
    active,
    configBySymbol: new Map(
      configured ? [[symbol, { ...config, ...configChanges }]] : [],
    ),
    selectedSymbol,
    feeRates,
    hasFeeConfig: true,
  });
  const formState = usePredictionOrderForm({
    marketId: "PERP_BTC5M_USDC",
    symbol: selectedSymbol,
    executablePrices: {
      buy: { up: 0.6, down: 0.4 },
      sell: { up: 0.6, down: 0.4 },
    },
    marketPrice: (outcome) => (outcome === "up" ? price : 0.45),
    balance,
    estimateAdditionalFrozen: accountEstimates.estimateAdditionalFrozen,
    maxOpeningQuantity: accountEstimates.maxOpeningQuantity,
    availableQuantity: accountEstimates.availableQuantity,
    positions: [],
    isRoundTradable: true,
    isRegionRestricted: false,
  });
  const panel = useTradePanelScript({
    ...formState,
    balance,
    selectedRow: config,
    executablePrices: {
      buy: { up: 0.6, down: 0.4 },
      sell: { up: 0.6, down: 0.4 },
    },
    isRoundTradable: true,
    isRegionRestricted: false,
    isSubmitting: false,
    orderEntryAccountReady: accountReady,
    orderEntryFunded: true,
    placeOrder: () => {},
    placeOneTapOrder: tipsMocks.placeOneTapOrder,
    slippage: "5",
    setSlippage: () => {},
    estimatedSlippage: null,
    feeRates,
    fundingEstimateMode: accountEstimates.fundingEstimateMode,
    availableQuantity: accountEstimates.availableQuantity,
    estimateFee: accountEstimates.estimateFee,
    evaluateOneTapOrder: () =>
      oneTapEvaluation ?? {
        displayPrice: undefined,
        canPlace: false,
        quantity: 0,
        requiredFrozen: undefined,
        blockReason: undefined,
        estimatedSlippage: null,
      },
  });
  useLayoutEffect(() => {
    estimates = accountEstimates;
    form = formState;
  });
  return <TradePanel {...panel} />;
}
let accountResources: PredictionAccountResources;
function AccountResourceProbe() {
  const resources = usePredictionAccountResources();
  useLayoutEffect(() => {
    accountResources = resources;
  });
  return (
    <Probe
      resources={resources}
      balance={resources.balance}
      accountReady={resources.accountReady}
    />
  );
}
function mountAccountResources() {
  act(() => {
    root = create(<AccountResourceProbe />);
  });
  act(() => {
    form.setTradeMode("market");
  });
}
function updateAccountResources() {
  act(() => {
    root!.update(<AccountResourceProbe />);
  });
}
function mount(props: Props = {}) {
  act(() => {
    root = create(<Probe {...props} />);
  });
  act(() => {
    form.setTradeMode("market");
  });
}
function update(props: Props) {
  act(() => {
    root!.update(<Probe {...props} />);
  });
}
function text(node: ReactTestInstance): string {
  return node.children
    .map((child) => (typeof child === "string" ? child : text(child)))
    .join("");
}
function maxButton() {
  return root!.root
    .findAllByType("button")
    .find((node) => text(node).includes("orderEntry.maxBuy"))!;
}
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});
beforeEach(() => {
  tipsMocks.isMobile = false;
  tipsMocks.alert.mockClear();
  tipsMocks.placeOneTapOrder.mockClear();
  accountMocks.accountId = "account-a";
  accountMocks.collateral = {
    freeCollateral: 82.16,
    totalValue: 82.16,
    accountInfo: { account_id: "account-a" },
  };
});

it.each([
  "prediction.message.belowMinimumNotional",
  "prediction.message.fundingUnavailable",
] as const)("passes %s to the blocked one-tap Tips trigger", (blockReason) => {
  mount({
    oneTapEvaluation: {
      displayPrice: 0.58,
      quantity: 8.62,
      requestedQuantity: 8.62,
      requiredFrozen: undefined,
      blockReason,
      estimatedSlippage: 0,
      canPlace: false,
    },
  });
  act(() => form.setTradeMode("oneTap"));
  const tooltips = root!.root
    .findAllByType("div")
    .filter((node) => node.props["data-tips-content"] === blockReason);
  expect(tooltips).toHaveLength(2);
  for (const tooltip of tooltips) {
    expect(tooltip.findAllByType("button")).toHaveLength(0);
    const trigger = tooltip.findAllByType("span")[0];
    expect(trigger.props.tabIndex).toBe(0);
    expect(trigger.props.className).toContain("oui-opacity-40");
  }
});

it("passes direction-specific minimum quantities and amounts to the one-tap tooltips", () => {
  mount({
    oneTapEvaluation: {
      displayPrice: 0.58,
      quantity: 8.62,
      requestedQuantity: 8.62,
      requiredFrozen: undefined,
      estimatedSlippage: 0,
      blockReason: "prediction.message.belowMinimumNotional",
      minimumOrder: {
        minQuantity: 8.63,
        minTotal: 5.01,
        value: 5,
        upPrice: 0.42,
      },
      canPlace: false,
    },
  });
  act(() => form.setTradeMode("oneTap"));
  const contents = root!.root
    .findAllByType("div")
    .map((node) => node.props["data-tips-content"])
    .filter(
      (content) =>
        typeof content === "string" &&
        content.startsWith("prediction.message.oneTap"),
    );
  expect(contents).toEqual([
    'prediction.message.oneTapUpMinimumOrder:{"minQuantity":"8.63","minTotal":"5.01","value":"5"}',
    'prediction.message.oneTapDownMinimumOrder:{"minQuantity":"8.63","minTotal":"5.01","value":"5","upPrice":"0.42"}',
  ]);
});

it.each([
  "prediction.message.belowMinimumNotional",
  "prediction.message.fundingUnavailable",
] as const)(
  "shows %s on mobile tap without placing an order",
  async (blockReason) => {
    tipsMocks.isMobile = true;
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const container = document.createElement("div");
    document.body.appendChild(container);
    const domRoot = createRoot(container);
    const evaluation: OneTapOrderEvaluation = {
      displayPrice: 0.58,
      quantity: 8.62,
      requestedQuantity: 8.62,
      requiredFrozen: undefined,
      blockReason,
      estimatedSlippage: 0,
      canPlace: false,
    };
    const presetButtons = () =>
      Array.from(container.querySelectorAll("button")).filter((button) =>
        button.textContent?.startsWith("$10"),
      );
    try {
      await act(async () => {
        domRoot.render(<Probe oneTapEvaluation={evaluation} />);
      });
      await act(async () => form.setTradeMode("oneTap"));
      expect(container.querySelector("button button")).toBeNull();
      expect(presetButtons()).toHaveLength(2);
      for (const button of presetButtons()) {
        expect(button.disabled).toBe(false);
        await act(async () => {
          for (const type of ["pointerdown", "pointerup", "click"]) {
            const event = new MouseEvent(type, { bubbles: true });
            Object.defineProperty(event, "pointerType", { value: "touch" });
            button.dispatchEvent(event);
          }
        });
        expect(tipsMocks.alert).toHaveBeenLastCalledWith({
          title: "common.tips",
          message: blockReason,
        });
      }
      expect(tipsMocks.alert).toHaveBeenCalledTimes(2);
      expect(tipsMocks.placeOneTapOrder).not.toHaveBeenCalled();

      await act(async () => {
        domRoot.render(
          <Probe
            oneTapEvaluation={{
              ...evaluation,
              blockReason: undefined,
              requiredFrozen: 5,
              canPlace: true,
            }}
          />,
        );
      });
      await act(async () => presetButtons()[0].click());
      expect(tipsMocks.placeOneTapOrder).toHaveBeenCalledWith("up", 10);
      expect(tipsMocks.alert).toHaveBeenCalledTimes(2);
    } finally {
      await act(async () => domRoot.unmount());
      container.remove();
      vi.unstubAllGlobals();
    }
  },
);

it("OR-7534 displays positive UP Max buy and a usable percentage with known SELL prices", () => {
  mount();
  expect(estimates.fundingEstimateMode).toBe("approximate");
  expect(text(root!.root)).toContain("82.16 USDC");
  expect(form.maxOutcomeAmount).toBeGreaterThan(0);
  expect(form.maxQuoteAmount).toBeGreaterThan(0);
  expect(form.hasMaxAmountEstimate).toBe(true);
  expect(text(maxButton())).not.toContain("--");
  expect(text(maxButton())).not.toContain("0.00 USDC");
  expect(maxButton().props.disabled).toBe(false);
  act(() => {
    maxButton().props.onClick();
  });
  expect(Number(form.amount)).toBeGreaterThan(0);
  expect(form.requiredFrozen).toBeLessThanOrEqual(82.16);
});

it.each([
  { snapshot: null },
  { configured: false },
  { active: false },
  { balance: NaN },
  { balance: -1 },
  { price: NaN },
  { price: 1 },
  { configChanges: { base_tick: 0 } },
  { configChanges: { base_max: 0 } },
])("shows unavailable Max buy and disables percentages for %j", (props) => {
  mount(props);
  expect(form.hasMaxAmountEstimate).toBe(false);
  expect(text(maxButton())).toContain("-- USDC");
  expect(maxButton().props.disabled).toBe(true);
  expect(
    root!.root.findByProps({ "aria-label": "percentage" }).props.disabled,
  ).toBe(true);
});

it.each(["market", "limit"] as const)(
  "%s form reports a missing collateral snapshot and recovers when it arrives",
  (mode) => {
    const props = { snapshot: null, balance: 143455.19 };
    mount(props);
    act(() => form.setTradeMode(mode));
    act(() => form.setAmount(mode === "market" ? "10" : "20"));
    expect(form.requiredFrozen).toBeUndefined();
    expect(form.orderValidationError).toEqual({
      field: "amount",
      key: "prediction.message.fundingUnavailable",
    });
    expect(form.canPlaceOrder).toBe(false);
    const submit = root!.root
      .findAllByType("button")
      .find((node) => text(node) === "common.buy prediction.up")!;
    act(() => submit.props.onClick());
    const amountInput = root!.root
      .findAllByType("input")
      .find((node) => node.props.id === "prediction-order-amount")!;
    expect(amountInput.props["data-error"]).toBe(
      "prediction.message.fundingUnavailable",
    );
    update({ ...props, snapshot: flatSnapshot });
    expect(form.requiredFrozen).toBeGreaterThan(0);
    expect(form.orderValidationError).toBeUndefined();
    expect(form.canPlaceOrder).toBe(true);
  },
);

it("marks capacity unavailable for an account that is not ready", () => {
  mount({ accountReady: false });
  expect(estimates.maxOpeningQuantity("up", 0.65)).toBeUndefined();
  expect(form.hasMaxAmountEstimate).toBe(false);
});

it("displays a valid zero as 0.00 USDC", () => {
  mount({ snapshot: flatSnapshot, balance: 0 });
  expect(form.hasMaxAmountEstimate).toBe(true);
  expect(form.maxAmount).toBe(0);
  expect(text(maxButton())).toContain("0.00 USDC");
  expect(maxButton().props.disabled).toBe(true);
});

it.each([{ snapshot: null }, { configured: false }])(
  "preserves a percentage draft while %j is unavailable and recalculates on recovery",
  (missing) => {
    mount();
    act(() => {
      form.setOrderPercentage(50);
    });
    const amount = form.amount;
    update(missing);
    expect(form.amount).toBe(amount);
    expect(text(maxButton())).toContain("-- USDC");
    act(() => {
      form.setOrderPercentage(100);
    });
    expect(form.amount).toBe(amount);
    update({ balance: 40 });
    expect(form.hasMaxAmountEstimate).toBe(true);
    expect(form.amount).not.toBe(amount);
    expect(form.orderPercentage).toBeCloseTo(50, 1);
    expect(maxButton().props.disabled).toBe(false);
  },
);

it("retains manually typed amounts while a snapshot loads", () => {
  mount({ snapshot: null });
  act(() => {
    form.setAmount("15.00");
  });
  update({});
  expect(form.amount).toBe("15.00");
});

it("recomputes capacity in DOWN coordinates and clears drafts on round changes", () => {
  mount();
  const upMax = form.maxOutcomeAmount;
  act(() => {
    form.setSelectedOutcome("down");
  });
  expect(form.hasMaxAmountEstimate).toBe(true);
  expect(form.maxOutcomeAmount).toBe(
    estimates.maxOpeningQuantity("down", 0.45),
  );
  expect(form.maxOutcomeAmount).not.toBe(upMax);
  act(() => {
    form.setOrderPercentage(100);
  });
  update({ symbol: "PERP_BTC5M2610140225_USDC" });
  expect(form.amount).toBe("");
  expect(form.hasMaxAmountEstimate).toBe(false);
  expect(text(maxButton())).toContain("-- USDC");
  update({});
  expect(form.hasMaxAmountEstimate).toBe(true);
  expect(form.amount).toBe("");
});

it("keeps initial portfolio zero unavailable and recovers when the balance is calculated", () => {
  accountMocks.collateral.freeCollateral = 0;
  accountMocks.collateral.totalValue = null;
  mountAccountResources();
  expect(accountResources.accountReady).toBe(true);
  expect(accountResources.balance).toBe(0);
  expect(accountResources.balanceReady).toBe(false);
  expect(accountResources.getCollateralSnapshot(symbol)).toBeDefined();
  expect(text(maxButton())).toContain("-- USDC");
  expect(maxButton().props.disabled).toBe(true);
  accountMocks.collateral.freeCollateral = 82.16;
  accountMocks.collateral.totalValue = 82.16;
  updateAccountResources();
  expect(accountResources.balanceReady).toBe(true);
  expect(form.maxAmount).toBeGreaterThan(0);
  expect(maxButton().props.disabled).toBe(false);
});

it.each([NaN, Infinity, -Infinity])(
  "does not estimate from non-finite collateral %s normalized to zero",
  (value) => {
    accountMocks.collateral.freeCollateral = value;
    mountAccountResources();
    expect(accountResources.balance).toBe(0);
    expect(accountResources.balanceReady).toBe(false);
    expect(text(maxButton())).toContain("-- USDC");
    accountMocks.collateral.freeCollateral = 82.16;
    updateAccountResources();
    expect(accountResources.balanceReady).toBe(true);
    expect(form.maxAmount).toBeGreaterThan(0);
  },
);

it("displays zero only after the portfolio calculation confirms it", () => {
  accountMocks.collateral.freeCollateral = 0;
  accountMocks.collateral.totalValue = 0;
  mountAccountResources();
  expect(accountResources.balanceReady).toBe(true);
  expect(form.hasMaxAmountEstimate).toBe(true);
  expect(text(maxButton())).toContain("0.00 USDC");
});

it("invalidates capacity when switching accounts until that account's portfolio is ready", () => {
  mountAccountResources();
  expect(form.maxAmount).toBeGreaterThan(0);
  accountMocks.accountId = "account-b";
  updateAccountResources();
  expect(accountResources.accountReady).toBe(true);
  expect(accountResources.balanceReady).toBe(false);
  expect(text(maxButton())).toContain("-- USDC");
  accountMocks.collateral.accountInfo = { account_id: "account-b" };
  accountMocks.collateral.totalValue = null;
  updateAccountResources();
  expect(accountResources.balanceReady).toBe(false);
  accountMocks.collateral.freeCollateral = 0;
  accountMocks.collateral.totalValue = 0;
  updateAccountResources();
  expect(accountResources.balanceReady).toBe(true);
  expect(text(maxButton())).toContain("0.00 USDC");
  accountMocks.accountId = undefined;
  updateAccountResources();
  expect(accountResources.balanceReady).toBe(false);
});

it("preserves a percentage draft while the portfolio is unavailable and updates on recovery", () => {
  mountAccountResources();
  act(() => {
    form.setOrderPercentage(50);
  });
  const amount = form.amount;
  accountMocks.collateral.totalValue = null;
  updateAccountResources();
  expect(form.amount).toBe(amount);
  expect(text(maxButton())).toContain("-- USDC");
  accountMocks.collateral.freeCollateral = 40;
  accountMocks.collateral.totalValue = 40;
  updateAccountResources();
  expect(form.amount).not.toBe(amount);
  expect(form.orderPercentage).toBe(50);
});
