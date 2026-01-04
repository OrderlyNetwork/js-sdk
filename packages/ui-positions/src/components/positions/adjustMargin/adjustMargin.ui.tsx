import { FC, useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Button,
  CloseIcon,
  Divider,
  Flex,
  Input,
  Slider,
  Text,
  TokenIcon,
  cn,
  inputFormatter,
} from "@orderly.network/ui";
import {
  AdjustMarginScriptProps,
  AdjustMarginTab,
  useAdjustMarginScript,
} from "./adjustMargin.script";

export type { AdjustMarginScriptProps, AdjustMarginTab };

export const AdjustMargin: FC<AdjustMarginScriptProps> = (props) => {
  const {
    symbol,
    inputValue,
    sliderValue,
    maxAmount,
    currentMargin,
    liquidationPrice,
    effectiveLeverage,
    onTabChange,
    onInputChange,
    onSliderChange,
    onConfirm,
    isLoading,
    close,
    isAdd,
  } = useAdjustMarginScript(props);

  const { t } = useTranslation();

  const percentMarks = useMemo(
    () => [0, 25, 50, 75, 100].map((m) => ({ value: m, label: `${m}%` })),
    [],
  );

  const tabBase =
    "oui-h-9 oui-rounded-[6px] oui-text-xs oui-font-semibold oui-transition-colors";

  return (
    <Flex
      direction="column"
      className="oui-w-full oui-rounded-[12px] oui-bg-base-8"
    >
      <div className="oui-w-full oui-px-5 oui-pt-3">
        <Flex justify="between" itemAlign="center">
          <Text
            className="oui-text-base oui-leading-6 oui-font-semibold oui-tracking-[0.48px]"
            intensity={98}
          >
            {t("positions.adjustMargin.title")}
          </Text>
          <button
            type="button"
            className="oui-flex oui-size-[18px] oui-items-center oui-justify-center"
            onClick={close}
            aria-label="close adjust margin"
          >
            <CloseIcon size={18} color="white" opacity={0.98} />
          </button>
        </Flex>
        <Divider className="oui-mt-[9px] oui-w-full" />
      </div>

      <div className="oui-w-full oui-p-5">
        <div className="oui-flex oui-items-center oui-gap-2">
          <TokenIcon symbol={symbol} className="oui-size-5" />
          <Text.formatted
            rule="symbol"
            formatString="base-type"
            size="base"
            weight="semibold"
            intensity={98}
          >
            {symbol}
          </Text.formatted>
        </div>

        <Flex direction="column" gap={4} className="oui-mt-4 oui-w-full">
          <Flex gap={2} className="oui-w-full">
            <Button
              size="md"
              fullWidth
              variant="contained"
              color="secondary"
              className={cn(
                tabBase,
                isAdd && "oui-bg-base-5",
                isAdd && "oui-text-base-contrast-98",
                !isAdd && "oui-bg-base-7",
                !isAdd && "oui-text-base-contrast-54",
                !isAdd && "hover:oui-text-base-contrast-80",
              )}
              onClick={() => onTabChange("add")}
            >
              {t("positions.adjustMargin.add")}
            </Button>
            <Button
              size="md"
              fullWidth
              variant="contained"
              color="secondary"
              className={cn(
                tabBase,
                !isAdd && "oui-bg-base-5",
                !isAdd && "oui-text-base-contrast-98",
                isAdd && "oui-bg-base-7",
                isAdd && "oui-text-base-contrast-54",
                isAdd && "hover:oui-text-base-contrast-80",
              )}
              onClick={() => onTabChange("reduce")}
            >
              {t("positions.adjustMargin.reduce")}
            </Button>
          </Flex>

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
              classNames={{
                // Keep border color stable and remove focus ring (Input has focus-within:outline-primary-light by default)
                root: "oui-rounded-[6px] oui-bg-base-6 oui-border oui-border-solid oui-border-white/[0.12] oui-outline oui-outline-1 oui-outline-offset-0 oui-outline-transparent focus-within:oui-outline-transparent",
                // keep value aligned to suffix side and match design emphasis
                input:
                  "oui-text-sm oui-font-semibold oui-text-base-contrast-98",
                // override default additional padding so value can sit closer to suffix
                additional: "oui-px-0",
                prefix:
                  "oui-pl-3 oui-pr-2 oui-text-sm oui-text-base-contrast-54",
                suffix:
                  "oui-pl-2 oui-pr-3 oui-text-sm oui-text-base-contrast-54",
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
                tipFormatter={(v, _min, _max, percent) =>
                  `${percent.toFixed(0)}%`
                }
                marks={percentMarks}
                markLabelVisible={false}
              />
              <Flex justify="between" className="oui-w-full">
                <Text size="2xs" className="oui-text-primary">
                  {`${sliderValue.toFixed(0)}%`}
                </Text>
                <Flex gap={1} itemAlign="baseline">
                  <Text size="2xs" className="oui-text-primary">
                    {t("positions.adjustMargin.max")}
                  </Text>
                  <Text size="2xs" intensity={54}>
                    {maxAmount.toFixed(2)}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>

          <Flex
            direction="column"
            gap={2}
            className="oui-w-full oui-rounded-[6px] oui-bg-base-6 oui-p-3"
          >
            <Flex justify="between" itemAlign="center" className="oui-w-full">
              <Text size="xs" intensity={36}>
                {t("positions.adjustMargin.currentMargin")}
              </Text>
              <Flex gap={1} itemAlign="baseline">
                <Text size="xs" intensity={98} weight="semibold">
                  {currentMargin.toFixed(2)}
                </Text>
                <Text size="xs" intensity={54}>
                  USDC
                </Text>
              </Flex>
            </Flex>
            <Flex justify="between" itemAlign="center" className="oui-w-full">
              <Text size="xs" intensity={36}>
                {t("positions.adjustMargin.liqPriceAfter")}
              </Text>
              <Flex gap={1} itemAlign="baseline">
                <Text size="xs" intensity={98} weight="semibold">
                  {liquidationPrice ? liquidationPrice.toFixed(2) : "--"}
                </Text>
                <Text size="xs" intensity={54}>
                  USDC
                </Text>
              </Flex>
            </Flex>
            <Flex justify="between" itemAlign="center" className="oui-w-full">
              <Text size="xs" intensity={36}>
                {t("positions.adjustMargin.leverageAfter")}
              </Text>
              <Flex gap={1} itemAlign="baseline">
                <Text size="xs" intensity={98} weight="semibold">
                  {effectiveLeverage ? effectiveLeverage.toFixed(2) : "--"}
                </Text>
                <Text size="xs" intensity={54}>
                  x
                </Text>
              </Flex>
            </Flex>
          </Flex>

          <Flex gap={3} className="oui-w-full">
            <Button
              variant="contained"
              fullWidth
              size="lg"
              color="secondary"
              className="oui-h-11"
              onClick={close}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="lg"
              className="oui-h-11"
              loading={isLoading}
              onClick={onConfirm}
            >
              {t("common.confirm")}
            </Button>
          </Flex>
        </Flex>
      </div>
    </Flex>
  );
};
