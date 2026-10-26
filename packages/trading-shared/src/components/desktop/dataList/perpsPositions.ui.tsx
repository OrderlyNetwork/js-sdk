import React from "react";
import { Box, Divider, Flex } from "@orderly.network/ui";
import {
  PositionsWidget,
  type PositionsProps,
} from "@orderly.network/ui-positions";
import { useTradingLocalStorage } from "../../../hooks/useTradingLocalStorage";

const LazySettingWidget = React.lazy(() =>
  import("./setting").then((mod) => ({ default: mod.SettingWidget })),
);
const LazyPositionHeaderWidget = React.lazy(() =>
  import("../../base/positionHeader").then((mod) => ({
    default: mod.PositionHeaderWidget,
  })),
);

/** A standalone Perps positions panel for surfaces that embed it outside DataList. */
export const PerpsPositionsPanel: React.FC<PositionsProps> = (props) => {
  const localStorage = useTradingLocalStorage({
    pnlNotionalDecimalPrecision: props.pnlNotionalDecimalPrecision,
  });
  const symbol = localStorage.showAllSymbol ? undefined : props.symbol;

  return (
    <Flex direction="column" width="100%" height="100%">
      <React.Suspense fallback={null}>
        <LazyPositionHeaderWidget
          setPnlNotionalDecimalPrecision={
            localStorage.setPnlNotionalDecimalPrecision
          }
          pnlNotionalDecimalPrecision={localStorage.pnlNotionalDecimalPrecision}
          symbol={symbol}
          setUnPnlPriceBasic={localStorage.setUnPnlPriceBasic}
          unPnlPriceBasis={localStorage.unPnlPriceBasis}
        />
      </React.Suspense>
      <Divider className="oui-w-full" />
      <Box className="oui-min-h-0 oui-flex-1" width="100%">
        <PositionsWidget
          {...props}
          symbol={symbol}
          pnlNotionalDecimalPrecision={localStorage.pnlNotionalDecimalPrecision}
          calcMode={localStorage.unPnlPriceBasis}
        />
      </Box>
    </Flex>
  );
};

export const PerpsPositionsSettings: React.FC = () => {
  const localStorage = useTradingLocalStorage();

  return (
    <React.Suspense fallback={null}>
      <LazySettingWidget
        pnlNotionalDecimalPrecision={localStorage.pnlNotionalDecimalPrecision}
        setPnlNotionalDecimalPrecision={
          localStorage.setPnlNotionalDecimalPrecision
        }
        unPnlPriceBasis={localStorage.unPnlPriceBasis}
        setUnPnlPriceBasic={localStorage.setUnPnlPriceBasic}
        hideOtherSymbols={!localStorage.showAllSymbol}
        setHideOtherSymbols={(value) => localStorage.setShowAllSymbol(!value)}
      />
    </React.Suspense>
  );
};
