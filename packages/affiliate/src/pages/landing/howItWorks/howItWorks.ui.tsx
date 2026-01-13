import { FC } from "react";
import { Flex, Text, Grid, Box } from "@orderly.network/ui";
import type { HowItWorksState } from "./howItWorks.script";
import { StepCard } from "./stepCard";

export const HowItWorks: FC<HowItWorksState> = (props) => {
  const { steps } = props;

  return (
    <Box id="oui-affiliate-landing-how-it-works">
      {/* Title and subtitle */}
      <Flex direction="column" itemAlign="start">
        <Text weight="semibold" className="oui-text-[32px]">
          How it works
        </Text>
        <Box py={4}>
          <Text intensity="54">
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
