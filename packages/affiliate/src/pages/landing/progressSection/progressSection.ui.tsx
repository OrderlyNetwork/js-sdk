import React, { FC } from "react";
import { Flex, Text, Button } from "@orderly.network/ui";
import type { ProgressSectionState } from "./progressSection.script";

export type ProgressSectionProps = ProgressSectionState & {
  className?: string;
  style?: React.CSSProperties;
};

export const ProgressSection: FC<ProgressSectionProps> = (props) => {
  const {
    progressPercentage,
    currentVolume,
    isUnlocked,
    onButtonClick,
    targetVolume,
  } = props;

  return (
    <Flex
      direction="column"
      gap={3}
      itemAlign="start"
      className="oui-w-full"
      id="oui-affiliate-landing-progress-section"
    >
      {/* Progress bar labels */}
      <Flex justify="between" itemAlign="center" className="oui-w-full">
        <Text size="sm" weight="semibold">
          Current
        </Text>
        <Flex gap={1}>
          <Text.numeral rule="price" dp={0}>
            {currentVolume}
          </Text.numeral>
          <Text size="sm" weight="semibold" intensity="54">
            /
          </Text>

          <Text.numeral
            size="sm"
            rule="price"
            dp={0}
            weight="semibold"
            intensity="54"
          >
            {targetVolume}
          </Text.numeral>
          <Text size="sm" weight="semibold" intensity="54">
            USDC
          </Text>
        </Flex>
      </Flex>

      {/* Progress bar */}
      <div className="oui-relative oui-h-2 oui-w-full oui-overflow-hidden oui-rounded-full oui-bg-base-6">
        <div
          className="oui-absolute oui-left-0 oui-top-0 oui-h-full oui-bg-primary oui-transition-all oui-duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* CTA Button */}
      <Button
        color="primary"
        size="xl"
        disabled={isUnlocked}
        onClick={onButtonClick}
        className="oui-mt-2"
      >
        Trade to unlock referral system
      </Button>
    </Flex>
  );
};
