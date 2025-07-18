import React, { FC, useId } from "react";
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
        "oui-m-2 oui-text-white oui-transition-all",
        disabled
          ? "oui-cursor-not-allowed oui-opacity-20"
          : "oui-cursor-pointer oui-opacity-100",
      )}
    />
  );
};

const LeverageInput: React.FC<LeverageProps> = (props) => {
  const formatters = React.useMemo<InputFormatter[]>(
    () => [inputFormatter.numberFormatter, inputFormatter.dpFormatter(0)],
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
          value={props.value}
          id={id}
          autoComplete="off"
          classNames={{
            input: cn("oui-text-center"),
            root: cn(
              "oui-text-center",
              "oui-w-7",
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
  const { currentLeverage } = props;
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
          disabled={props.disabled}
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
  const { currentLeverage } = props;
  return (
    <Flex justify={"center"} width={"100%"} mb={2}>
      <Flex gap={1}>
        {`${t("common.current")}:`}
        <Text.numeral unit="x" size={"sm"} intensity={80} dp={0}>
          {currentLeverage ?? "--"}
        </Text.numeral>
      </Flex>
    </Flex>
  );
};

interface LeverageSelectorProps {
  value: number;
  onLeverageChange: (value: number) => void;
  toggles: number[];
}

export const LeverageSelector: React.FC<LeverageSelectorProps> = (props) => {
  const { value, onLeverageChange } = props;
  return (
    <Flex itemAlign="center" justify="between" width={"100%"} mt={2}>
      {props.toggles.map((option) => (
        <Flex
          key={option}
          itemAlign="center"
          justify="center"
          className={cn(
            `oui-box-border oui-cursor-pointer oui-rounded-md oui-border oui-border-solid oui-bg-clip-padding oui-px-3 oui-py-2.5 oui-transition-all`,
            value === option
              ? "oui-border-primary oui-bg-base-6"
              : "oui-border-line-12",
          )}
          onClick={() => onLeverageChange?.(option)}
        >
          <Flex
            itemAlign="center"
            justify="center"
            className={cn(`oui-h-3 oui-w-9 oui-select-none`)}
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
  leverageLevers: number[];
};

export const LeverageSlider: FC<LeverageSliderProps> = (props) => {
  const { leverageLevers, maxLeverage, className, value, showSliderTip } =
    props;
  return (
    <Box pt={4} width={"100%"} className={className}>
      <Slider
        // step={1.04}
        max={maxLeverage}
        min={1}
        // markLabelVisible={true}
        // marks={props.marks}
        markCount={5}
        value={[value]}
        onValueChange={(e) => {
          props.onLeverageChange(e[0]);
          props.setShowSliderTip(true);
        }}
        color="primary"
        onValueCommit={(e) => {
          props.onValueCommit?.(e);
          props.setShowSliderTip(false);
        }}
        showTip={showSliderTip}
        tipFormatter={(value) => {
          return `${value}x`;
        }}
      />
      <Flex justify={"between"} width={"100%"} pt={3}>
        {leverageLevers?.map((item, index) => {
          return (
            <button
              key={item}
              onClick={() => {
                props.onLeverageChange(item);
                props.onValueCommit?.([item]);
              }}
              className={cn(
                "oui-pb-3 oui-text-2xs",
                index === 0
                  ? "oui-pr-2"
                  : index === 5
                    ? "oui-pl-0"
                    : "oui-ml-2 oui-px-0",
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
};
