import React, { FC, ReactNode } from "react";
import { Flex, Text } from "@orderly.network/ui";

type CoinExchangeProps = {
  className?: string;
  from?: string;
  to?: string;
  trailing?: ReactNode;
};

export const CoinExchange: FC<CoinExchangeProps> = (props) => {
  return (
    <Flex justify="between">
      <Text size="xs" intensity={36} className={props.className}>
        <Text size="xs" intensity={80}>
          {`1 `}
        </Text>
        USDC =
        <Text size="xs" intensity={80}>
          {` 1 `}
        </Text>
        USDC
      </Text>
      {props.trailing}
    </Flex>
  );
};
