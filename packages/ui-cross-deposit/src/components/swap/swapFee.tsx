import { FC } from "react";
import { Box, Divider, Flex, modal, Text } from "@orderly.network/ui";
import { UseSwapFee } from "../../hooks/useSwapFee";
import { Decimal } from "@orderly.network/utils";
import { useTranslation } from "@orderly.network/i18n";

type SwapFeeProps = UseSwapFee;

export const SwapFee: FC<SwapFeeProps> = (props) => {
  const { feeQtys, feeAmount, feeDetails, nativeSymbol } = props;
  const { t } = useTranslation();

  const onShowFee = () => {
    const content = (
      <Box className="oui-text-2xs">
        {feeDetails?.map((item, index) => {
          const isEnd = index === feeDetails?.length - 1;
          return (
            <Box key={index}>
              <Flex gapX={1}>
                <Text intensity={54}>{item.title}:</Text>
                <Text.numeral
                  intensity={80}
                  dp={item.dp}
                  rm={Decimal.ROUND_UP}
                  padding={false}
                >
                  {item.value}
                </Text.numeral>
                <Text intensity={54}>{item.symbol}</Text>
              </Flex>

              <Box mt={2}>
                <Text intensity={36}>{item.description}</Text>
              </Box>

              {!isEnd && (
                <Box my={3}>
                  <Divider intensity={8} />
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    );

    modal.alert({
      title: "Fee",
      message: content,
    });
  };

  const renderFeeQty = () => {
    const len = feeQtys?.length;
    if (!len) return;

    const list = feeQtys.map((item, index) => {
      return (
        <Text intensity={54} key={index}>
          <Text.numeral dp={item.dp} padding={false} rm={Decimal.ROUND_UP}>
            {item.value}
          </Text.numeral>
          {` ${item.symbol || nativeSymbol}`}
        </Text>
      );
    });

    if (len === 1) {
      return <span>({list})</span>;
    }

    if (len === 2) {
      return (
        <span>
          ({list[0]} + {list[1]})
        </span>
      );
    }
  };

  return (
    <Text
      size="xs"
      intensity={36}
      className="oui-border-dashed oui-border-b oui-border-line-12 oui-cursor-pointer"
      onClick={onShowFee}
    >
      {`${t("common.fee")} ≈ `}
      <Text size="xs" intensity={80}>
        $
        <Text.numeral dp={2} padding={false} rm={Decimal.ROUND_UP}>
          {feeAmount}
        </Text.numeral>
        {` `}
      </Text>

      {renderFeeQty()}
    </Text>
  );
};
