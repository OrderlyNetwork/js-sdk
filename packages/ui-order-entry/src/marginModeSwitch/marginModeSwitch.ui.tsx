import { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  ChevronRightIcon,
  CloseIcon,
  Divider,
  Text,
  TokenIcon,
  cn,
} from "@orderly.network/ui";
import type {
  MarginMode,
  MarginModeSwitchState,
} from "./marginModeSwitch.script";

export type MarginModeSwitchProps = Pick<
  MarginModeSwitchState,
  "symbol" | "isMobile" | "currentMarginMode" | "selectedMarginMode"
> & {
  close?: () => void;
  onSelect: (mode: MarginMode) => void;
  onOpenSettings?: () => void;
};

export const MarginModeSwitch: FC<MarginModeSwitchProps> = (props) => {
  const { t } = useTranslation();

  const titleClassName = props.isMobile
    ? "oui-text-lg oui-leading-[26px]"
    : "oui-text-base oui-leading-6";

  const headerPadding = props.isMobile
    ? "oui-px-4 oui-pt-3"
    : "oui-px-5 oui-pt-3";
  const contentPadding = props.isMobile ? "oui-p-4" : "oui-p-5";

  return (
    <div
      className={cn(
        "oui-flex oui-w-full oui-flex-col",
        "oui-rounded-[12px] oui-bg-base-8",
      )}
      data-testid="oui-testid-marginModeSwitch"
    >
      <div className={cn("oui-w-full", headerPadding)}>
        <div className="oui-flex oui-items-center oui-justify-between">
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
              "oui-font-semibold oui-tracking-[0.48px]",
              props.isMobile ? "oui-text-center" : "",
              titleClassName,
            )}
            intensity={98}
          >
            {t("marginMode.switchMarginMode")}
          </Text>

          <button
            type="button"
            className="oui-flex oui-size-[18px] oui-items-center oui-justify-center"
            onClick={props.close}
            data-testid="oui-testid-marginModeSwitch-close"
          >
            <CloseIcon size={18} color="white" opacity={0.98} />
          </button>
        </div>
        <Divider className="oui-mt-[9px] oui-w-full" />
      </div>

      <div className={cn("oui-w-full", contentPadding)}>
        <div className="oui-flex oui-items-center oui-gap-2">
          <TokenIcon symbol={props.symbol} className="oui-size-5" />
          <Text.formatted
            rule="symbol"
            formatString="base-type"
            size={props.isMobile ? "xs" : "base"}
            weight="semibold"
            intensity={98}
          >
            {props.symbol}
          </Text.formatted>
        </div>

        <div className="oui-mt-3 oui-flex oui-w-full oui-flex-col oui-gap-3">
          <OptionCard
            mode="cross"
            selected={props.selectedMarginMode === "cross"}
            isCurrent={props.currentMarginMode === "cross"}
            onClick={() => props.onSelect("cross")}
          />
          <OptionCard
            mode="isolated"
            selected={props.selectedMarginMode === "isolated"}
            isCurrent={props.currentMarginMode === "isolated"}
            onClick={() => props.onSelect("isolated")}
          />
        </div>

        <div className="oui-mt-3 oui-flex oui-w-full oui-justify-center">
          <button
            type="button"
            className={cn(
              "oui-flex oui-items-center oui-gap-1",
              "oui-text-[13px] oui-leading-[15px] oui-font-semibold oui-text-base-contrast-54",
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
        </div>

        {/* Visual-only home indicator (mweb design). Sheet itself is already swipeable. */}
        {props.isMobile ? (
          <div className="oui-relative oui-mt-4 oui-h-[34px] oui-w-full">
            <div className="oui-absolute oui-bottom-2 oui-left-1/2 oui-h-[5px] oui-w-[134px] -oui-translate-x-1/2 oui-rounded-full oui-bg-base-contrast" />
          </div>
        ) : null}
      </div>
    </div>
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
    props.mode === "cross"
      ? t("marginMode.crossMargin")
      : t("marginMode.isolatedMargin");
  const desc =
    props.mode === "cross"
      ? t("marginMode.crossMarginDescription")
      : t("marginMode.isolatedMarginDescription");

  return (
    <button
      type="button"
      className={cn(
        "oui-relative oui-w-full oui-rounded-[6px] oui-p-2",
        "oui-bg-base-6",
        "oui-text-left",
        props.selected ? "oui-border oui-border-[#38e2fe]" : "",
      )}
      onClick={props.onClick}
      data-testid={`oui-testid-marginModeSwitch-option-${props.mode}`}
    >
      <div className="oui-flex oui-w-full oui-flex-col oui-gap-2">
        <Text
          className="oui-text-sm oui-font-semibold oui-leading-5"
          intensity={98}
        >
          {title}
        </Text>
        <Text className="oui-text-xs oui-leading-[15px] oui-text-base-contrast-36">
          {desc}
        </Text>
      </div>

      {props.isCurrent ? (
        <div
          className={cn(
            "oui-absolute -oui-right-px -oui-top-px",
            "oui-rounded-bl-[6px] oui-rounded-tr-[6px]",
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
