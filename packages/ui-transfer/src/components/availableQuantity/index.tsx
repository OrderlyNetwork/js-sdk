import { FC } from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { API } from "@kodiak-finance/orderly-types";
import { Flex, Spinner, Text } from "@kodiak-finance/orderly-ui";
import { Decimal } from "@kodiak-finance/orderly-utils";

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

  const name = token?.display_name || token?.symbol || "";
  const dp = token?.precision ?? token?.decimals ?? 2;

  return (
    <Flex px={2}>
      {amount !== undefined && (
        <Text size="2xs" intensity={36}>
          $
          <Text.numeral dp={2} padding={false} rm={Decimal.ROUND_DOWN}>
            {amount}
          </Text.numeral>
        </Text>
      )}

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
