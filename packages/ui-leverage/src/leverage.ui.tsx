import {
  Box,
  CloseIcon,
  Button,
  Flex,
  Slider,
  Text,
  cn,
} from "@orderly.network/ui";
import { LeverageScriptReturns } from "./leverage.script";

export const Leverage = (props: LeverageScriptReturns) => {
  const { currentLeverage = 0 } = props;
  return (
    <Flex itemAlign={"start"} direction={"column"} mb={0}>
      <Flex justify={"between"} width={"100%"}>
        <Text as="div" size={"sm"} intensity={54} className="oui-mt-2">
          Max account leverage
        </Text>
        <Flex direction={"row"} gap={1}>
          <Text size={"sm"} intensity={54}>
            Current:
          </Text>
          <Text.numeral unit="x" size={"sm"} intensity={80}>
            {currentLeverage ?? "--"}
          </Text.numeral>
        </Flex>
      </Flex>

      <LeverageSlider {...props} />
      <Flex direction={"row"} gap={2} width={"100%"} mt={0} pt={5}>
        <Button
          variant="contained"
          color="gray"
          fullWidth
          onClick={props.onCancel}
          data-testid="oui-testid-leverage-cancel-btn"
        >
          Cancel
        </Button>
        <Button
          fullWidth
          loading={props.isLoading}
          onClick={props.onSave}
          data-testid="oui-testid-leverage-save-btn"
        >
          Save
        </Button>
      </Flex>
    </Flex>
  );
};

const LeverageSlider = (props: LeverageScriptReturns) => {
  return (
    <Box pt={3} width={"100%"}>
      <Slider
        step={1}
        max={props.maxLeverage}
        min={1}
        // markLabelVisible={true}
        // marks={props.marks}
        markCount={5}
        value={[props.value]}
        onValueChange={(e) => {
          props.onLeverageChange(e[0]);
          props.setShowSliderTip(true);
        }}
        color="primaryLight"
        onValueCommit={(e) => {
          props.setShowSliderTip(false);
        }}
        showTip={props.showSliderTip}
        tipFormatter={(value, min, max, percent) => {
          return `${value}x`;
        }}
      />
      <Flex justify={"between"} width={"100%"} pt={3}>
        {[1, 10, 20, 30, 40, 50].map((item, index) => {
          return (
            <button
              onClick={(e) => {
                props.onLeverageChange(item);
              }}
              className={cn(
                " oui-text-2xs oui-pb-3",
                index === 0
                  ? "oui-pr-2"
                  : index === 5
                  ? "oui-pl-2"
                  : "oui-px-2 oui-ml-2",
                item - 1 >= 0 && "oui-text-primary-light"
              )}
            >
              {`${item}x`}
            </button>
          );
        })}
      </Flex>
    </Box>
  );
  // return (
  //   <Box pt={3} width={"100%"}>
  //     <Slider
  //       step={props.step}
  //       markLabelVisible={true}
  //       marks={props.marks}
  //       value={[props.value]}
  //       onValueChange={(e) => {
  //         const value = props.marks?.[e[0] / 10]?.value;
  //         if (typeof value !== "undefined") props.onLeverageChange(value);
  //       }}
  //     />
  //   </Box>
  // );
};
