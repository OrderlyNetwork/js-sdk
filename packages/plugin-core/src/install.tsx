import React, { ElementType, ReactElement, createElement } from "react";
import { positionToPath } from "./pathMap";
import { OrderlyPluginRegistry } from "./pluginRegistry";
import { OrderlyExtensionRegistry } from "./registry";
import { ExtensionPosition } from "./types";

/** @deprecated Use OrderlyPlugin with interceptors instead */
export type ExtensionOptions<Props> = {
  name: string;
  scope?: string[];
  engines?: string;
  positions: ExtensionPosition[];
  builder?: (props: any) => Props;
  __isInternal?: boolean;
  entry?: string[];
  installed?: () => Promise<void>;
  onInit?: () => void;
  activate?: () => Promise<void>;
  deactivate?: () => Promise<void>;
};

type ExtensionRenderComponentType<Props> =
  | ElementType<Props>
  | ((props: Props) => ReactElement);

/**
 * Registers an extension. Registers to both legacy registry and new plugin registry.
 * @deprecated Prefer registerPlugin via OrderlyPluginProvider plugins prop
 */
export const installExtension = <Props extends object>(
  options: ExtensionOptions<Props>,
): ((component: ExtensionRenderComponentType<Props>) => void) => {
  return (component) => {
    const registry = OrderlyExtensionRegistry.getInstance();
    registry.register<Props>({
      name: options.name,
      positions: options.positions,
      __isInternal: !!options.__isInternal,
      builder: options.builder,
      render: component,
    });

    const builder = options.builder;
    OrderlyPluginRegistry.register({
      id: options.name,
      name: options.name,
      interceptors: options.positions.map((position) => ({
        target: positionToPath(position),
        component: (Original, props, api) => {
          const transformed = builder ? builder(props) : props;
          return createElement(
            component as React.ComponentType<any>,
            transformed,
          );
        },
      })),
    });
  };
};

/**
 * @deprecated Prefer registerPlugin via OrderlyPluginProvider plugins prop
 */
export const setExtensionBuilder = <
  Props extends object = Record<string, unknown>,
>(
  position: ExtensionPosition,
  builder: () => Props,
) => {
  const registry = OrderlyExtensionRegistry.getInstance();
  registry.setBuilder(position, builder);
};
