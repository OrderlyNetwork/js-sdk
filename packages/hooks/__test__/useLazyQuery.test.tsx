import { act, cleanup, renderHook } from "@testing-library/react";
import { usePluginScope } from "@orderly.network/plugin-core";
import { useLazyQuery } from "../src/useLazyQuery";
import { fetcher } from "../src/utils/fetcher";

jest.mock("../src/useConfig", () => ({
  useConfig: () => "https://api.example",
}));
jest.mock("../src/utils/fetcher", () => ({ fetcher: jest.fn() }));
jest.mock("@orderly.network/plugin-core", () => ({
  usePluginScope: jest.fn(),
}));

const nativeHeaders = globalThis.Headers;
beforeAll(() => {
  if (!globalThis.Headers) {
    globalThis.Headers = class extends Map<string, string> {
      constructor(values?: Record<string, string>) {
        super(Object.entries(values ?? {}));
      }
    } as unknown as typeof Headers;
  }
});
afterAll(() => {
  globalThis.Headers = nativeHeaders;
});
beforeEach(() => {
  jest.mocked(fetcher).mockResolvedValue({ rows: [] });
});
afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe("lazy public request attribution", () => {
  it("preserves caller headers and includes the owning plugin ID", async () => {
    jest
      .mocked(usePluginScope)
      .mockReturnValue({ pluginId: "announcement-plugin" } as ReturnType<
        typeof usePluginScope
      >);
    const { result } = renderHook(() =>
      useLazyQuery("/v2/public/announcement/detail", {
        init: { headers: { "X-Custom": "retained" } },
      }),
    );
    await act(async () => {
      await result.current.trigger({ announcement_id: "1", broker_id: "a" });
    });
    const [url, init] = jest.mocked(fetcher).mock.calls[0];
    expect(url).toBe(
      "https://api.example/v2/public/announcement/detail?announcement_id=1&broker_id=a",
    );
    expect((init.headers as Headers).get("X-Orderly-Plugin-Id")).toBe(
      "announcement-plugin",
    );
    expect((init.headers as Headers).get("X-Custom")).toBe("retained");
  });
  it("does not add plugin attribution outside a plugin scope", async () => {
    jest.mocked(usePluginScope).mockReturnValue(null);
    const { result } = renderHook(() =>
      useLazyQuery("/v2/public/announcement"),
    );
    await act(async () => {
      await result.current.trigger();
    });
    expect(
      (jest.mocked(fetcher).mock.calls[0][1].headers as Headers).get(
        "X-Orderly-Plugin-Id",
      ),
    ).toBeFalsy();
  });
});
