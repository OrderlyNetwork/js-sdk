import React from "react";
import { render, screen } from "@testing-library/react";
import { OrderlyPluginProvider } from "../pluginContext";
import { useInjectedComponent } from "../useInjectedComponent";
import { OrderlyPluginRegistry } from "../pluginRegistry";

const DefaultWidget = (props: { label?: string }) => (
  <div data-testid="default">{props.label ?? "Default"}</div>
);

/** Wrapper that uses useInjectedComponent and renders the result */
const SlotRenderer = ({
  path,
  defaultComponent,
}: {
  path: string;
  defaultComponent: React.ComponentType<{ label?: string }>;
}) => {
  const Injected = useInjectedComponent(path, defaultComponent);
  return <Injected label="slot" />;
};

describe("useInjectedComponent", () => {
  afterEach(() => {
    OrderlyPluginRegistry.clear();
  });

  it("returns DefaultComponent when no interceptors for path", () => {
    render(
      <OrderlyPluginProvider plugins={[]}>
        <SlotRenderer path="Deposit.DepositForm" defaultComponent={DefaultWidget} />
      </OrderlyPluginProvider>
    );
    expect(screen.getByTestId("default")).toBeTruthy();
    expect(screen.getByTestId("default").textContent).toBe("slot");
  });

  it("renders interceptor output when plugin registers for path", () => {
    const InterceptorComponent = (Original: React.ComponentType<any>, props: any) => (
      <div data-testid="interceptor">
        <span>intercepted</span>
        <Original {...props} />
      </div>
    );
    const plugins = [
      {
        id: "test-plugin",
        name: "Test",
        interceptors: [
          {
            target: "Deposit.DepositForm",
            component: InterceptorComponent,
          },
        ],
      },
    ];
    render(
      <OrderlyPluginProvider plugins={plugins}>
        <SlotRenderer path="Deposit.DepositForm" defaultComponent={DefaultWidget} />
      </OrderlyPluginProvider>
    );
    expect(screen.getByTestId("interceptor")).toBeTruthy();
    expect(screen.getByText("intercepted")).toBeTruthy();
    expect(screen.getByTestId("default")).toBeTruthy();
  });

  it("ignores interceptors for other paths", () => {
    const plugins = [
      {
        id: "other",
        name: "Other",
        interceptors: [
          {
            target: "Other.Path",
            component: () => <div data-testid="other">other</div>,
          },
        ],
      },
    ];
    render(
      <OrderlyPluginProvider plugins={plugins}>
        <SlotRenderer path="Deposit.DepositForm" defaultComponent={DefaultWidget} />
      </OrderlyPluginProvider>
    );
    expect(screen.getByTestId("default")).toBeTruthy();
    expect(screen.queryByTestId("other")).toBeNull();
  });
});
