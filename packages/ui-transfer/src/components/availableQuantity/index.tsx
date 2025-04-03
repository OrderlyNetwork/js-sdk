import { FC } from "react";
import { Flex, Spinner, Text } from "@orderly.network/ui";
import { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { useTranslation } from "@orderly.network/i18n";

export type AvailableQuantityProps = {
  token?: API.TokenInfo;
  amount: number;
  maxQuantity?: string;
  onClick?: () => void;
  loading?: boolean;
};

export const AvailableQuantity: FC<AvailableQuantityProps> = (props) => {
  const { amount, maxQuantity, token, loading } = props;
  const { t } = useTranslation();

  const name = token?.display_name || token?.symbol || "";
  const dp = token?.precision ?? 2;

  return (
    <Flex justify="between" px={2}>
      <Text size="2xs" intensity={36}>
        $
        <Text.numeral dp={2} padding={false} rm={Decimal.ROUND_DOWN}>
          {amount}
        </Text.numeral>
      </Text>

      <Flex gapX={2}>
        <Text size="2xs" intensity={36}>
          {`${t("common.available")}: `}
          <Text.numeral
            rm={Decimal.ROUND_DOWN}
            dp={dp}
            padding={false}
            data-testid="oui-testid-withdraw_deposit-dialog-available-value"
          >
            {maxQuantity!}
          </Text.numeral>
          {` ${name}`}
        </Text>
        {loading && <Spinner size="sm" />}

        <Text
          size="2xs"
          color="primary"
          className="oui-cursor-pointer oui-select-none"
          onClick={props.onClick}
        >
          {t("common.max")}
        </Text>
      </Flex>
    </Flex>
  );
};
