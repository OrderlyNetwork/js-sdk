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

type LeverageInputProps = LeverageProps & {
  classNames?: {
    input?: string;
    unit?: string;
  };
};

export const LeverageInput: React.FC<LeverageInputProps> = (props) => {
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
      <Flex itemAlign="center" justify="center" className="oui-mr-4">
        <Input
          value={props.value}
          id={id}
          autoComplete="off"
          classNames={{
            input: cn("oui-text-right oui-text-[24px]"),
            root: cn(
              "oui-w-12",
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
        <div
          className={cn(
            "oui-ml-1 oui-mt-1 oui-select-none",
            "oui-text-base oui-text-base-contrast-36",
          )}
        >
          x
        </div>
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
      <LeverageFooter {...props} />
    </Flex>
  );
};

export const LeverageFooter: FC<LeverageProps & { isMobile?: boolean }> = (
  props,
) => {
  const { t } = useTranslation();
  return (
    <Flex direction={"row"} gap={2} width={"100%"} mt={0} pt={5}>
      <Button
        variant="contained"
        color="gray"
        fullWidth
        onClick={props.onCancel}
        data-testid="oui-testid-leverage-cancel-btn"
        size={props.isMobile ? "md" : "lg"}
      >
        {t("common.cancel")}
      </Button>
      <Button
        fullWidth
        loading={props.isLoading}
        onClick={props.onSave}
        data-testid="oui-testid-leverage-save-btn"
        disabled={props.disabled}
        size={props.isMobile ? "md" : "lg"}
      >
        {t("common.save")}
      </Button>
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
    <div className="oui-mt-4 oui-flex oui-flex-wrap oui-gap-2 oui-text-base-contrast-80">
      {props.toggles.map((option) => (
        <Flex
          key={option}
          itemAlign="center"
          justify="center"
          className={cn(
            `oui-box-border oui-cursor-pointer oui-rounded-md oui-border oui-border-solid oui-bg-clip-padding oui-px-3 oui-py-2.5 oui-transition-all oui-shrink-0`,
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
    </div>
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
  marks?: { label: string; value: number }[];
};

export const LeverageSlider: FC<LeverageSliderProps> = (props) => {
  const {
    leverageLevers,
    maxLeverage = 0,
    className,
    value,
    showSliderTip,
  } = props;

  // 使用leverageLevers数组的最大值作为slider的最大值
  const sliderMax =
    leverageLevers.length > 0 ? Math.max(...leverageLevers) : maxLeverage;
  // 根据leverageLevers的长度设置刻度点数量
  const markCount = leverageLevers.length - 1;

  return (
    <Box pt={4} width={"100%"} className={className}>
      <Slider
        // step={1.04}
        max={sliderMax}
        min={1}
        //markLabelVisible={true}
        marks={props.marks}
        // markCount={markCount}
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
      <div className="oui-relative oui-w-full oui-pt-3">
        {leverageLevers?.map((item, index) => {
          // 使用与slider相同的convertValueToPercentage计算方式
          const convertValueToPercentage = (
            value: number,
            min: number,
            max: number,
          ) => {
            const maxSteps = max - min;
            if (maxSteps === 0) {
              return 0;
            }
            const percentPerStep = 100 / maxSteps;
            const percentage = percentPerStep * (value - min);
            return Math.min(100, Math.max(0, percentage));
          };

          const position = convertValueToPercentage(item, 1, sliderMax);

          return (
            <button
              key={item}
              onClick={() => {
                props.onLeverageChange(item);
                props.onValueCommit?.([item]);
              }}
              className={cn(
                "oui-absolute oui-pb-3 oui-text-2xs oui-transform oui--translate-x-1/2",
                props.value >= item && "oui-text-primary-light",
              )}
              style={{
                left: `${position}%`,
              }}
              data-testid={`oui-testid-leverage-${item}-btn`}
            >
              {`${item}x`}
            </button>
          );
        })}
      </div>
    </Box>
  );
};
