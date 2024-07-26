import { FC, ReactNode } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";

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

  const _price = new Decimal(price || 0).toDecimalPlaces(3).toString();

  return (
    <Flex justify="between">
      <Text size="xs" intensity={36} className={props.className}>
        <Text size="xs" intensity={80}>
          1
        </Text>
        {` ${from} = `}

        <Text size="xs" intensity={80}>
          {_price!}
        </Text>

        {` ${dstSymbol}`}
      </Text>
      {trailing}
    </Flex>
  );
};
