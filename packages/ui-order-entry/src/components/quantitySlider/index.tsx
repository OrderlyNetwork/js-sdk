import { memo, useEffect, useMemo, useState } from "react";
import { utils } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { OrderSide } from "@orderly.network/types";
import { Flex, Slider, textVariants, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { InputType } from "../../types";
import { useOrderEntryContext } from "../orderEntryContext";

type QuantitySliderProps = {
  canTrade: boolean;
  side: OrderSide;
  order_quantity?: string;
  maxQty: number;
};
const SLIDER_MIN = 0;
const SLIDER_MAX = 100;

export const QuantitySlider = memo((props: QuantitySliderProps) => {
  const { canTrade, side, order_quantity, maxQty } = props;

  const [sliderValue, setSliderValue] = useState<number>(0);

  const { setOrderValue, symbolInfo, lastQuantityInputType } =
    useOrderEntryContext();

  const { base_dp, base_tick } = symbolInfo;

  const { t } = useTranslation();

  const color = useMemo(
    () => (canTrade ? (side === OrderSide.BUY ? "buy" : "sell") : undefined),
    [side, canTrade],
  );

  const maxLabel = useMemo(() => {
    return side === OrderSide.BUY
      ? t("orderEntry.maxBuy")
      : t("orderEntry.maxSell");
  }, [side, t]);

  const onSliderValueChange = (value: number) => {
    lastQuantityInputType.current = InputType.QUANTITY_SLIDER;
    setSliderValue(value);
  };

  const sliderToQuantity = (value: number) => {
    const newQty = new Decimal(value)
      .div(SLIDER_MAX)
      .mul(maxQty)
      .toFixed(base_dp, Decimal.ROUND_DOWN);
    setOrderValue("order_quantity", utils.formatNumber(newQty, base_tick));
  };

  const onMax = () => {
    onSliderValueChange(SLIDER_MAX);
    // when previous slider value is max, quantity will not update by useEffect, so must set quantity manually to maxQty
    if (sliderValue === SLIDER_MAX) {
      sliderToQuantity(SLIDER_MAX);
    }
  };

  // update quantity when slider value and maxQty changes
  useEffect(() => {
    if (lastQuantityInputType.current === InputType.QUANTITY_SLIDER) {
      sliderToQuantity(sliderValue);
    }
  }, [sliderValue, maxQty]);

  useEffect(() => {
    const quantityToSlider = () => {
      if (order_quantity && Number(order_quantity) !== 0 && maxQty !== 0) {
        return new Decimal(Math.min(Number(order_quantity), maxQty))
          .div(maxQty)
          .mul(SLIDER_MAX)
          .todp(2, Decimal.ROUND_DOWN)
          .toNumber();
      }
      return 0;
    };

    // update slider value when last quantity input type is not quantity slider
    if (lastQuantityInputType.current !== InputType.QUANTITY_SLIDER) {
      setSliderValue(quantityToSlider());
    }
  }, [order_quantity, maxQty]);

  return (
    <div>
      <Slider
        disabled={maxQty === 0 || !canTrade}
        value={[sliderValue]}
        color={color}
        markCount={4}
        showTip
        onValueChange={(e) => {
          onSliderValueChange(e[0]);
        }}
        min={SLIDER_MIN}
        max={SLIDER_MAX}
      />
      <Flex justify={"between"} className="oui-pt-1 xl:oui-pt-2">
        <Text.numeral
          size={"2xs"}
          color={color}
          dp={2}
          padding={false}
          suffix="%"
        >
          {canTrade ? sliderValue : 0}
        </Text.numeral>
        <Flex>
          <button
            className={textVariants({
              size: "2xs",
              className: "oui-mr-1",
            })}
            onClick={onMax}
            data-testid="oui-testid-orderEntry-maxQty-value-button"
          >
            {maxLabel}
          </button>
          <Text.numeral
            size={"2xs"}
            color={color}
            dp={base_dp}
            padding={false}
            data-testid="oui-testid-orderEntry-maxQty-value"
          >
            {canTrade ? maxQty : 0}
          </Text.numeral>
        </Flex>
      </Flex>
    </div>
  );
});

QuantitySlider.displayName = "QuantitySlider";
