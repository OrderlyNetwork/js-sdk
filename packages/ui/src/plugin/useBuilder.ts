import { OrderlyExtensionRegistry } from "./registry";
import { ExtensionPosition } from "./types";

export const useBuilder = (position: ExtensionPosition) => {
  const registry = OrderlyExtensionRegistry.getInstance();
  const plugin = registry.getPluginsByPosition(position);
  return () => {
    return plugin?.builder?.();
  };
};
