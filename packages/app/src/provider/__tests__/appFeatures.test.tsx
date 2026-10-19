import { createElement, type PropsWithChildren } from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { cleanup, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { JsxEmit, ModuleKind, transpileModule } from "typescript";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppFeatures } from "@orderly.network/types";
import { useFeatureEnabled } from "../../hooks/useFeatureEnabled";
import { useAppContext } from "../appStateContext";
import { OrderlyAppProvider } from "../orderlyAppProvider";

const mocks = vi.hoisted(() => ({ config: vi.fn() }));
const config = { brokerId: "test", networkId: "testnet" as const };

vi.mock("@orderly.network/hooks", () => ({
  OrderlyConfigProvider: (props: PropsWithChildren) => {
    mocks.config(props);
    return props.children;
  },
  MarketCategoriesConfigProvider: ({ children }: PropsWithChildren) => children,
  useTrack: () => {},
  useTrackingInstance: () => {},
  useRestrictedInfo: () => ({}),
}));
vi.mock("@orderly.network/ui", () => ({
  LocaleProvider: ({ children }: PropsWithChildren) => children,
  ModalProvider: ({ children }: PropsWithChildren) => children,
  OrderlyPluginProvider: ({ children }: PropsWithChildren) => children,
  TooltipProvider: ({ children }: PropsWithChildren) => children,
  Toaster: () => null,
}));
vi.mock("../appThemeProvider", () => ({
  AppThemeProvider: ({ children }: PropsWithChildren) => children,
}));
vi.mock("../../hooks/useBootstrap", () => ({ useBootstrap: () => {} }));
vi.mock("../../hooks/useExecutionReport", () => ({
  useExecutionReport: () => {},
}));
vi.mock("../../hooks/useUILocale", () => ({ useUILocale: () => "en" }));
vi.mock("../../hooks/useAssetconvertEvent", () => ({
  useAssetconvertEvent: () => {},
}));
vi.mock("../../hooks/useCurrentChainId", () => ({
  useCurrentChainId: () => [1, vi.fn()],
}));
vi.mock("../../hooks/useLinkDevice", () => ({ useLinkDevice: () => {} }));
vi.mock("../../hooks/useSettleEvent", () => ({ useSettleEvent: () => {} }));
vi.mock("../../hooks/useWalletConnectError", () => ({
  useWalletConnectError: () => {},
}));
vi.mock("../../hooks/useWalletEvent", () => ({ useWalletEvent: () => {} }));
vi.mock("../../hooks/useWalletStateHandle", () => ({
  useWalletStateHandle: () => ({ connectWallet: vi.fn(), wrongNetwork: false }),
}));

function Probe() {
  const enabled = useFeatureEnabled("prediction");
  const { features } = useAppContext();
  return (
    <output data-config={JSON.stringify(features)}>{String(enabled)}</output>
  );
}

beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);

describe("application features", () => {
  it.each<AppFeatures | undefined>([
    undefined,
    {},
    { prediction: true },
    { prediction: undefined },
  ])("keeps omitted or enabled features on: %j", (features) => {
    render(
      <OrderlyAppProvider {...config} features={features}>
        <Probe />
      </OrderlyAppProvider>,
    );
    expect(screen.getByRole("status").textContent).toBe("true");
    expect(mocks.config.mock.calls.at(-1)?.[0]).not.toHaveProperty("features");
  });

  it("passes the configuration to application state and updates consumers at runtime", () => {
    const features = { prediction: false };
    const view = render(
      <OrderlyAppProvider {...config} features={features}>
        <Probe />
      </OrderlyAppProvider>,
    );
    expect(screen.getByRole("status").textContent).toBe("false");
    expect(screen.getByRole("status").getAttribute("data-config")).toBe(
      JSON.stringify(features),
    );
    expect(mocks.config.mock.calls.at(-1)?.[0]).not.toHaveProperty("features");
    view.rerender(
      <OrderlyAppProvider {...config}>
        <Probe />
      </OrderlyAppProvider>,
    );
    expect(screen.getByRole("status").textContent).toBe("true");
    view.rerender(
      <OrderlyAppProvider {...config} features={features}>
        <Probe />
      </OrderlyAppProvider>,
    );
    expect(screen.getByRole("status").textContent).toBe("false");
  });

  it("defaults to enabled outside the application provider", () => {
    render(<Probe />);
    expect(screen.getByRole("status").textContent).toBe("true");
  });

  it("renders the documented feature example with its hook under the provider", () => {
    const readme = readFileSync(
      resolve(
        dirname(fileURLToPath(import.meta.url)),
        "../../../../prediction/README.md",
      ),
      "utf8",
    );
    const example = readme
      .split("## Application features")[1]
      .match(/```tsx\n([\s\S]*?)\n```/)![1];
    const { outputText } = transpileModule(example, {
      compilerOptions: { jsx: JsxEmit.ReactJSX, module: ModuleKind.CommonJS },
    });
    const exports: { ExampleApp?: React.ComponentType } = {};
    runInNewContext(outputText, {
      exports,
      require: (id: string) => {
        if (id === "react/jsx-runtime") return jsxRuntime;
        if (id === "@orderly.network/react-app")
          return { OrderlyAppProvider, useFeatureEnabled };
        throw new Error(`Unexpected example dependency: ${id}`);
      },
      appConfig: config,
      onRouteChange: vi.fn(),
      App: () => createElement("div", { "data-testid": "app" }),
      PredictionMenu: () =>
        createElement("div", { "data-testid": "prediction-menu" }),
    });
    expect(exports.ExampleApp).toBeTypeOf("function");
    render(createElement(exports.ExampleApp!));
    expect(screen.getByTestId("app")).toBeTruthy();
    expect(screen.queryByTestId("prediction-menu")).toBeNull();
  });
});
