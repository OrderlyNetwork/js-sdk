import { OrderlyExtensionRegistry } from "./registry";
import { ExtensionPosition } from "./types";

export const useBuilder = (position: ExtensionPosition, props: any) => {
  const registry = OrderlyExtensionRegistry.getInstance();
  const plugin = registry.getPluginsByPosition(position);
  return () => {
    return plugin?.builder?.(props) || props;
  };
};
