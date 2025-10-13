import { useMemo } from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { OrderSide } from "@kodiak-finance/orderly-types";
import {
  Flex,
  Slider,
  textVariants,
  Text,
  convertValueToPercentage,
} from "@kodiak-finance/orderly-ui";

export const QuantitySlider = (props: {
  canTrade: boolean;
  side: OrderSide;
  order_quantity?: string;
  maxQty: number;
  tick: number;
  dp: number;
  setMaxQty: () => void;
  onValueChange: (value: number) => void;
}) => {
  const { canTrade, order_quantity, maxQty } = props;
  const { t } = useTranslation();

  const color = useMemo(
    () =>
      canTrade ? (props.side === OrderSide.BUY ? "buy" : "sell") : undefined,
    [props.side, canTrade],
  );

  const maxLabel = useMemo(() => {
    return props.side === OrderSide.BUY
      ? t("orderEntry.maxBuy")
      : t("orderEntry.maxSell");
  }, [props.side, t]);

  const sliderValue = useMemo(() => {
    if (!order_quantity) {
      return 0;
    }
    return Number(order_quantity);
  }, [order_quantity]);

  const quantityToPercentage = useMemo(() => {
    if (!order_quantity) {
      return 0;
    }
    if (Number(order_quantity) >= Number(maxQty)) {
      return 1;
    }
    return (
      convertValueToPercentage(Number(order_quantity ?? 0), 0, maxQty) / 100
    );
  }, [order_quantity, maxQty]);

  return (
    <div>
      <Slider.single
        disabled={maxQty === 0 || !canTrade}
        value={sliderValue}
        color={color}
        markCount={4}
        showTip
        max={maxQty}
        step={props.tick}
        onValueChange={props.onValueChange}
      />
      <Flex justify={"between"} className="oui-pt-1 xl:oui-pt-2">
        <Text.numeral
          rule={"percentages"}
          size={"2xs"}
          color={color}
          dp={2}
          padding={false}
        >
          {canTrade ? quantityToPercentage : 0}
        </Text.numeral>
        <Flex>
          <button
            className={textVariants({
              size: "2xs",
              className: "oui-mr-1",
            })}
            onClick={() => props.setMaxQty()}
            data-testid="oui-testid-orderEntry-maxQty-value-button"
          >
            {maxLabel}
          </button>
          <Text.numeral
            size={"2xs"}
            color={color}
            dp={props.dp}
            padding={false}
            data-testid="oui-testid-orderEntry-maxQty-value"
          >
            {canTrade ? maxQty : 0}
          </Text.numeral>
        </Flex>
      </Flex>
    </div>
  );
};
