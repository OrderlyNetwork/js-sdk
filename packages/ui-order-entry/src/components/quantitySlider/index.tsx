import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { OrderSide } from "@orderly.network/types";
import { Flex, Slider, textVariants, Text } from "@orderly.network/ui";

export const QuantitySlider = (props: {
  canTrade: boolean;
  side: OrderSide;
  value: number;
  maxQty: number;
  currentQtyPercentage: number;
  tick: number;
  dp: number;
  setMaxQty: () => void;
  onValueChange: (value: number) => void;
}) => {
  const { canTrade } = props;
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

  return (
    <div>
      <Slider.single
        disabled={props.maxQty === 0 || !canTrade}
        value={props.value}
        color={color}
        markCount={4}
        showTip
        max={props.maxQty}
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
          {canTrade ? props.currentQtyPercentage : 0}
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
            {canTrade ? props.maxQty : 0}
          </Text.numeral>
        </Flex>
      </Flex>
    </div>
  );
};
