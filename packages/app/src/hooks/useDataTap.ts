import { useAppContext } from "../provider/appContext";

export const useDataTap = <T = any>(
  data: T,
  options?: {
    skip?: false;
    // fallbackData?: Partial<T>;
  }
): T | null => {
  const { wrongNetwork } = useAppContext();
  /**
   * ignore
   */
  if (options?.skip) return data;
  return wrongNetwork ? null : data;
};
