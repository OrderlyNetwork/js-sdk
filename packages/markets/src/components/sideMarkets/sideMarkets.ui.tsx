import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, cn, Flex, Text } from "@orderly.network/ui";
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
      pt={3}
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
  const {
    activeTab,
    onTabChange,
    className,
    tabSort,
    panelSize: panelSizeProp = "large",
    onPanelSizeChange,
    resizeable = true,
  } = props;

  // panelSizeProp can be: "small" (collapsed), "large" (expanded), "middle" (partial)
  // "small" = collapsed (shows compact list), "middle" = partial (shows compact list), "large" = expanded (shows full UI)

  const { symbol, onSymbolChange } = useMarketsContext();

  const { getFavoritesProps } = useFavoritesProps();

  const renderContent = () => {
    if (panelSizeProp === "large") {
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
        resizeable={resizeable}
        panelSize={panelSizeProp}
        onPanelSizeChange={onPanelSizeChange}
      />
      <Box
        width="100%"
        className={cn(
          panelSizeProp === "large" && "oui-h-[calc(100%_-_56px)]",
          panelSizeProp === "middle" && "oui-h-[calc(100%_-_52px)]",
        )}
      >
        {renderContent()}
      </Box>
    </Flex>
  );
};
