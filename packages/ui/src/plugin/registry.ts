import { getGlobalObject } from "@veltodefi/utils";
import { Extension, ExtensionBuilder, ExtensionPosition } from "./types";

function DEFAULT_BUILDER(data: any) {
  // console.warn("No builder provided for extension");
  return data || {};
}

// The plugin manager
export class OrderlyExtensionRegistry {
  // private static _instance: OrderlyExtensionRegistry;
  static getInstance(): OrderlyExtensionRegistry {
    const globalObject = getGlobalObject();

    if (!(globalObject as any).__ORDERLY_EXTENSION_REGISTRY__) {
      (globalObject as any).__ORDERLY_EXTENSION_REGISTRY__ =
        new OrderlyExtensionRegistry();
    }
    return (globalObject as any).__ORDERLY_EXTENSION_REGISTRY__;

    // if (!OrderlyExtensionRegistry._instance) {
    //   OrderlyExtensionRegistry._instance = new OrderlyExtensionRegistry();
    // }
    // return OrderlyExtensionRegistry._instance;
  }
  private extensionMap: Map<ExtensionPosition, Extension<unknown>> = new Map();
  // private formatterMap: Map<string, Function> = new Map();

  register<Props>(
    plugin: Omit<Extension<Props>, "builder"> & {
      builder?: (props: any) => Props;
    },
  ) {
    // this.pluginMap.set(plugin.name, plugin);

    if (!plugin.builder) {
      console.warn("No builder provided for extension");
    }

    for (let index = 0; index < plugin.positions.length; index++) {
      if (typeof plugin.builder !== "function") {
        // get existing builder
        const builder = this.extensionMap.get(plugin.positions[index])?.builder;
        plugin.builder =
          typeof builder === "undefined"
            ? // ? DEFAULT_BUILDER
              undefined
            : (builder as ExtensionBuilder);
      }
      const pos = plugin.positions[index];
      this.registerToPosition<Props>(pos, plugin as Extension<Props>);
    }
  }

  private registerToPosition<Props>(
    position: ExtensionPosition,
    plugin: Extension<Props>,
  ) {
    if (this.extensionMap.has(position)) {
      const existingPlugin = this.extensionMap.get(position);
      if (!existingPlugin?.__isInternal) {
        console.warn("`Plugin already registered at position [${position}]`");
        // throw new Error(`Plugin already registered at position [${position}]`);
        if (!existingPlugin?.builder && plugin.__isInternal) {
          this.setBuilder(position, plugin.builder);
        }
        return;
      }
      if (!plugin.builder) {
        plugin.builder = existingPlugin.builder as ExtensionBuilder<Props>;
      }
    }
    this.extensionMap.set(position, plugin as Extension<any>);
  }

  setBuilder<Props>(
    position: ExtensionPosition,
    builder: ExtensionBuilder<Props>,
  ) {
    const plugin = this.extensionMap.get(position);
    if (plugin) {
      plugin.builder = builder;
    }
  }

  unregister(plugin: Extension<unknown>) {
    for (let index = 0; index < plugin.positions.length; index++) {
      const pos = plugin.positions[index];

      this.unregisterFromPosition(pos);
    }
  }

  private unregisterFromPosition(position: ExtensionPosition) {
    this.extensionMap.delete(position);
  }

  getPluginsByPosition(position: ExtensionPosition) {
    return this.extensionMap.get(position);
  }

  /**
   * get the registered formatter by position
   * @param position
   */
  getFormatterByPosition(position: ExtensionPosition) {
    return this.extensionMap.get(position);
  }
}
