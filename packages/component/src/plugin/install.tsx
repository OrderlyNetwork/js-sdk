// interface PluginRegistry {}

import { ReactNode } from "react";
import { PluginProvider } from "./pluginContext";

export type PluginOptions = {
  name: string;
  position: string;
};

type PluginRenderComponent = (component: ReactNode) => React.ReactNode;

export const installOrderlyPlugin = (
  options: PluginOptions
): PluginRenderComponent => {
  return (component: ReactNode) => {
    return <PluginProvider>{component}</PluginProvider>;
  };
};
