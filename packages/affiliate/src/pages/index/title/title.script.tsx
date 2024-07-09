import { useReferralContext } from "../../../hooks";

export type TitleReturns = {
  gradientTitle: string;
};

export const useTitleScript = (): TitleReturns => {
  const { overwrite } = useReferralContext();

  return {
    gradientTitle: overwrite?.ref?.gradientTitle || "Orderly",
  };
};
