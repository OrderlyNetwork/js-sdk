import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { Flex, Slider, Text } from "@kodiak-finance/orderly-ui";

type QuantitySliderProps = {
  value: number;
  onValueChange: (value: number) => void;
  base_dp: number;
  max: number;
  onMax: () => void;
};

export const QuantitySlider = (props: QuantitySliderProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Slider
        showTip
        markCount={4}
        value={[props.value]}
        color="primary"
        onValueChange={(value) => {
          props.onValueChange(value[0]);
        }}
      />
      <Flex width={"100%"} justify={"between"}>
        <Text color="primary" size="2xs">{`${props.value}%`}</Text>
        <Flex gap={1} onClick={props.onMax} className="oui-cursor-pointer">
          <Text size="2xs" color="primary">
            {t("common.max")}
          </Text>
          <Text.numeral
            intensity={54}
            size="2xs"
            dp={props.base_dp}
            padding={false}
          >
            {props.max}
          </Text.numeral>
        </Flex>
      </Flex>
    </>
  );
};
