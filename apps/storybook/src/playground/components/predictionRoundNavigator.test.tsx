import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { expect, it, vi } from "vitest";
import type { BinaryInfoRow } from "@orderly.network/prediction/src/prediction/binary/binaryInfo";
import { RoundNavigator } from "@orderly.network/prediction/src/prediction/roundNavigator.ui";

vi.mock("@orderly.network/i18n", () => ({
  i18n: { t: (key: string) => key },
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
  PopoverRoot: ({ children }: { children: React.ReactNode }) => children,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => children,
  PopoverContent: ({ children }: { children: React.ReactNode }) => children,
  CaretDownIcon: () => null,
  CaretUpIcon: () => null,
  AssetIcon: () => null,
  BarChartIcon: () => null,
  useMediaQuery: () => true,
}));
vi.mock("@orderly.network/prediction/src/prediction/predictionShared", () => ({
  formatCountdown: () => "04:00",
  formatCountdownWithHours: () => "0:04:00",
  usePredictionFormatters: () => ({
    chart: {
      roundTimeFormatter: { format: () => "10:25" },
      roundLabelFormatter: { format: () => "Sep 29" },
      localOffsetLabel: "UTC",
      resolutionLocalFormatter: { format: () => "10:30" },
      resolutionUtcFormatter: { format: () => "02:30" },
    },
  }),
}));

const now = Date.UTC(2026, 8, 29, 10, 36);
const expired = (
  symbol: string,
  start: number,
  outcome: "UP" | "DOWN",
): BinaryInfoRow => ({
  symbol,
  product_type: "BINARY",
  status: "ACTIVE",
  activated_at: start - 60_000,
  observation_start_at: start,
  expire_at: start + 300_000,
  index_price_symbol: "PERP_BTC_USDC",
  fee_model: "BINARY_PROBABILITY",
  s0: null,
  outcome,
  result_committed_at: start + 400_000,
});
const older = expired(
  "PERP_BTC5M2609291020_USDC",
  Date.UTC(2026, 8, 29, 10, 20),
  "UP",
);
const newer = expired(
  "PERP_BTC5M2609291025_USDC",
  Date.UTC(2026, 8, 29, 10, 25),
  "DOWN",
);
const live: BinaryInfoRow = {
  symbol: "PERP_BTC5M2609291035_USDC",
  product_type: "BINARY",
  status: "ACTIVE",
  activated_at: now - 120_000,
  observation_start_at: now - 60_000,
  expire_at: now + 240_000,
  index_price_symbol: "PERP_BTC_USDC",
  fee_model: "BINARY_PROBABILITY",
  s0: null,
};

let root: ReactTestRenderer;
const render = (rows: BinaryInfoRow[]) => {
  act(() => {
    root = create(
      <RoundNavigator
        round={newer.observation_start_at / 1000}
        intervalSeconds={300}
        now={now}
        rows={rows}
        selectedRound={newer.observation_start_at / 1000}
        onRoundChange={vi.fn()}
        chartMode="price"
        onChartModeChange={vi.fn()}
        roundOutcome={() => "down"}
      />,
    );
  });
};
const placeholderButton = () =>
  root!.root
    .findAllByType("button")
    .find(
      (button) =>
        button.props.disabled === true && button.props.children === "--",
    );
const moreButton = () =>
  root!.root
    .findAllByType("button")
    .find((button) => button.props.children?.[0] === "prediction.rounds.more");

it("hides placeholder slots and the more menu for a history-only market", () => {
  render([older, newer]);
  expect(placeholderButton()).toBeUndefined();
  expect(moreButton()).toBeUndefined();
  act(() => root.unmount());
});

it("keeps placeholder slots and the more menu while the schedule continues", () => {
  render([older, newer, live]);
  expect(placeholderButton()).toBeDefined();
  expect(moreButton()).toBeDefined();
  expect(moreButton()!.props.disabled).toBe(true);
  act(() => root.unmount());
});
