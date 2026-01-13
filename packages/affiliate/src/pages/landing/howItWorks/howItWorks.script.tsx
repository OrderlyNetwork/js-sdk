import { useMemo } from "react";
import type { IconType } from "./stepCard";

type StepData = {
  step: number;
  icon: IconType;
  title: string;
  description: string;
};

export const useHowItWorksScript = () => {
  // Define the three steps
  const stepsData = useMemo<StepData[]>(() => {
    return [
      {
        step: 1,
        icon: "wallet" as IconType,
        title: "Connect wallet",
        description: "Set up your account by connecting your Web3 wallet.",
      },
      {
        step: 2,
        icon: "settings" as IconType,
        title: "Configure your strategy",
        description:
          "Configure the commission split: secure your profit margin while allocating competitive incentives to empower your sub-affiliates.",
      },
      {
        step: 3,
        icon: "rocket" as IconType,
        title: "Share & earn",
        description:
          "Copy your link to invite partners and traders. Earn passive commissions from trades made throughout your entire referral network.",
      },
    ];
  }, []);

  return {
    steps: stepsData,
  };
};

export type HowItWorksState = ReturnType<typeof useHowItWorksScript>;
