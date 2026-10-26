import { createElement } from "react";
import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  useCancelAllConfirmation,
  type CancelAllConfirmationOptions,
} from "@orderly.network/ui-orders/src/components/orderList/useCancelAllConfirmation";

const mocks = vi.hoisted(() => ({
  accountId: "a",
  dialog: null as any,
  resolve: null as any,
  error: vi.fn(),
}));
vi.mock("@orderly.network/hooks", async () => ({
  ...(await vi.importActual<any>(
    "@orderly.network/hooks/src/utils/orderCancellation",
  )),
  useAccount: () => ({ state: { accountId: mocks.accountId } }),
  useMemoizedFn: (
    await vi.importActual<any>(
      "@orderly.network/hooks/src/shared/useMemoizedFn",
    )
  ).useMemoizedFn,
}));
vi.mock("@orderly.network/i18n", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("@orderly.network/ui", () => ({
  Text: ({ children }: any) => children,
  toast: { error: mocks.error },
  modal: {
    confirm: (dialog: any) => {
      mocks.dialog = dialog;
      return new Promise((resolve) => {
        mocks.resolve = resolve;
      });
    },
  },
}));
let root: ReactTestRenderer | undefined;
function mount(options: CancelAllConfirmationOptions) {
  let result!: ReturnType<typeof useCancelAllConfirmation>;
  function Harness({ options }: { options: CancelAllConfirmationOptions }) {
    result = useCancelAllConfirmation(options);
    return null;
  }
  act(() => {
    root = create(createElement(Harness, { options }));
  });
  return {
    get result() {
      return result;
    },
    update(next: CancelAllConfirmationOptions) {
      act(() => root!.update(createElement(Harness, { options: next })));
    },
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.accountId = "a";
});
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
});

it.each([true, false])(
  "calls onSuccess only when execution succeeds (%s)",
  async (success) => {
    const execute = vi.fn(async () => success);
    const onSuccess = vi.fn();
    const harness = mount({
      scopeKey: "perps",
      title: "Cancel",
      content: "All pending",
      execute,
      onSuccess,
    });
    let pending!: Promise<boolean>;
    act(() => {
      pending = harness.result.onCancelAll();
    });
    await act(async () => {
      mocks.resolve(await mocks.dialog.onOk());
      expect(await pending).toBe(success);
    });
    expect(onSuccess).toHaveBeenCalledTimes(success ? 1 : 0);
  },
);

it("does not submit the same confirmation twice", async () => {
  let finish!: () => void;
  const execute = vi.fn(
    () =>
      new Promise<boolean>((resolve) => {
        finish = () => resolve(true);
      }),
  );
  const harness = mount({
    scopeKey: "perps",
    title: "Cancel",
    content: "All pending",
    execute,
  });
  let pending!: Promise<boolean>;
  act(() => {
    pending = harness.result.onCancelAll();
  });
  const first = mocks.dialog.onOk();
  expect(await mocks.dialog.onOk()).toBe(false);
  expect(execute).toHaveBeenCalledOnce();
  await act(async () => {
    finish();
    mocks.resolve(await first);
    expect(await pending).toBe(true);
  });
});

it("checks latest permissions and invalidates an unmounted dialog", async () => {
  const execute = vi.fn(async () => true);
  const options = {
    scopeKey: "perps",
    title: "Cancel",
    content: "All pending",
    execute,
  };
  const harness = mount(options);
  let pending!: Promise<boolean>;
  act(() => {
    pending = harness.result.onCancelAll();
  });
  harness.update({ ...options, disabled: true });
  await act(async () => {
    mocks.resolve(await mocks.dialog.onOk());
    expect(await pending).toBe(false);
  });
  expect(execute).not.toHaveBeenCalled();
  harness.update(options);
  act(() => {
    pending = harness.result.onCancelAll();
    root!.unmount();
  });
  await act(async () => {
    mocks.resolve(await mocks.dialog.onOk());
    expect(await pending).toBe(false);
  });
  expect(execute).not.toHaveBeenCalled();
  expect(mocks.error).toHaveBeenCalledWith("orders.cancelAll.contextChanged");
});
