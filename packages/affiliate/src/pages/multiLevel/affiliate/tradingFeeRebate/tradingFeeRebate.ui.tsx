import { useTranslation } from "@orderly.network/i18n";
import { Button, Flex, Input, Text, cn } from "@orderly.network/ui";
import type { TradingFeeRebateReturns } from "./tradingFeeRebate.script";
import type { TradingFeeRebateWidgetProps } from "./tradingFeeRebate.widget";

export type TradingFeeRebateProps = TradingFeeRebateReturns &
  TradingFeeRebateWidgetProps;

export const TradingFeeRebate = (props: TradingFeeRebateProps) => {
  const { t } = useTranslation();

  return (
    <Flex
      direction="column"
      itemAlign="start"
      className="oui-affiliate-tradingFeeRebate oui-font-semibold"
    >
      <Flex
        direction="column"
        itemAlign="start"
        gap={6}
        width="100%"
        className="oui-py-5"
      >
        <Text
          size="2xs"
          intensity={54}
          className="oui-w-full oui-leading-[18px]"
        >
          {t("affiliate.tradingFeeRebate.description")}
        </Text>

        <Flex direction="column" itemAlign="start" gap={1} width="100%">
          <Text
            as="label"
            htmlFor="oui-trading-fee-rebate-rate"
            size="2xs"
            intensity={54}
            className="oui-leading-[18px]"
          >
            {t("affiliate.tradingFeeRebate.rate")}
          </Text>
          <Input
            id="oui-trading-fee-rebate-rate"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            fullWidth
            size="lg"
            value={props.percentage}
            onChange={(event) => props.onChange(event.target.value)}
            color={props.showError ? "danger" : undefined}
            className="oui-border oui-border-line"
            suffix={
              <Text intensity={54} className="oui-pe-3">
                %
              </Text>
            }
          />
          <Flex width="100%" itemAlign="center" gap={1} className="oui-pl-1">
            <span
              aria-hidden="true"
              className={cn(
                "oui-size-1 oui-shrink-0 oui-rounded-full",
                props.showError ? "oui-bg-danger" : "oui-bg-base-contrast-54",
              )}
            />
            <Text
              size="2xs"
              intensity={54}
              className={cn(
                "oui-leading-[18px]",
                props.showError && "oui-text-danger",
              )}
            >
              {t("affiliate.tradingFeeRebate.maximumAllowed", {
                rate: props.maxPercentage,
              })}
            </Text>
          </Flex>
        </Flex>
      </Flex>

      <Flex width="100%" gap={3} className="oui-pb-5 oui-pt-3">
        <Button
          size="md"
          color="gray"
          fullWidth
          className="oui-rounded-md"
          onClick={props.close}
        >
          {t("common.cancel")}
        </Button>
        <Button
          size="md"
          fullWidth
          className="oui-rounded-md"
          disabled={props.buttonDisabled}
          loading={props.confirmButtonLoading}
          onClick={props.onSave}
        >
          {t("common.save")}
        </Button>
      </Flex>
    </Flex>
  );
};
