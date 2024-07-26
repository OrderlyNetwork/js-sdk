import { useAppContext } from "../provider/appContext";

export const useDataTap = <T = any>(
  data: T,
  options?: {
    skip: false;
    fallbackData: Partial<T>;
  }
): T | Partial<T> | null => {
  const { wrongNetwork } = useAppContext();
  /**
   * ignore
   */
  if (options?.skip) return data;
  return wrongNetwork
    ? typeof options?.fallbackData !== "undefined"
      ? options.fallbackData
      : null
    : data;
};
