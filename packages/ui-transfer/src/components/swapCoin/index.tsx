import { FC } from "react";
// import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import { Flex, Text } from "@orderly.network/ui";

type SwapCoinProps = {
  className?: string;
  sourceToken?: API.TokenInfo;
  targetToken?: API.TokenInfo;
  price?: number;
};

export const SwapCoin: FC<SwapCoinProps> = (props) => {
  const { sourceToken, targetToken, price } = props;

  // const { t } = useTranslation();

  const sourceSymbol = sourceToken?.display_name || sourceToken?.symbol;

  const targetSymbol = targetToken?.display_name || targetToken?.symbol;

  return (
    <Flex width={"100%"} itemAlign="center" justify="between">
      <Text size="xs" intensity={36}>
        Convert rate
      </Text>
      <Text size="xs" intensity={36} className={props.className}>
        <Text size="xs" intensity={80}>
          1
        </Text>
        {` ${sourceSymbol} = `}
        <Text.numeral size="xs" intensity={80} dp={3} padding={false}>
          {price || 1}
        </Text.numeral>
        {targetSymbol}
      </Text>
    </Flex>
  );
};
