import React from "react";
import { Flex, Text } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";
import { useFeesScript } from "./fees.script";

export const FeesUI: React.FC<ReturnType<typeof useFeesScript>> = (props) => {
  return (
    <Flex justify={"between"}>
      <Text size="2xs">Fees</Text>
      <AuthGuard
        fallback={() => <Text size="2xs">Taker: --% / Maker: --%</Text>}
      >
        <Flex gap={1}>
          <Text size="2xs">Taker:</Text>
          <Text size="2xs" className="oui-text-base-contrast-80">
            {props.taker}%
          </Text>
          <Text size="2xs">/</Text>
          <Text size="2xs">Maker</Text>
          <Text size="2xs" className="oui-text-base-contrast-80">
            {props.maker}%
          </Text>
        </Flex>
      </AuthGuard>
    </Flex>
  );
};
