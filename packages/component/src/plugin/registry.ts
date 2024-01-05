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
  private pluginMap: Map<ExtensionPosition, Extension> = new Map();

  register(plugin: Extension) {
    // this.pluginMap.set(plugin.name, plugin);
    for (let index = 0; index < plugin.positions.length; index++) {
      const pos = plugin.positions[index];
      this.registerToPosition(pos, plugin);
    }
  }

  private registerToPosition(position: ExtensionPosition, plugin: Extension) {
    if (this.pluginMap.has(position)) {
      throw new Error(`Plugin already registered at position [${position}]`);
    }

    this.pluginMap.set(position, plugin);
  }

  unregister(plugin: Extension) {
    for (let index = 0; index < plugin.positions.length; index++) {
      const pos = plugin.positions[index];

      this.unregisterFromPosition(pos);
    }
  }

  private unregisterFromPosition(position: ExtensionPosition) {
    this.pluginMap.delete(position);
  }

  getPluginsByPosition(position: ExtensionPosition) {
    return this.pluginMap.get(position);
  }
}
