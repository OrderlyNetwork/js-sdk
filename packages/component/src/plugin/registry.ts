import { getGlobalObject } from "@orderly.network/utils";
import { Extension, ExtensionBuilder, ExtensionPosition } from "./types";

const DEFAULT_BUILDER = (position: string) => () => {
  console.warn(`No builder provided for extension: [${position}]`);
  return {};
};

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

  register<Props>(
    plugin: Omit<Extension<Props>, "builder"> & { builder?: () => Props }
  ) {
    // this.pluginMap.set(plugin.name, plugin);
    for (let index = 0; index < plugin.positions.length; index++) {
      if (typeof plugin.builder !== "function") {
        // get exsiting builder
        const builder = this.extensionMap.get(plugin.positions[index])?.builder;
        plugin.builder =
          typeof builder === "undefined"
            ? DEFAULT_BUILDER(plugin.positions[index])
            : (builder as ExtensionBuilder);
      }
      const pos = plugin.positions[index];
      this.registerToPosition<Props>(pos, plugin as Extension<Props>);
    }
  }

  private registerToPosition<Props>(
    position: ExtensionPosition,
    plugin: Extension<Props>
  ) {
    if (this.extensionMap.has(position)) {
      const existingPlugin = this.extensionMap.get(position);
      if (!existingPlugin?.__isInternal) {
        throw new Error(`Plugin already registered at position [${position}]`);
      }
    }

    this.extensionMap.set(position, plugin);
  }

  setBuilder<Props>(
    position: ExtensionPosition,
    builder: ExtensionBuilder<Props>
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
}
