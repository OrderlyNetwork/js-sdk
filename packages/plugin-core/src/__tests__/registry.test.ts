import { ExtensionPositionEnum } from "../types";
import { OrderlyExtensionRegistry } from "../registry";
import { resetExtensionRegistry } from "../setupTests";

describe("OrderlyExtensionRegistry", () => {
  beforeEach(() => {
    resetExtensionRegistry();
  });

  it("getInstance returns same instance within same global", () => {
    const a = OrderlyExtensionRegistry.getInstance();
    const b = OrderlyExtensionRegistry.getInstance();
    expect(a).toBe(b);
  });

  it("register stores extension by position and getPluginsByPosition returns it", () => {
    const registry = OrderlyExtensionRegistry.getInstance();
    const render = () => null;
    registry.register({
      __isInternal: false,
      name: "TestExt",
      positions: [ExtensionPositionEnum.DepositForm],
      render,
    });
    const plugin = registry.getPluginsByPosition(ExtensionPositionEnum.DepositForm);
    expect(plugin).toBeDefined();
    expect(plugin?.name).toBe("TestExt");
    expect(plugin?.render).toBe(render);
  });

  it("setBuilder sets builder on existing plugin at position", () => {
    const registry = OrderlyExtensionRegistry.getInstance();
    const builder = jest.fn((props: any) => ({ ...props, x: 1 }));
    registry.register({
      __isInternal: false,
      name: "Ext",
      positions: [ExtensionPositionEnum.WithdrawForm],
      render: () => null,
    });
    registry.setBuilder(ExtensionPositionEnum.WithdrawForm, builder);
    const plugin = registry.getPluginsByPosition(
      ExtensionPositionEnum.WithdrawForm
    );
    expect(plugin?.builder).toBe(builder);
  });

  it("getPluginsByPosition returns undefined for unregistered position", () => {
    const registry = OrderlyExtensionRegistry.getInstance();
    expect(
      registry.getPluginsByPosition(ExtensionPositionEnum.AccountMenu)
    ).toBeUndefined();
  });
});
