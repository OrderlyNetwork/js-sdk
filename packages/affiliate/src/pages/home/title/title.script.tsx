import { useReferralContext } from "../../../hooks";

export type TitleReturns = {
  shortBrokerName: string;
};

export const useTitleScript = (): TitleReturns => {
  const { overwrite } = useReferralContext();

  return {
    shortBrokerName: overwrite?.shortBrokerName || "Orderly",
  };
};
