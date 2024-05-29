import { ExtensionPosition } from "./types";
import { useBuilder } from "./useBuilder";

export const useExtensionBuilder = (position: ExtensionPosition) => {
  const builder = useBuilder(position);

  return builder();
};
