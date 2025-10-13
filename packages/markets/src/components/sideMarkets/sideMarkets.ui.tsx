import React from "react";
import { pick } from "ramda";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { Box, cn, Flex, Text } from "@kodiak-finance/orderly-ui";
import { CollapseIcon, ExpandIcon } from "../../icons";
import { ExpandMarketsWidget } from "../expandMarkets";
import { MarketsListWidget } from "../marketsList";
import { useMarketsContext } from "../marketsProvider";
import { useFavoritesProps } from "../shared/hooks/useFavoritesExtraProps";
import type { SideMarketsScriptReturn } from "./sideMarkets.script";

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
      justify={panelSize === "large" ? "between" : "center"}
      width="100%"
      px={3}
    >
      {panelSize === "large" && (
        <Text size="base" intensity={80}>
          {t("common.markets")}
        </Text>
      )}
      {panelSize === "large" && (
        <div
          onClick={resizeable ? () => onPanelSizeChange?.("middle") : undefined}
        >
          <CollapseIcon className={cls} />
        </div>
      )}
      {(panelSize === "middle" || panelSize === "small") && (
        <div
          onClick={resizeable ? () => onPanelSizeChange?.("large") : undefined}
        >
          <ExpandIcon className={cls} />
        </div>
      )}
    </Flex>
  );
};

export type SideMarketsProps = SideMarketsScriptReturn & { className?: string };

export const SideMarkets: React.FC<SideMarketsProps> = (props) => {
  const { panelSize, activeTab, onTabChange, className, tabSort } = props;

  const { symbol, onSymbolChange } = useMarketsContext();

  const { getFavoritesProps } = useFavoritesProps();

  const renderContent = () => {
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
    return (
      <MarketsListWidget
        type={activeTab}
        initialSort={tabSort[activeTab]}
        panelSize={"middle"}
        {...getFavoritesProps(activeTab)}
      />
    );
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
