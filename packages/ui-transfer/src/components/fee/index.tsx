import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, modal, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { type UseDepositFeeReturn } from "../depositForm/depositForm.script";

export const Fee: FC<Partial<UseDepositFeeReturn>> = (props) => {
  const { dstGasFee, feeQty, feeAmount, dp, nativeSymbol } = props;
  const { t } = useTranslation();

  const onShowFee = () => {
    const content = (
      <div className="oui-text-2xs">
        <Flex gapX={1}>
          <Text size="2xs" intensity={54}>
            {`${t("transfer.deposit.destinationGasFee")}: `}
          </Text>
          <Text.numeral
            intensity={80}
            dp={dp}
            rm={Decimal.ROUND_UP}
            padding={false}
          >
            {feeQty!}
          </Text.numeral>
          <Text intensity={54}>{nativeSymbol}</Text>
        </Flex>
        <Box mt={2}>
          <Text intensity={36}>
            {t("transfer.deposit.destinationGasFee.description")}
          </Text>
        </Box>
      </div>
    );

    modal.alert({
      title: t("common.fee"),
      message: content,
    });
  };

  const showFeeQty = !!dstGasFee && dstGasFee !== "0";

  return (
    <Text
      size="2xs"
      intensity={36}
      className="oui-border-dashed oui-border-b oui-border-line-12 oui-cursor-pointer"
      onClick={onShowFee}
    >
      {`${t("transfer.deposit.estGasFee")} ≈ `}
      <Text size="2xs" intensity={80}>
        $
        <Text.numeral dp={2} padding={false} rm={Decimal.ROUND_UP}>
          {feeAmount!}
        </Text.numeral>{" "}
      </Text>
      {showFeeQty && (
        <span>
          (
          <Text intensity={54}>
            <Text.numeral dp={dp} padding={false} rm={Decimal.ROUND_UP}>
              {feeQty!}
            </Text.numeral>
            {nativeSymbol}
          </Text>
          )
        </span>
      )}
    </Text>
  );
};
