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

export const LeverageSlider = (props: {
  maxLeverage?: number;
  value: number;
  onLeverageChange: (value: number) => void;
  setShowSliderTip: (value: boolean) => void;
  showSliderTip: boolean;
  className?: string;
  onValueCommit?: (value: number[]) => void;
}) => {
  return (
    <Box pt={3} width={"100%"} className={props.className}>
      <Slider
        // step={1.04}
        max={props.maxLeverage}
        // min={1}
        // markLabelVisible={true}
        // marks={props.marks}
        markCount={5}
        value={[props.value]}
        onValueChange={(e) => {
          props.onLeverageChange(e[0]);
          props.setShowSliderTip(true);
        }}
        color="primary"
        onValueCommit={(e) => {
          props.onValueCommit?.(e);
          props.setShowSliderTip(false);
        }}
        showTip={props.showSliderTip}
        tipFormatter={(value, min, max, percent) => {
          return `${Math.max(1,value)}x`;
        }}
      />
      <Flex justify={"between"} width={"100%"} pt={3}>
        {[1, 10, 20, 30, 40, 50].map((item, index) => {
          return (
            <button
              onClick={(e) => {
                props.onLeverageChange(item);
                props.onValueCommit?.([item]);
              }}
              className={cn(
                " oui-text-2xs oui-pb-3",
                index === 0
                  ? "oui-pr-2"
                  : index === 5
                  ? "oui-pl-0"
                  : "oui-px-0 oui-ml-2",
                  props.value >= item && "oui-text-primary-light"
              )}
              data-testid={`oui-testid-leverage-${item}-btn`}
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
