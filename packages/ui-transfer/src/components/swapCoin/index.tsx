import { FC } from "react";
// import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import { Flex, Text } from "@orderly.network/ui";
import { DST } from "../../types";

type SwapCoinProps = {
  className?: string;
  token?: API.TokenInfo;
  dst?: DST;
  price?: number;
};

export const SwapCoin: FC<SwapCoinProps> = (props) => {
  const { token, dst, price } = props;

  // const { t } = useTranslation();

  const srcSymbol = token?.display_name || token?.symbol || "USDC";

  return (
    <Flex width={"100%"} itemAlign="center" justify="between">
      <Text size="xs" intensity={36}>
        Convert rate
      </Text>
      <Text size="xs" intensity={36} className={props.className}>
        <Text size="xs" intensity={80}>
          1
        </Text>
        {` ${srcSymbol} = `}
        {price ? (
          <Text.numeral size="xs" intensity={80} dp={3} padding={false}>
            {price}
          </Text.numeral>
        ) : (
          "-"
        )}
        {` ${dst?.symbol}`}
      </Text>
    </Flex>
  );
};
