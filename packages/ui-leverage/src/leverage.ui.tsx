import { Box, Flex, Slider, Text } from "@orderly.network/ui";

export const Leverage = (props: {
  currentLeverage: number;
  onLeverageChange?: (value: number) => void;
}) => {
  const { currentLeverage = 0 } = props;
  return (
    <div>
      <Flex pb={2}>
        <Text size={"2xs"} intensity={54} as="div" className="oui-grow">
          Current leverage
        </Text>

        <Text.numeral unit="x" size={"2xs"} intensity={80}>
          {currentLeverage}
        </Text.numeral>
      </Flex>
      <Text as="div" size={"2xs"} intensity={54}>
        Max account leverage
      </Text>
      <Box>
        <LeverageSlider />
      </Box>
    </div>
  );
};

const LeverageSlider = () => {
  return (
    <Box pt={3}>
      <Slider />
    </Box>
  );
};
