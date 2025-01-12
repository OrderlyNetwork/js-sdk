import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useLocalStorage,
  useMediaQuery,
} from "@orderly.network/hooks";
import { useTradingPageContext } from "../../provider/context";
import { TradingPageState } from "../../types/types";
import { useSplitPersistent } from "../../components/desktop/layout/useSplitPersistent";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { useFirstTimeDeposit } from "../../components/desktop/assetView/assetView.script";

export type TradingState = ReturnType<typeof useTradingScript>;

export const useTradingScript = () => {
  const [openMarketsSheet, setOpenMarketsSheet] = useState(false);
  const props = useTradingPageContext();
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();

  const { isFirstTimeDeposit } = useFirstTimeDeposit();

  /** max-width: 1279px */
  const max2XL = useMediaQuery("(max-width: 1279px)");
  /** min-width: 1440px */
  const min3XL = useMediaQuery("(min-width: 1440px)");
  /** max-width: 1680px */
  const max4XL = useMediaQuery("(max-width: 1680px)");

  // Order entry and side market list position, default Order entry in right
  const [layout, setLayout] = useLocalStorage(
    "orderly_order_entry_side_markets_layout",
    "right"
  );

  const canTrading = useMemo(() => {
    if (
      !wrongNetwork &&
      (state.status >= AccountStatusEnum.EnableTrading ||
        state.status === AccountStatusEnum.EnableTradingWithoutConnected)
    ) {
      return true;
    }
    return false;
  }, [state.status, wrongNetwork]);

  const horizontalDraggable = useMemo(() => min3XL, [min3XL]);

  const positionsState = useOrderEntryPositions({
    canTrading,
    isFirstTimeDeposit,
  });

  const marketsCollapseState = useMarketsCollapse({ collapsable: min3XL });

  const splitSizeState = useSplitSize(layout);

  const observerState = useObserverOrderEntry({ max2XL });

  const map = {
    layout,
    onLayout: setLayout,
    max2XL,
    min3XL,
    max4XL,
    canTrading,
    openMarketsSheet,
    onOpenMarketsSheetChange: setOpenMarketsSheet,
    horizontalDraggable,
    ...marketsCollapseState,
    ...positionsState,
    ...splitSizeState,
    ...observerState,
  };

  return { ...props, ...map } as TradingPageState & typeof map;
};

function useMarketsCollapse(options: { collapsable: boolean }) {
  const { collapsable } = options;
  const [animating, setAnimating] = useState(false);

  const [collapsed, setCollapsed] = useLocalStorage<boolean | undefined>(
    "orderly_side_markets_collapsed",
    undefined
  );

  const onCollapse = (collapsed: boolean) => {
    setCollapsed(collapsed);
    setAnimating(true);
  };

  const _collapsed = useMemo(() => {
    // under 1440px markets force collapsed
    return collapsable ? collapsed : true;
  }, [collapsable, collapsed]);

  return {
    collapsable,
    collapsed: _collapsed,
    onCollapse,
    animating,
    setAnimating,
  };
}

function useOrderEntryPositions(options: {
  canTrading: boolean;
  isFirstTimeDeposit: boolean;
}) {
  const { canTrading, isFirstTimeDeposit } = options;

  const [positions, setPositions] = useLocalStorage(
    "orderly_assets_orderEntry_margin_positions",
    [0, 1, 2]
  );

  const updatePositions = (currentIdx: number, targetIdx: number) => {
    const pos = [...positions];
    // [0,1,2] => [1,2,0]
    if (currentIdx === 0 && targetIdx === pos.length - 1) {
      pos[targetIdx] = positions[currentIdx];
      for (let i = 0; i < pos.length - 1; i++) {
        pos[i] = positions[i + 1];
      }

      // [0,1,2] => [2,0,1]
    } else if (currentIdx === pos.length - 1 && targetIdx === 0) {
      pos[targetIdx] = positions[currentIdx];
      for (let i = 1; i < pos.length; i++) {
        pos[i] = positions[i - 1];
      }
    } else {
      // [0,1,2] => [1,0,2], [0,1,2] => [0,2,1]
      [pos[currentIdx], pos[targetIdx]] = [pos[targetIdx], pos[currentIdx]];
    }
    setPositions(pos);
  };

  const showPositionIcon = useMemo(
    () => canTrading && !isFirstTimeDeposit,
    [canTrading, isFirstTimeDeposit]
  );

  const pos = useMemo(() => {
    return showPositionIcon ? (positions as number[]) : [0, 1, 2];
  }, [showPositionIcon, positions]);

  return {
    positions: pos,
    showPositionIcon,
    updatePositions,
  };
}

function useSplitSize(dep: any) {
  const [mainSplitSize, setMainSplitSize] = useSplitPersistent(
    "orderly_main_split_size",
    undefined,
    dep
  );
  const [dataListSplitSize, setDataListSplitSize] = useSplitPersistent(
    "orderly_datalist_split_size",
    "350px"
  );
  const [orderBookSplitSize, setOrderbookSplitSize] = useSplitPersistent(
    "orderly_orderbook_split_size",
    "280px",
    dep
  );

  const [dataListSplitHeightSM, setDataListSplitHeightSM] = useSplitPersistent(
    "orderly_datalist_split_height_sm",
    "350px"
  );

  const [orderBookSplitHeightSM, setOrderbookSplitHeightSM] =
    useSplitPersistent("orderly_orderbook_split_height_sm", "280px");

  return {
    orderBookSplitSize,
    setOrderbookSplitSize,
    dataListSplitSize,
    setDataListSplitSize,
    mainSplitSize,
    setMainSplitSize,
    dataListSplitHeightSM,
    setDataListSplitHeightSM,
    orderBookSplitHeightSM,
    setOrderbookSplitHeightSM,
  };
}

function useObserverOrderEntry(options: { max2XL: boolean }) {
  const { max2XL } = options;
  const [orderEntryHeight, setOrderEntryHeight] = useState(0);
  const orderEntryViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = orderEntryViewRef.current;

    if (!element || !max2XL) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.contentRect.height;
        if (height) {
          setOrderEntryHeight(height);
        }
      }
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.unobserve(element);
    };
  }, [orderEntryViewRef, max2XL]);

  return {
    orderEntryViewRef,
    orderEntryHeight,
  };
}

export function getOffsetSizeNum(size: string | null) {
  if (size) {
    return `${100 - Math.min(Number(size), 100)}`;
  }
  return "";
}
