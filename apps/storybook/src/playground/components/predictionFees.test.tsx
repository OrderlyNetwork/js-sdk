import { useLayoutEffect } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { formatBinaryFeeBps } from "@orderly.network/prediction/src/prediction/binary/binaryFee";
import { toBinaryUpRequest } from "@orderly.network/prediction/src/prediction/binary/binaryOrderRules";
import {
  useBinaryFeeRates,
  type BinaryFeeRates,
} from "@orderly.network/prediction/src/prediction/binary/useBinaryFeeRates";
import {
  useAccountEstimates,
  type AccountEstimatesArgs,
} from "@orderly.network/prediction/src/prediction/hooks/tradingActions/useAccountEstimates";
import { Decimal } from "@orderly.network/utils";

const mocks = vi.hoisted(() => ({
  info: undefined as
    | { binary_maker_fee_rate: unknown; binary_taker_fee_rate: unknown }
    | undefined,
}));
vi.mock("@orderly.network/hooks", () => ({
  useAccountInfo: () => ({ data: mocks.info }),
}));

let root: ReactTestRenderer | undefined;
let rates: BinaryFeeRates;
let estimates: ReturnType<typeof useAccountEstimates>;
const resources = {
  accountReady: true,
  balanceReady: true,
  balance: 100,
  getCollateralSnapshot: () => undefined,
  availableQuantity: () => 0,
} as unknown as AccountEstimatesArgs["resources"];

function Consumer({ override }: { override?: BinaryFeeRates }) {
  const nextRates = useBinaryFeeRates(override);
  const nextEstimates = useAccountEstimates({
    resources,
    active: true,
    configBySymbol: new Map(),
    selectedSymbol: undefined,
    feeRates: nextRates,
    hasFeeConfig: nextRates.makerRate != null && nextRates.takerRate != null,
  });
  useLayoutEffect(() => {
    rates = nextRates;
    estimates = nextEstimates;
  });
  return null;
}
function mount(override?: BinaryFeeRates) {
  act(() => {
    root = create(<Consumer override={override} />);
  });
}

beforeEach(() => {
  mocks.info = { binary_maker_fee_rate: 0, binary_taker_fee_rate: 300 };
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

it.each([
  [6, 0.0006, 0.015],
  [100, 0.01, 0.25],
  [150, 0.015, 0.375],
  [300, 0.03, 0.75],
  [450, 0.045, 1.125],
])(
  "converts %s bps exactly once without imposing a consumer-side cap",
  (bps, rate, fee) => {
    mocks.info!.binary_taker_fee_rate = bps;
    mount();
    expect(rates.takerBps).toBe(bps);
    expect(rates.takerRate).toBe(rate);
    expect(estimates.estimateFee(100, 0.5, true)).toBe(fee);
    expect(estimates.estimateFee(100, 0.5, false)).toBe(0);
  },
);

it.each([
  [0.01, 0.0297],
  [0.1, 0.27],
  [0.5, 0.75],
  [0.9, 0.27],
  [0.99, 0.0297],
])(
  "uses the curve and UP coordinates at price %s for both outcomes",
  (price, fee) => {
    mount();
    for (const outcome of ["up", "down"] as const) {
      const { upPrice } = toBinaryUpRequest(outcome, "buy", price);
      expect(estimates.estimateFee(100, upPrice, true)).toBe(fee);
    }
  },
);

it("estimates separate fills without replacing their prices with an order average", () => {
  mount();
  const first = estimates.estimateFee(50, 0.1, true)!;
  const second = estimates.estimateFee(50, 0.9, true)!;
  expect(new Decimal(first).add(second).toNumber()).toBe(0.27);
  expect(estimates.estimateFee(100, 0.5, true)).toBe(0.75);
});

it("recomputes fees when the shared account snapshot changes", () => {
  mount();
  expect(estimates.estimateFee(100, 0.5, true)).toBe(0.75);
  mocks.info = { binary_maker_fee_rate: 20, binary_taker_fee_rate: 100 };
  act(() => root!.update(<Consumer />));
  expect(estimates.estimateFee(100, 0.5, true)).toBe(0.25);
  expect(estimates.estimateFee(100, 0.5, false)).toBe(0.05);
});

it("keeps target-account fees ahead of the logged-in account's cache", () => {
  const override: BinaryFeeRates = {
    makerBps: 20,
    makerRate: 0.002,
    takerBps: 100,
    takerRate: 0.01,
  };
  mount(override);
  expect(rates).toBe(override);
  expect(estimates.estimateFee(100, 0.5, true)).toBe(0.25);
  mocks.info = undefined;
  act(() => root!.update(<Consumer override={override} />));
  expect(rates).toBe(override);
  expect(estimates.estimateFee(100, 0.5, false)).toBe(0.05);
});

it.each([undefined, null, -1, NaN, Infinity, "300"])(
  "does not turn a missing or invalid fee %s into a default or a free estimate",
  (value) => {
    mocks.info = { binary_maker_fee_rate: 0, binary_taker_fee_rate: value };
    mount();
    expect(rates.takerRate).toBeUndefined();
    expect(estimates.estimateFee(100, 0.5, true)).toBeUndefined();
    expect(estimates.estimateFee(100, 0.5, false)).toBeUndefined();
  },
);

it("does not default an absent account to 300 bps", () => {
  mocks.info = undefined;
  mount();
  expect(rates.makerBps).toBeUndefined();
  expect(rates.takerBps).toBeUndefined();
  expect(estimates.estimateFee(100, 0.5, true)).toBeUndefined();
});

it.each([
  [0, "0.00%"],
  [6, "0.06%"],
  [100, "1.00%"],
  [150, "1.50%"],
  [300, "3.00%"],
  [450, "4.50%"],
  [6.5, "0.07%"],
  [undefined, "--%"],
  [-1, "--%"],
  [NaN, "--%"],
])("formats coefficient %s bps as %s using Decimal", (bps, expected) => {
  expect(formatBinaryFeeBps(bps)).toBe(expected);
});
