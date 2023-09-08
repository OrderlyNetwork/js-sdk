import { usePrivateDataObserver } from "@orderly.network/hooks";

export const WSObserver = () => {
  usePrivateDataObserver();
  return (
    <div className="fixed bottom-3 right-3 bg-yellow-400 w-5 h-5 z-50"></div>
  );
};
