import { usePrivateDataObserver } from "@orderly.network/hooks";

export const WSObserver = () => {
  // @ts-ignore
  usePrivateDataObserver();
  return null;
};
