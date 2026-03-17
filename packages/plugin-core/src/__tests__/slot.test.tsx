import React from "react";
import { render, screen } from "@testing-library/react";
import { OrderlyPluginProvider } from "../pluginContext";
import { OrderlyPluginRegistry } from "../pluginRegistry";
import { ExtensionSlot } from "../slot";
import { ExtensionPositionEnum } from "../types";

describe("ExtensionSlot", () => {
  afterEach(() => {
    OrderlyPluginRegistry.clear();
  });

  it("renders NotFound when no plugin and no defaultWidget", () => {
    render(
      <OrderlyPluginProvider plugins={[]}>
        <ExtensionSlot position={ExtensionPositionEnum.DepositForm} />
      </OrderlyPluginProvider>,
    );
    expect(screen.getByText(/depositForm/)).toBeTruthy();
    expect(screen.getByText("Not found!")).toBeTruthy();
  });

  it("renders defaultWidget when provided and no plugin", () => {
    const Default = () => <div data-testid="default-widget">Default</div>;
    render(
      <OrderlyPluginProvider plugins={[]}>
        <ExtensionSlot
          position={ExtensionPositionEnum.WithdrawForm}
          defaultWidget={Default}
        />
      </OrderlyPluginProvider>,
    );
    expect(screen.getByTestId("default-widget").textContent).toBe("Default");
  });

  it("renders intercepted content when plugin registers for position", () => {
    const plugins = [
      {
        id: "slot-plugin",
        name: "SlotPlugin",
        interceptors: [
          {
            target: "Deposit.DepositForm",
            component: (Original: React.ComponentType<any>, props: any) => (
              <div data-testid="intercepted">
                <span>intercepted</span>
                <Original {...props} />
              </div>
            ),
          },
        ],
      },
    ];
    render(
      <OrderlyPluginProvider plugins={plugins}>
        <ExtensionSlot position={ExtensionPositionEnum.DepositForm} />
      </OrderlyPluginProvider>,
    );
    expect(screen.getByTestId("intercepted")).toBeTruthy();
    expect(screen.getByText("intercepted")).toBeTruthy();
  });
});
