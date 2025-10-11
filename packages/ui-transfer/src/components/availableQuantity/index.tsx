import { FC, useMemo } from "react";
import { useIndexPricesStream } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import { Flex, Spinner, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

export type AvailableQuantityProps = {
  token?: Partial<API.TokenInfo>;
  amount?: number | string;
  maxQuantity?: number | string;
  onClick?: () => void;
  loading?: boolean;
};

export const AvailableQuantity: FC<AvailableQuantityProps> = (props) => {
  const { amount, maxQuantity, token, loading } = props;
  const { t } = useTranslation();

  const { getIndexPrice } = useIndexPricesStream();

  const name = token?.display_name || token?.symbol || "";
  const dp = token?.precision ?? token?.decimals ?? 2;

  const notional = useMemo(() => {
    if (amount && token?.symbol && getIndexPrice(token?.symbol)) {
      return new Decimal(amount)
        .mul(getIndexPrice(token?.symbol) || 1)
        .toNumber();
    }
    return 0;
  }, [amount, token?.symbol]);

  return (
    <Flex px={2}>
      <Text size="2xs" intensity={36}>
        $
        <Text.numeral dp={2} padding={false} rm={Decimal.ROUND_DOWN}>
          {notional}
        </Text.numeral>
      </Text>

      <Flex gapX={2} itemAlign="center" className="oui-ml-auto">
        <Flex gapX={1} itemAlign="center">
          <Text size="2xs" intensity={36}>
            {`${t("common.available")}: `}
          </Text>

          {loading ? (
            <Spinner size="sm" />
          ) : (
            <Text.numeral
              size="2xs"
              intensity={36}
              rm={Decimal.ROUND_DOWN}
              dp={dp}
              padding={false}
              data-testid="oui-testid-withdraw_deposit-dialog-available-value"
            >
              {maxQuantity!}
            </Text.numeral>
          )}

          <Text size="2xs" intensity={36}>
            {` ${name}`}
          </Text>
        </Flex>

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
