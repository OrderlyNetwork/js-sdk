import { Extension, ExtensionPosition } from "./types";

// The plugin manager
export class OrderlyExtensionRegistry {
  private static _instance: OrderlyExtensionRegistry;
  static getInstance(): OrderlyExtensionRegistry {
    if (!OrderlyExtensionRegistry._instance) {
      OrderlyExtensionRegistry._instance = new OrderlyExtensionRegistry();
    }
    return OrderlyExtensionRegistry._instance;
  }
  private extensionMap: Map<ExtensionPosition, Extension<unknown>> = new Map();

  register<Props>(plugin: Extension<Props>) {
    // this.pluginMap.set(plugin.name, plugin);
    for (let index = 0; index < plugin.positions.length; index++) {
      const pos = plugin.positions[index];
      this.registerToPosition<Props>(pos, plugin);
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
