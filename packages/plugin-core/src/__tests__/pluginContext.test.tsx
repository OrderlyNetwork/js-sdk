import React from "react";
import { render, screen } from "@testing-library/react";
import {
  OrderlyPluginProvider,
  useOrderlyPluginContext,
  ExtensionProvider,
  useExtensionContext,
} from "../pluginContext";
import { OrderlyPluginRegistry } from "../pluginRegistry";
import type { OrderlyPlugin, PluginRegistrationFn } from "../types";

/** Consumer to read context in tests */
const ContextConsumer = () => {
  const { plugins, apiFacade } = useOrderlyPluginContext();
  return (
    <div>
      <span data-testid="plugin-count">{plugins.length}</span>
      <span data-testid="plugin-ids">{plugins.map((p) => p.id).join(",")}</span>
      <span data-testid="has-api">{String(!!apiFacade)}</span>
    </div>
  );
};

describe("OrderlyPluginProvider", () => {
  afterEach(() => {
    OrderlyPluginRegistry.clear();
  });

  it("provides empty plugins and apiFacade when plugins=[]", () => {
    render(
      <OrderlyPluginProvider plugins={[]}>
        <ContextConsumer />
      </OrderlyPluginProvider>,
    );
    expect(screen.getByTestId("plugin-count").textContent).toBe("0");
    expect(screen.getByTestId("plugin-ids").textContent).toBe("");
    expect(screen.getByTestId("has-api").textContent).toBe("true");
  });

  it("merges descriptor plugins from props", () => {
    const plugins: OrderlyPlugin[] = [
      { id: "p1", name: "P1" },
      { id: "p2", name: "P2" },
    ];
    render(
      <OrderlyPluginProvider plugins={plugins}>
        <ContextConsumer />
      </OrderlyPluginProvider>,
    );
    expect(screen.getByTestId("plugin-count").textContent).toBe("2");
    expect(screen.getByTestId("plugin-ids").textContent).toBe("p1,p2");
  });

  it("invokes registration fn with SDK and pluginState and merges registered plugins", () => {
    const registerFn: PluginRegistrationFn<{ foo: string }> = (sdk, state) => {
      expect(state).toEqual({ foo: "bar" });
      sdk.registerPlugin({ id: "from-fn", name: "FromFn" });
    };
    render(
      <OrderlyPluginProvider
        plugins={[registerFn]}
        pluginState={{ foo: "bar" }}
      >
        <ContextConsumer />
      </OrderlyPluginProvider>,
    );
    expect(screen.getByTestId("plugin-ids").textContent).toBe("from-fn");
  });

  it("calls setup on each plugin that has setup", () => {
    const setup = jest.fn();
    const plugins: OrderlyPlugin[] = [
      { id: "with-setup", name: "WithSetup", setup },
    ];
    render(
      <OrderlyPluginProvider plugins={plugins}>
        <ContextConsumer />
      </OrderlyPluginProvider>,
    );
    expect(setup).toHaveBeenCalledTimes(1);
    expect(setup).toHaveBeenCalledWith(expect.any(Object));
  });

  it("merges plugins from OrderlyPluginRegistry with props plugins", () => {
    OrderlyPluginRegistry.register({
      id: "from-registry",
      name: "FromRegistry",
    });
    render(
      <OrderlyPluginProvider
        plugins={[{ id: "from-props", name: "FromProps" }]}
      >
        <ContextConsumer />
      </OrderlyPluginProvider>,
    );
    expect(screen.getByTestId("plugin-count").textContent).toBe("2");
    expect(screen.getByTestId("plugin-ids").textContent).toContain(
      "from-props",
    );
    expect(screen.getByTestId("plugin-ids").textContent).toContain(
      "from-registry",
    );
  });
});

describe("useOrderlyPluginContext", () => {
  it("returns default (empty plugins, empty api) when outside provider", () => {
    render(<ContextConsumer />);
    expect(screen.getByTestId("plugin-count").textContent).toBe("0");
    expect(screen.getByTestId("has-api").textContent).toBe("true");
  });
});

describe("ExtensionProvider and useExtensionContext", () => {
  const ExtensionConsumer = () => {
    const ctx = useExtensionContext();
    return <span data-testid="ext-ctx">{JSON.stringify(ctx)}</span>;
  };

  it("provides empty object and child can read it", () => {
    render(
      <ExtensionProvider>
        <ExtensionConsumer />
      </ExtensionProvider>,
    );
    expect(screen.getByTestId("ext-ctx").textContent).toBe("{}");
  });
});
