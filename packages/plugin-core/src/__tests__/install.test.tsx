import React from "react";
import { installExtension, setExtensionBuilder } from "../install";
import { OrderlyPluginRegistry } from "../pluginRegistry";
import { OrderlyExtensionRegistry } from "../registry";
import { ExtensionPositionEnum } from "../types";
import { resetExtensionRegistry } from "../setupTests";

describe("installExtension", () => {
  beforeEach(() => {
    resetExtensionRegistry();
    OrderlyPluginRegistry.clear();
  });

  it("registers to OrderlyPluginRegistry and OrderlyExtensionRegistry when curried component is called", () => {
    const Component = () => <div>Installed</div>;
    const installer = installExtension({
      name: "TestExt",
      positions: [ExtensionPositionEnum.DepositForm],
    });
    installer(Component);

    const plugins = OrderlyPluginRegistry.getPlugins();
    expect(plugins).toHaveLength(1);
    expect(plugins[0].id).toBe("TestExt");
    expect(plugins[0].interceptors).toHaveLength(1);
    expect(plugins[0].interceptors![0].target).toBe("Deposit.DepositForm");

    const legacy = OrderlyExtensionRegistry.getInstance().getPluginsByPosition(
      ExtensionPositionEnum.DepositForm
    );
    expect(legacy).toBeDefined();
    expect(legacy?.name).toBe("TestExt");
    expect(legacy?.render).toBe(Component);
  });

  it("registers interceptors for all positions", () => {
    const Component = () => null;
    installExtension({
      name: "Multi",
      positions: [
        ExtensionPositionEnum.DepositForm,
        ExtensionPositionEnum.WithdrawForm,
      ],
    })(Component);

    const plugins = OrderlyPluginRegistry.getPlugins();
    expect(plugins[0].interceptors).toHaveLength(2);
    const targets = plugins[0].interceptors!.map((i) => i.target);
    expect(targets).toContain("Deposit.DepositForm");
    expect(targets).toContain("Deposit.WithdrawForm");
  });
});

describe("setExtensionBuilder", () => {
  beforeEach(() => {
    resetExtensionRegistry();
  });

  it("sets builder on existing extension at position", () => {
    const registry = OrderlyExtensionRegistry.getInstance();
    registry.register({
      __isInternal: false,
      name: "Ext",
      positions: [ExtensionPositionEnum.AccountMenu],
      render: () => null,
    });
    const builder = jest.fn(() => ({}));
    setExtensionBuilder(ExtensionPositionEnum.AccountMenu, builder);
    const plugin = registry.getPluginsByPosition(ExtensionPositionEnum.AccountMenu);
    expect(plugin?.builder).toBe(builder);
  });
});
