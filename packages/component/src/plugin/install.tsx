// interface PluginRegistry {}

import { ReactElement, ReactNode } from "react";
import { ExtensionProvider } from "./pluginContext";
import { ExtensionPosition } from "./types";
import { OrderlyExtensionRegistry } from "./registry";

/**
 * @name ExtensionOptions
 * @description Extension meta data
 */
export type ExtensionOptions = {
  name: string;
  scope?: string[];
  engines?: string; // define the extension require @orderly.network/react version, optional
  positions: ExtensionPosition[];
  __isInternal?: boolean;
  install?: () => Promise<void>;
  entry?: string[];
  // dependencies?: string[]; // define the extension require other extensions, optional
  // lifecycle hooks
  onInit?: () => void;
  activate?: () => Promise<void>;
  deactivate?: () => Promise<void>;
};

type ExtensionRenderComponentType<Props> =
  | ReactElement
  | ((props: Props) => ReactElement);

// type ExtensionRenderComponent = (
//   component: ExtensionRenderComponentType<Props>
// ) => void;

export const installExtension = <Props extends unknown = {}>(
  options: ExtensionOptions,
  builder?: () => Props
): ((component: ExtensionRenderComponentType<Props>) => void) => {
  return (component) => {
    const registry = OrderlyExtensionRegistry.getInstance();

    registry.register<Props>({
      name: options.name,
      positions: options.positions,
      __isInternal: !!options.__isInternal,
      builder,

      render: (props) => {
        console.log("[plugin] render:", options.name);
        const children =
          typeof component === "function" ? component(props) : component;

        return <ExtensionProvider>{children}</ExtensionProvider>;
      },
    });
  };
};
