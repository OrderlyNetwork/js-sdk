import React, { type ComponentType } from "react";
import { useInjectedComponent } from "./useInjectedComponent";

/**
 * HOC: wraps a component to make it interceptable by plugins.
 */
export function injectable<P extends object>(
  Component: ComponentType<P>,
  name: string
): ComponentType<P> {
  const InjectableComponent = (props: P) => {
    const Injected = useInjectedComponent(name, Component);
    return <Injected {...props} />;
  };
  InjectableComponent.displayName = `injectable(${name})`;
  return InjectableComponent;
}
