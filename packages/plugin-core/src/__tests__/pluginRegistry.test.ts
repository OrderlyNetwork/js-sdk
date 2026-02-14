import {
  OrderlyPluginRegistry,
  createOrderlySDK,
} from "../pluginRegistry";
import type { OrderlyPlugin, OrderlySDK } from "../types";

describe("OrderlyPluginRegistry", () => {
  afterEach(() => {
    OrderlyPluginRegistry.clear();
  });

  it("starts empty", () => {
    expect(OrderlyPluginRegistry.getPlugins()).toEqual([]);
  });

  it("registers a plugin and returns a copy via getPlugins", () => {
    const plugin: OrderlyPlugin = {
      id: "test-plugin",
      name: "Test",
    };
    OrderlyPluginRegistry.register(plugin);
    const list = OrderlyPluginRegistry.getPlugins();
    expect(list).toHaveLength(1);
    expect(list[0]).toBe(plugin);
    expect(list).not.toBe(OrderlyPluginRegistry.getPlugins());
  });

  it("accumulates multiple plugins", () => {
    OrderlyPluginRegistry.register({ id: "a" });
    OrderlyPluginRegistry.register({ id: "b" });
    expect(OrderlyPluginRegistry.getPlugins().map((p) => p.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("clear removes all plugins", () => {
    OrderlyPluginRegistry.register({ id: "x" });
    OrderlyPluginRegistry.clear();
    expect(OrderlyPluginRegistry.getPlugins()).toEqual([]);
  });
});

describe("createOrderlySDK", () => {
  afterEach(() => {
    OrderlyPluginRegistry.clear();
  });

  it("returns SDK with registerPlugin that registers to OrderlyPluginRegistry", () => {
    const sdk: OrderlySDK = createOrderlySDK();
    const plugin: OrderlyPlugin = { id: "sdk-plugin", name: "SDK" };
    sdk.registerPlugin(plugin);
    expect(OrderlyPluginRegistry.getPlugins()).toContain(plugin);
  });
});
