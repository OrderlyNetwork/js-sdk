import React from "react";
import { pick } from "ramda";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  cn,
  EyeCloseIcon,
  Flex,
  Text,
  Tooltip,
} from "@orderly.network/ui";
import { CollapseIcon, ExpandIcon } from "../../icons";
import { ExpandMarketsWidget } from "../expandMarkets";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import type { SideMarketsScriptReturn } from "./sideMarkets.script";

export const IndicatorIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGAttributes<SVGSVGElement>
>((props, ref) => {
  return (
    <svg
      width={10}
      height={16}
      viewBox="0 0 10 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      ref={ref}
      focusable={false}
      {...props}
    >
      <rect x={2} y={2} width={8} height={2} rx={1} />
      <rect x={2} y={7} width={8} height={2} rx={1} />
      <rect x={2} y={12} width={8} height={2} rx={1} />
    </svg>
  );
});

export const SideMarketsHeader: React.FC<
  Pick<
    SideMarketsScriptReturn,
    "resizeable" | "panelSize" | "onPanelSizeChange"
  >
> = (props) => {
  const { resizeable, panelSize, onPanelSizeChange } = props;

  const { t } = useTranslation();

  const cls = cn(
    "oui-text-base-contrast-36",
    resizeable
      ? "oui-cursor-pointer hover:oui-text-base-contrast-80"
      : "oui-cursor-not-allowed",
  );

  return (
    <Flex
      className={
        panelSize === "small"
          ? "oui-absolute oui-end-[-20px] oui-z-50"
          : "oui-relative"
      }
      justify={panelSize === "large" ? "between" : "end"}
      width="100%"
      px={3}
    >
      {panelSize === "large" && (
        <Text size="base" intensity={80}>
          {t("common.markets")}
        </Text>
      )}
      <Tooltip
        side={panelSize === "small" ? "right" : "left"}
        align="start"
        sideOffset={-4}
        alignOffset={-4}
        content={
          <Flex direction="column" gap={2}>
            {panelSize === "large" && (
              <>
                <div onClick={() => onPanelSizeChange?.("middle")}>
                  <CollapseIcon className={cls} />
                </div>
                <div onClick={() => onPanelSizeChange?.("small")}>
                  <EyeCloseIcon size={16} className={cls} opacity={1} />
                </div>
              </>
            )}
            {panelSize === "middle" && (
              <>
                <div onClick={() => onPanelSizeChange?.("large")}>
                  <ExpandIcon className={cls} />
                </div>
                <div onClick={() => onPanelSizeChange?.("small")}>
                  <EyeCloseIcon size={16} className={cls} opacity={1} />
                </div>
              </>
            )}
            {panelSize === "small" && (
              <>
                <div onClick={() => onPanelSizeChange?.("large")}>
                  <ExpandIcon className={cls} />
                </div>
                <div onClick={() => onPanelSizeChange?.("middle")}>
                  <CollapseIcon className={cls} />
                </div>
              </>
            )}
          </Flex>
        }
        delayDuration={0}
        className={
          "oui-rounded oui-border oui-border-line-12 oui-bg-base-9 oui-p-1"
        }
        arrow={{ className: "oui-fill-transparent" }}
      >
        <div className="oui-cursor-pointer">
          <IndicatorIcon
            className={cn(
              "oui-text-base-contrast-36 oui-transition-all hover:oui-text-base-contrast-80",
            )}
          />
        </div>
      </Tooltip>
    </Flex>
  );
};

export type SideMarketsProps = SideMarketsScriptReturn & { className?: string };

export const SideMarkets: React.FC<SideMarketsProps> = (props) => {
  const { panelSize, activeTab, onTabChange, className, tabSort } = props;

  const { symbol, onSymbolChange } = useMarketsContext();

  const { getFavoritesProps } = useFavoritesProps();

  const renderContent = () => {
    if (panelSize === "small") {
      return null;
    }
    if (panelSize === "middle") {
      return (
        <MarketsListWidget
          type={activeTab}
          initialSort={tabSort[activeTab]}
          panelSize={panelSize}
          {...getFavoritesProps(activeTab)}
        />
      );
    }
    if (panelSize === "large") {
      return (
        <ExpandMarketsWidget
          activeTab={activeTab}
          onTabChange={onTabChange}
          symbol={symbol}
          onSymbolChange={onSymbolChange}
        />
      );
    }
  };

  return (
    <Flex
      id="oui-side-markets"
      className={cn("oui-relative oui-font-semibold", className)}
      direction="column"
      gapY={5}
      height="100%"
      width="100%"
    >
      <SideMarketsHeader
        {...pick(["resizeable", "panelSize", "onPanelSizeChange"], props)}
      />
      <Box
        width="100%"
        className={cn(
          panelSize === "large" && "oui-h-[calc(100%_-_56px)]",
          panelSize === "middle" && "oui-h-[calc(100%_-_52px)]",
        )}
      >
        {renderContent()}
      </Box>
    </Flex>
  );
};
