import { ElementType, ReactElement } from "react";
import { ExtensionProvider } from "./pluginContext";
import { OrderlyExtensionRegistry } from "./registry";
import { ExtensionPosition } from "./types";

/**
 * @name ExtensionOptions
 * @description Extension meta data
 */
export type ExtensionOptions<Props> = {
  name: string;
  /**
   * which ctx data the extension available to use
   */
  scope?: string[];
  /**
   * @description define the extension require @veltodefi/hook version, optional
   * @default "*"
   */
  engines?: string; //
  positions: ExtensionPosition[];
  builder?: (props: any) => Props;
  __isInternal?: boolean;
  entry?: string[];
  // dependencies?: string[]; // define the extension require other extensions, optional
  // lifecycle hooks
  /**
   * fire when the extension is installed
   * @returns
   */
  installed?: () => Promise<void>;
  onInit?: () => void;
  activate?: () => Promise<void>;
  deactivate?: () => Promise<void>;
};

type ExtensionRenderComponentType<Props> =
  | ElementType<Props>
  | ((props: Props) => ReactElement);

// type ExtensionRenderComponent = (
//   component: ExtensionRenderComponentType<Props>
// ) => void;

export const installExtension = <Props,>(
  options: ExtensionOptions<Props>,
): ((component: ExtensionRenderComponentType<Props>) => void) => {
  return (component) => {
    const registry = OrderlyExtensionRegistry.getInstance();
    console.log("[plugin] install:", options.name);
    registry.register<Props>({
      name: options.name,
      positions: options.positions,
      __isInternal: !!options.__isInternal,
      builder: options.builder,
      render: component,
    });
  };
};

/**
 * update the extension builder function
 */
export const setExtensionBuilder = <Props extends unknown = {}>(
  position: ExtensionPosition,
  builder: () => Props,
) => {
  const registry = OrderlyExtensionRegistry.getInstance();
  registry.setBuilder(position, builder);
};
