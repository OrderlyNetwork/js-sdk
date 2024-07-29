import { FC, ReactNode } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { API } from "@orderly.network/types";

type CoinExchangeProps = {
  className?: string;
  token?: API.TokenInfo;
  dstSymbol?: string;
  price?: number;
  trailing?: ReactNode;
};

export const CoinExchange: FC<CoinExchangeProps> = (props) => {
  const { token, dstSymbol, price, trailing } = props;

  const from = token?.display_name || token?.display_name || "USDC";

  return (
    <Flex justify="between">
      <Text size="xs" intensity={36} className={props.className}>
        <Text size="xs" intensity={80}>
          1
        </Text>
        {` ${from} = `}

        <Text.numeral size="xs" intensity={80} dp={3} padding={false}>
          {price!}
        </Text.numeral>

        {` ${dstSymbol}`}
      </Text>
      {trailing}
    </Flex>
  );
};
