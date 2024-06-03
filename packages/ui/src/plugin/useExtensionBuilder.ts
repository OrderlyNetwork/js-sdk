import { ExtensionPosition } from "./types";
import { useBuilder } from "./useBuilder";

export const useExtensionBuilder = (
  position: ExtensionPosition,
  props: any
) => {
  const builder = useBuilder(position, props);

  return builder();
};
