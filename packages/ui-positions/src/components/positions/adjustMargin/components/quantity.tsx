import { FC, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Flex, Input, Slider, Text, inputFormatter } from "@orderly.network/ui";

export interface QuantityProps {
  inputValue: string;
  sliderValue: number;
  maxAmount: number;
  onInputChange: (value: string) => void;
  onSliderChange: (value: number) => void;
}

export const Quantity: FC<QuantityProps> = ({
  inputValue,
  sliderValue,
  maxAmount,
  onInputChange,
  onSliderChange,
}) => {
  const { t } = useTranslation();

  const percentMarks = useMemo(
    () => [0, 25, 50, 75, 100].map((m) => ({ value: m, label: `${m}%` })),
    [],
  );

  return (
    <Flex direction="column" gap={3} className="oui-w-full">
      <Input
        value={inputValue}
        onValueChange={onInputChange}
        type="text"
        fullWidth
        size="lg"
        align="right"
        prefix={t("positions.adjustMargin.quantity")}
        suffix="USDC"
        formatters={[
          inputFormatter.numberFormatter,
          inputFormatter.dpFormatter(2),
        ]}
        disabled={maxAmount === null || maxAmount <= 0}
        autoComplete="off"
        classNames={{
          // Keep border color stable and remove focus ring (Input has focus-within:outline-primary-light by default)
          root: "oui-rounded-[6px] oui-bg-base-6 oui-border oui-border-solid oui-border-white/[0.12] oui-outline oui-outline-1 oui-outline-offset-0 oui-outline-transparent focus-within:oui-outline-transparent",
          // keep value aligned to suffix side and match design emphasis
          input: "oui-text-sm oui-font-semibold oui-text-base-contrast-98",
          // override default additional padding so value can sit closer to suffix
          additional: "oui-px-0",
          prefix: "oui-pl-3 oui-pr-2 oui-text-sm oui-text-base-contrast-54",
          suffix: "oui-pl-2 oui-pr-3 oui-text-sm oui-text-base-contrast-54",
        }}
      />

      <Flex direction="column" gap={2} className="oui-w-full">
        <Slider
          value={[sliderValue]}
          onValueChange={(val) => onSliderChange(val[0])}
          max={100}
          min={0}
          step={1}
          color="primary"
          showTip
          tipFormatter={(v, _min, _max, percent) => `${percent.toFixed(0)}%`}
          marks={percentMarks}
          markLabelVisible={false}
          disabled={maxAmount === null || maxAmount <= 0}
        />
        <Flex justify="between" className="oui-w-full">
          <Text size="2xs" className="oui-text-primary">
            {`${sliderValue.toFixed(0)}%`}
          </Text>
          <Flex gap={1} itemAlign="baseline">
            <Text size="2xs" className="oui-text-primary">
              {t("positions.adjustMargin.max")}
            </Text>
            <Text.numeral size="2xs" intensity={54} dp={2}>
              {maxAmount}
            </Text.numeral>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
};
