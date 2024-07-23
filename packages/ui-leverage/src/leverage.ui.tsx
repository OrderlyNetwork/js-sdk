import { Box, CloseIcon, Flex, Slider, Text } from "@orderly.network/ui";
import { LeverageScriptReturns } from "./useBuilder.script";

export const Leverage = (props: LeverageScriptReturns) => {
  const { currentLeverage = 0 } = props;
  return (
    <Flex itemAlign={"start"} direction={"column"} mb={4}>
      <Flex justify={"between"} width={"100%"}>
        <Text size={"xs"} intensity={54}>
          Current leverage
        </Text>
        <Text.numeral unit="x" size={"xs"} intensity={80}>
          {currentLeverage}
        </Text.numeral>
      </Flex>

      <Text as="div" size={"xs"} intensity={54} className="oui-mt-2">
        Max account leverage
      </Text>
      <LeverageSlider {...props} />
    </Flex>
  );
};

const LeverageSlider = (props: LeverageScriptReturns) => {
  return (
    <Box pt={3} width={"100%"}>
      <Slider
        initialValue={[props.initialValue || 0]}
        step={100 / ((props.marks?.length || 0) - 1)}
        markLabelVisible={true}
        marks={props.marks}
        onValueChange={(e) => {
          const value = props.marks?.[e[0] / 10]?.value;
          if (typeof value !== "undefined") props.onLeverageChange(value);
        }}
      />
    </Box>
  );
};
