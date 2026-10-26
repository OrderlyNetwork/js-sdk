import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, expect, it, vi } from "vitest";
import { usePredictionAccountData } from "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountData";

const mocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  actions: vi.fn(),
}));
vi.mock("@orderly.network/i18n", () => ({
  i18n: { t: (key: string) => key },
}));
vi.mock("@orderly.network/ui", () => ({
  toast: { success: mocks.success, error: mocks.error },
}));
vi.mock(
  "@orderly.network/prediction/src/prediction/binary/useBinaryRegion",
  () => ({
    useBinaryRegionRestricted: () => false,
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionMarkets",
  () => ({
    usePredictionMarkets: () => ({ rows: [], now: 0 }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountResources",
  () => ({
    usePredictionAccountResources: () => ({
      accountReady: true,
      accountState: { accountId: "A" },
    }),
  }),
);
vi.mock(
  "@orderly.network/prediction/src/prediction/hooks/usePredictionAccountActions",
  () => ({
    usePredictionAccountActions: (...args: unknown[]) => {
      mocks.actions(...args);
      return { actions: {} };
    },
  }),
);

let root: ReactTestRenderer;
function Consumer() {
  usePredictionAccountData();
  return null;
}
function mountNotify(): (message: string, tone?: "success" | "danger") => void {
  act(() => {
    root = create(<Consumer />);
  });
  return mocks.actions.mock.calls[0][0].notify;
}
afterEach(() => {
  act(() => root?.unmount());
  vi.clearAllMocks();
});

it("uses success styling for notifications with no explicit tone", () => {
  const notify = mountNotify();
  notify("prediction.message.insufficientBalance");
  expect(mocks.success).toHaveBeenCalledWith(
    "prediction.message.insufficientBalance",
  );
  expect(mocks.error).not.toHaveBeenCalled();
});
it("keeps explicit failure notifications red", () => {
  const notify = mountNotify();
  notify("prediction.invalidOrder", "danger");
  expect(mocks.error).toHaveBeenCalledWith("prediction.invalidOrder");
  expect(mocks.success).not.toHaveBeenCalled();
});
