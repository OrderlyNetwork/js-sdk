import { FC, useMemo } from "react";
import { useIndexPricesStream, useWithdraw } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import {
  Flex,
  Spinner,
  Text,
  Tooltip,
  modal,
  useScreen,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

export type AvailableQuantityProps = {
  token?: Partial<API.TokenInfo>;
  amount?: number | string;
  maxQuantity?: number | string;
  onClick?: () => void;
  loading?: boolean;
  tooltipContent?: React.ReactNode;
};

type AvailableTooltipMessageProps = {
  tokenSymbol?: string;
  decimals?: number;
};

const AvailableTooltipMessage: FC<AvailableTooltipMessageProps> = ({
  tokenSymbol,
  decimals,
}) => {
  const { t } = useTranslation();
  const { maxAmount } = useWithdraw({
    token: tokenSymbol,
    decimals,
  });

  const amountText = useMemo(() => {
    if (maxAmount === undefined || maxAmount === null) return "--";
    return maxAmount.toString();
  }, [maxAmount]);

  return (
    <Text size="2xs" intensity={80}>
      {t("transfer.withdraw.available.tooltip", { amount: amountText })}
    </Text>
  );
};

export const AvailableQuantity: FC<AvailableQuantityProps> = (props) => {
  const { amount, maxQuantity, token, loading } = props;
  const { t } = useTranslation();
  const { isMobile } = useScreen();

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
          {props.tooltipContent ? (
            isMobile ? (
              <button
                type="button"
                className="oui-p-0"
                onClick={() => {
                  if (token?.symbol) {
                    const anyToken = token as any;
                    modal.alert({
                      title: t("common.tips"),
                      message: (
                        <AvailableTooltipMessage
                          tokenSymbol={token.symbol}
                          decimals={
                            anyToken?.token_decimal ??
                            token.decimals ??
                            token.precision
                          }
                        />
                      ),
                    });
                  } else {
                    modal.alert({
                      title: t("common.tips"),
                      message: props.tooltipContent,
                    });
                  }
                }}
              >
                <Text
                  size="2xs"
                  intensity={36}
                  className="oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12"
                >
                  {`${t("common.available")}: `}
                </Text>
              </button>
            ) : (
              <Tooltip
                content={props.tooltipContent}
                className="oui-max-w-[274px]"
              >
                <Text
                  size="2xs"
                  intensity={36}
                  className="oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12"
                >
                  {`${t("common.available")}: `}
                </Text>
              </Tooltip>
            )
          ) : (
            <Text size="2xs" intensity={36}>
              {`${t("common.available")}: `}
            </Text>
          )}

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
