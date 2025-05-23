import React, { FC, useId, useCallback } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  Button,
  Flex,
  Input,
  Slider,
  Text,
  cn,
  PlusIcon,
  ReduceIcon,
  inputFormatter,
  InputFormatter,
} from "@orderly.network/ui";
import { LeverageScriptReturns } from "./leverage.script";

const IconButton: React.FC<{
  Icon: React.ComponentType<any>;
  onClick: React.MouseEventHandler<SVGSVGElement>;
  disabled: boolean;
}> = (props) => {
  const { Icon, onClick, disabled } = props;
  return (
    <Icon
      onClick={disabled ? undefined : onClick}
      className={cn(
        "oui-text-white oui-m-2 oui-transition-all",
        disabled
          ? "oui-cursor-not-allowed oui-opacity-20"
          : "oui-cursor-pointer oui-opacity-100",
      )}
    />
  );
};

const LeverageInput: React.FC<LeverageProps> = (props) => {
  const formatters = React.useMemo<InputFormatter[]>(
    () => [
      inputFormatter.numberFormatter,
      inputFormatter.currencyFormatter,
      inputFormatter.decimalPointFormatter,
    ],
    [],
  );
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "oui-w-full",
        "oui-rounded",
        "oui-bg-base-6",
        "oui-flex",
        "oui-items-center",
        "oui-justify-between",
        "oui-outline",
        "oui-outline-offset-0",
        "oui-outline-1",
        "oui-outline-transparent",
        "focus-within:oui-outline-primary-light",
        "oui-input-root",
      )}
    >
      <IconButton
        Icon={ReduceIcon}
        onClick={props.onLeverageReduce}
        disabled={props.isReduceDisabled}
      />
      <Flex itemAlign="center" justify="center">
        <Input
          // {...props}
          value={props.value}
          id={id}
          autoComplete="off"
          classNames={{
            input: cn("oui-text-center"),
            root: cn(
              "oui-text-center",
              "oui-w-6",
              "oui-px-0",
              "oui-outline",
              "oui-outline-offset-0",
              "oui-outline-1",
              "oui-outline-transparent",
              "focus-within:oui-outline-primary-none",
            ),
          }}
          formatters={formatters}
          onChange={props.onInputChange}
        />
        <div className="oui-select-none">x</div>
      </Flex>
      <IconButton
        Icon={PlusIcon}
        onClick={props.onLeverageIncrease}
        disabled={props.isIncreaseDisabled}
      />
    </label>
  );
};

export type LeverageProps = LeverageScriptReturns;

export const Leverage: FC<LeverageProps> = (props) => {
  const { currentLeverage = 0 } = props;
  const { t } = useTranslation();
  return (
    <Flex itemAlign={"start"} direction={"column"} mb={0}>
      <LeverageHeader currentLeverage={currentLeverage} />
      <LeverageInput {...props} />
      <LeverageSelector {...props} />
      <LeverageSlider {...props} />
      <Flex direction={"row"} gap={2} width={"100%"} mt={0} pt={5}>
        <Button
          variant="contained"
          color="gray"
          fullWidth
          onClick={props.onCancel}
          data-testid="oui-testid-leverage-cancel-btn"
        >
          {t("common.cancel")}
        </Button>
        <Button
          fullWidth
          loading={props.isLoading}
          onClick={props.onSave}
          data-testid="oui-testid-leverage-save-btn"
        >
          {t("common.save")}
        </Button>
      </Flex>
    </Flex>
  );
};

export type LeverageHeaderProps = Pick<LeverageProps, "currentLeverage">;

export const LeverageHeader: FC<LeverageHeaderProps> = (props) => {
  const { t } = useTranslation();
  return (
    <Flex justify={"center"} width={"100%"} mb={2}>
      <Flex gap={1}>
        {`${t("common.current")}:`}
        <Text.numeral unit="x" size={"sm"} intensity={80}>
          {props.currentLeverage ?? "--"}
        </Text.numeral>
      </Flex>
    </Flex>
  );
};

interface LeverageSelectorProps {
  value: number;
  onLeverageChange: (value: number) => void;
}

export const LeverageSelector: React.FC<LeverageSelectorProps> = (props) => {
  const { value, onLeverageChange } = props;
  return (
    <Flex itemAlign="center" justify="between" width={"100%"} mt={2}>
      {[1, 5, 10, 20, 50].map((option) => (
        <Flex
          key={option}
          itemAlign="center"
          justify="center"
          className={cn(
            `oui-transition-all oui-cursor-pointer oui-box-border oui-bg-clip-padding oui-px-3 oui-py-2.5 oui-rounded-md oui-border oui-border-solid`,
            value === option
              ? "oui-border-primary oui-bg-base-6"
              : "oui-border-line-12",
          )}
          onClick={() => onLeverageChange?.(option)}
        >
          <Flex
            itemAlign="center"
            justify="center"
            className={cn(`oui-w-9 oui-h-3 oui-select-none`)}
          >
            {option}x
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
};

export type LeverageSliderProps = {
  maxLeverage?: number;
  value: number;
  onLeverageChange: (value: number) => void;
  setShowSliderTip: (value: boolean) => void;
  showSliderTip: boolean;
  className?: string;
  onValueCommit?: (value: number[]) => void;
};

export const LeverageSlider: FC<LeverageSliderProps> = (props) => {
  return (
    <Box pt={4} width={"100%"} className={props.className}>
      <Slider
        // step={1.04}
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
        color="primary"
        onValueCommit={(e) => {
          props.onValueCommit?.(e);
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
              key={item}
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
                props.value >= item && "oui-text-primary-light",
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
