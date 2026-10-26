import { act, create, type ReactTestRenderer } from "react-test-renderer";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useSubAccountMutation } from "@orderly.network/hooks/src/subAccount/useSubAccountMutation";

const mocks = vi.hoisted(() => ({
  sign: vi.fn(),
  request: vi.fn(),
  allowed: true,
}));
vi.mock("@orderly.network/hooks/src/useAccountInstance", () => ({
  useAccountInstance: () => ({
    accountId: "main",
    signer: { sign: mocks.sign },
  }),
}));
vi.mock("@orderly.network/hooks/src/useConfig", () => ({
  useConfig: () => "https://api.test",
}));
vi.mock("@orderly.network/net", () => ({ mutate: mocks.request }));
vi.mock("swr/mutation", () => ({
  default: (url: string, fetcher: any) => ({
    trigger: (arg: any) => fetcher(url, { arg }),
  }),
}));
let root: ReactTestRenderer;
let trigger: ReturnType<typeof useSubAccountMutation>[0];
function Probe({ accountId = "sub" }: { accountId?: string }) {
  [trigger] = useSubAccountMutation("/v1/order", "POST", {
    accountId,
    shouldExecute: () => mocks.allowed,
  });
  return null;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.allowed = true;
  mocks.sign.mockResolvedValue({
    "orderly-account-id": "main",
    "orderly-signature": "main-signed",
  });
  mocks.request.mockResolvedValue({ success: true });
  act(() => {
    root = create(<Probe />);
  });
});
afterEach(() => act(() => root.unmount()));
it("uses the main signer with the target header and preserves reduce-only payload", async () => {
  const body = {
    symbol: "PERP_BTC5M2610120755_USDC",
    margin_mode: "ISOLATED",
    reduce_only: true,
  };
  await trigger(body);
  expect(mocks.sign.mock.calls[0][0]).toEqual({
    method: "POST",
    url: "/v1/order",
    data: body,
  });
  expect(mocks.request).toHaveBeenCalledWith(
    "https://api.test/v1/order",
    expect.objectContaining({
      headers: {
        "orderly-account-id": "sub",
        "orderly-signature": "main-signed",
      },
      body: JSON.stringify(body),
    }),
  );
});
it("never sends a request if management rights disappear while signing", async () => {
  let finish!: (value: unknown) => void;
  mocks.sign.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = trigger({ reduce_only: true });
  mocks.allowed = false;
  finish({ "orderly-signature": "signature" });
  await expect(pending).rejects.toThrow("no longer allowed");
  expect(mocks.request).not.toHaveBeenCalled();
});
it("revoked operations never start signing", async () => {
  mocks.allowed = false;
  await expect(trigger({})).rejects.toThrow("no longer allowed");
  expect(mocks.sign).not.toHaveBeenCalled();
});
