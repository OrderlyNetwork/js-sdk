import { useMemo } from "react";
import { Flex, Text, Grid, Box } from "@orderly.network/ui";
import { IconType, StepCard } from "./stepCard";

type StepData = {
  step: number;
  icon: IconType;
  title: string;
  description: string;
};

export const HowItWorks = () => {
  const steps = useMemo<StepData[]>(() => {
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

  return (
    <Box id="oui-affiliate-landing-how-it-works">
      {/* Title and subtitle */}
      <Flex direction="column" itemAlign="start">
        <Text weight="semibold" className="oui-text-[32px]">
          How it works
        </Text>
        <Box py={4}>
          <Text intensity={54}>
            Start your affiliate journey and build your revenue network in 3
            simple steps.
          </Text>
        </Box>
      </Flex>

      {/* Step cards */}
      <Grid className="oui-grid-cols-1 md:oui-grid-cols-3" gap={6}>
        {steps.map((step) => (
          <StepCard
            key={step.step}
            step={step.step}
            icon={step.icon}
            title={step.title}
            description={step.description}
          />
        ))}
      </Grid>
    </Box>
  );
};
