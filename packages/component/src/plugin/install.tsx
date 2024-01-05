// interface PluginRegistry {}

import { ReactNode } from "react";
import { PluginProvider } from "./pluginContext";
import { ExtensionPosition } from "./types";
import { OrderlyExtensionRegistry } from "./registry";

export type ExtensionOptions = {
  name: string;
  positions: ExtensionPosition[];
};

type ExtensionRenderComponentType = ReactNode | (() => ReactNode);

type ExtensionRenderComponent = (
  component: ExtensionRenderComponentType
) => void;

export const installExtension = (
  options: ExtensionOptions
): ExtensionRenderComponent => {
  return (component: ExtensionRenderComponentType) => {
    const registry = OrderlyExtensionRegistry.getInstance();

    registry.register({
      name: options.name,
      positions: options.positions,

      render: () => {
        const children =
          typeof component === "function" ? component() : component;

        return <PluginProvider>{children}</PluginProvider>;
      },
    });
  };
};
