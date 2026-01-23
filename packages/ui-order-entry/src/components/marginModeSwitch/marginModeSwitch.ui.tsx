import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { MarginMode } from "@orderly.network/types";
import {
  ChevronRightIcon,
  CloseIcon,
  Divider,
  Flex,
  IconButton,
  Text,
  TokenIcon,
  cn,
} from "@orderly.network/ui";
import type { MarginModeSwitchState } from "./marginModeSwitch.script";

export type MarginModeSwitchProps = Pick<
  MarginModeSwitchState,
  | "symbol"
  | "isMobile"
  | "currentMarginMode"
  | "selectedMarginMode"
  | "onSelect"
> & {
  close?: () => void;
  onOpenSettings?: () => void;
};

export const MarginModeSwitch: FC<MarginModeSwitchProps> = (props) => {
  const { t } = useTranslation();

  const handleSelect = (mode: MarginMode) => {
    props.onSelect(mode);
  };

  const titleClassName = props.isMobile
    ? "oui-text-lg oui-leading-[26px]"
    : "oui-text-base oui-leading-6";

  const headerPadding = props.isMobile ? "oui-pt-3" : "oui-px-5 oui-pt-3";
  const contentPadding = props.isMobile ? "oui-py-4" : "oui-p-5";

  return (
    <Flex
      direction="column"
      className={cn(
        "oui-w-full",
        props.isMobile
          ? "oui-rounded-t-xl oui-bg-base-8"
          : "oui-rounded-xl oui-bg-base-8",
      )}
      data-testid="oui-testid-marginModeSwitch"
    >
      <div className={cn("oui-w-full", headerPadding)}>
        <Flex
          itemAlign="center"
          justify="between"
          className={cn(props.isMobile && "oui-px-4")}
        >
          {/* Mobile keeps title centered by reserving left space */}
          {props.isMobile ? (
            <button
              type="button"
              className="oui-size-[18px] oui-opacity-0"
              aria-hidden="true"
              tabIndex={-1}
            />
          ) : null}

          <Text
            className={cn(
              "oui-font-semibold oui-tracking-[0.03em]",
              titleClassName,
            )}
            intensity={98}
          >
            {t("marginMode.switchMarginMode")}
          </Text>

          <IconButton
            color="light"
            className="oui-size-[18px]"
            onClick={props.close}
            aria-label="Close"
            data-testid="oui-testid-marginModeSwitch-close"
          >
            <CloseIcon size={18} color="white" opacity={0.98} />
          </IconButton>
        </Flex>
        <Divider className="oui-mt-[9px] oui-w-full" />
      </div>

      <div
        className={cn(
          "oui-w-full",
          contentPadding,
          props.isMobile && "oui-px-4",
        )}
      >
        <Flex itemAlign="center" gap={2}>
          <TokenIcon symbol={props.symbol} className="oui-size-5" />
          <Text.formatted
            className="oui-tracking-[0.03em]"
            rule="symbol"
            formatString="base-type"
            size="base"
            weight="semibold"
            intensity={98}
          >
            {props.symbol}
          </Text.formatted>
        </Flex>

        <Flex direction="column" gap={3} className="oui-mt-3 oui-w-full">
          <OptionCard
            mode={MarginMode.CROSS}
            selected={props.selectedMarginMode === MarginMode.CROSS}
            isCurrent={props.currentMarginMode === MarginMode.CROSS}
            onClick={() => handleSelect(MarginMode.CROSS)}
          />
          <OptionCard
            mode={MarginMode.ISOLATED}
            selected={props.selectedMarginMode === MarginMode.ISOLATED}
            isCurrent={props.currentMarginMode === MarginMode.ISOLATED}
            onClick={() => handleSelect(MarginMode.ISOLATED)}
          />
        </Flex>

        <Flex justify="center" className="oui-mt-3 oui-w-full">
          <button
            type="button"
            className={cn(
              "oui-flex oui-items-center oui-gap-1",
              "oui-text-xs oui-leading-[15px] oui-font-semibold oui-text-base-contrast-54 oui-tracking-[0.03em]",
              props.onOpenSettings
                ? "oui-cursor-pointer"
                : "oui-cursor-default",
            )}
            onClick={props.onOpenSettings}
            disabled={!props.onOpenSettings}
            data-testid="oui-testid-marginModeSwitch-settings"
          >
            <span>{t("marginMode.marginModeSettings")}</span>
            <ChevronRightIcon size={18} color="white" opacity={0.54} />
          </button>
        </Flex>

        {props.isMobile ? (
          <div className="oui-mt-4 oui-h-[34px] oui-w-full" />
        ) : null}
      </div>
    </Flex>
  );
};

const OptionCard: FC<{
  mode: MarginMode;
  selected: boolean;
  isCurrent: boolean;
  onClick: () => void;
}> = (props) => {
  const { t } = useTranslation();

  const title =
    props.mode === MarginMode.CROSS
      ? t("marginMode.crossMargin")
      : t("marginMode.isolatedMargin");
  const desc =
    props.mode === MarginMode.CROSS
      ? t("marginMode.crossMarginDescription")
      : t("marginMode.isolatedMarginDescription");

  return (
    <button
      type="button"
      className={cn(
        "oui-relative oui-w-full oui-rounded-md oui-p-2",
        "oui-bg-base-6",
        "oui-text-left",
        props.selected ? "oui-border oui-border-[#38e2fe]" : "",
      )}
      onClick={props.onClick}
      data-testid={`oui-testid-marginModeSwitch-option-${props.mode}`}
    >
      <Flex direction="column" gap={2} itemAlign="start" className="oui-w-full">
        <Text
          className="oui-text-sm oui-font-semibold oui-leading-5 oui-tracking-[0.03em]"
          intensity={98}
        >
          {title}
        </Text>
        <Text className="oui-text-2xs oui-leading-[15px] oui-text-base-contrast-36 oui-font-semibold oui-tracking-[0.03em]">
          {desc}
        </Text>
      </Flex>

      {props.isCurrent ? (
        <div
          className={cn(
            "oui-absolute -oui-right-px -oui-top-px",
            "oui-rounded-bl-md oui-rounded-tr-md",
            "oui-bg-[#38e2fe] oui-px-1 oui-py-0.5",
          )}
        >
          <Text className="oui-text-2xs oui-leading-none oui-font-semibold oui-text-black">
            {t("marginMode.current")}
          </Text>
        </div>
      ) : null}
    </button>
  );
};
