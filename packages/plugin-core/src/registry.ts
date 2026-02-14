import { getGlobalObject } from "@orderly.network/utils";
import { Extension, ExtensionBuilder, ExtensionPosition } from "./types";

/**
 * Legacy extension registry (position-based, for installExtension backward compat).
 * @deprecated Use registerPlugin via OrderlyPluginProvider plugins prop instead
 */
export class OrderlyExtensionRegistry {
  static getInstance(): OrderlyExtensionRegistry {
    const globalObject = getGlobalObject();
    if (!(globalObject as any).__ORDERLY_EXTENSION_REGISTRY__) {
      (globalObject as any).__ORDERLY_EXTENSION_REGISTRY__ =
        new OrderlyExtensionRegistry();
    }
    return (globalObject as any).__ORDERLY_EXTENSION_REGISTRY__;
  }

  private extensionMap: Map<ExtensionPosition, Extension<unknown>> = new Map();

  register<Props>(
    plugin: Omit<Extension<Props>, "builder"> & {
      builder?: (props: any) => Props;
    },
  ) {
    for (let index = 0; index < plugin.positions.length; index++) {
      if (typeof plugin.builder !== "function") {
        const builder = this.extensionMap.get(plugin.positions[index])?.builder;
        plugin.builder =
          typeof builder === "undefined" ? undefined : (builder as ExtensionBuilder);
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
        if (!existingPlugin?.builder && plugin.__isInternal && plugin.builder) {
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

  getPluginsByPosition(position: ExtensionPosition) {
    return this.extensionMap.get(position);
  }
}
