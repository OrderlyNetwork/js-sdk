import { Plugin, PluginPosition } from "./types";

// The plugin manager
export class OrderlyPluginRegistry {
  private static _instance: OrderlyPluginRegistry;
  static getInstance(): OrderlyPluginRegistry {
    if (!OrderlyPluginRegistry._instance) {
      OrderlyPluginRegistry._instance = new OrderlyPluginRegistry();
    }
    return OrderlyPluginRegistry._instance;
  }
  private pluginMap: Map<PluginPosition, Plugin> = new Map();

  register(plugin: Plugin) {
    // this.pluginMap.set(plugin.name, plugin);
    for (let index = 0; index < plugin.positions.length; index++) {
      const pos = plugin.positions[index];
      this.registerToPosition(pos, plugin);
    }
  }

  private registerToPosition(position: PluginPosition, plugin: Plugin) {
    if (this.pluginMap.has(position)) {
      throw new Error(`Plugin already registered at position ${position}`);
    }

    this.pluginMap.set(position, plugin);
  }

  unregister(plugin: Plugin) {
    for (let index = 0; index < plugin.positions.length; index++) {
      const pos = plugin.positions[index];

      this.unregisterFromPosition(pos);
    }
  }

  private unregisterFromPosition(position: PluginPosition) {
    this.pluginMap.delete(position);
  }
}
