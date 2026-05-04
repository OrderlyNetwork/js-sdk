import type { OrderlyPlugin, OrderlySDK } from "./types";

/**
 * Global plugin registry for installExtension adapter and SDK.registerPlugin.
 * OrderlyPluginProvider merges plugins from props with this registry.
 */
const PLUGINS: OrderlyPlugin[] = [];

export const OrderlyPluginRegistry = {
  register(descriptor: OrderlyPlugin): void {
    PLUGINS.push(descriptor);
  },
  getPlugins(): OrderlyPlugin[] {
    return [...PLUGINS];
  },
  clear(): void {
    PLUGINS.length = 0;
  },
};

/** SDK instance for plugin registration (used by registration fns) */
export const createOrderlySDK = (): OrderlySDK => ({
  registerPlugin: (descriptor) => OrderlyPluginRegistry.register(descriptor),
});
