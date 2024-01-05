// interface PluginRegistry {}

import { ReactNode } from "react";
import { PluginProvider } from "./pluginContext";
import { PluginPosition } from "./types";
import { OrderlyPluginRegistry } from "./registry";

export type PluginOptions = {
  name: string;
  positions: PluginPosition[];
};

type PluginRenderComponent = (component: ReactNode) => void;

export const installOrderlyPlugin = (
  options: PluginOptions
): PluginRenderComponent => {
  return (component: ReactNode) => {
    const registry = OrderlyPluginRegistry.getInstance();

    registry.register({
      name: options.name,
      positions: options.positions,

      render: () => {
        return <PluginProvider>{component}</PluginProvider>;
      },
    });
  };
};
