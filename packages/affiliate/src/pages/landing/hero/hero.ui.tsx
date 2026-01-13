import React, { FC } from "react";
import { Flex } from "@orderly.network/ui";
import { ProgressSectionWidget } from "../progressSection";
import type { HeroState } from "./hero.script";
import { HeroTitle } from "./heroTitle";
import { NetworkDiagram } from "./networkDiagram";

export type HeroProps = HeroState & {
  className?: string;
  style?: React.CSSProperties;
};

export const Hero: FC<HeroProps> = (props) => {
  const { currentVolume, targetVolume, onButtonClick } = props;

  return (
    <Flex
      gap={8}
      className="oui-flex-col-reverse md:oui-flex-row"
      id="oui-affiliate-landing-hero"
      itemAlign={"center"}
    >
      {/* Left side: Title and Progress */}
      <Flex direction="column" gap={6} className="oui-flex-1">
        <HeroTitle />
        <ProgressSectionWidget
          currentVolume={currentVolume}
          targetVolume={targetVolume}
          onButtonClick={onButtonClick}
        />
      </Flex>

      {/* Right side: Network Diagram */}
      <Flex
        justify="center"
        itemAlign="center"
        className="oui-h-[335px] oui-w-[335px] oui-p-6 md:oui-h-[480px] md:oui-w-[480px]"
      >
        <NetworkDiagram />
      </Flex>
    </Flex>
  );
};
