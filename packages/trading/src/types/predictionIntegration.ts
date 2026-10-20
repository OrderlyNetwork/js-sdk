import type { ReactNode } from "react";
import type {
  DropDownMarketsExtensionProps,
  ExpandMarketsExtensionProps,
  MarketsSheetExtensionProps,
} from "@orderly.network/markets";

/** SDK-owned product panels; not accepted as page or provider inputs. */
export type PredictionAccountPanels = Partial<{
  positions: ReactNode | ((perpsContent: ReactNode) => ReactNode);
  pending: ReactNode;
  filled: ReactNode;
  positionHistory: ReactNode;
  orderHistory: ReactNode;
  counts: { positions?: number; pending?: number | null };
  mobile: Partial<{
    positions: ReactNode | ((perpsContent: ReactNode) => ReactNode);
    pending: ReactNode;
    history: ReactNode;
  }>;
}>;

export type PredictionIntegrationState = {
  marketsDropdown?: DropDownMarketsExtensionProps;
  marketsSheet?: MarketsSheetExtensionProps;
  sideMarkets?: ExpandMarketsExtensionProps;
  dataListProductContent?: PredictionAccountPanels;
};
