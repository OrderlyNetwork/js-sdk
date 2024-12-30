import { useMemo, useState } from "react";
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
  const [animating, setAnimating] = useState(false);
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();

  const { isFirstTimeDeposit } = useFirstTimeDeposit();

  /** 1024px - 1280px */
  const isSmall = useMediaQuery("(min-width: 1024px) and (max-width: 1280px)");
  /** max-width: 1440px */
  const is3XL = useMediaQuery("(max-width: 1440px)");
  /** max-width: 1680px */
  const is4XL = useMediaQuery("(max-width: 1680px)");
  console.log("is4XL", is4XL);

  const [collapsed, setCollapsed] = useLocalStorage<boolean | undefined>(
    "orderly_side_markets_collapsed",
    undefined
  );

  const [positions, setPositions] = useLocalStorage(
    "orderly_assets_orderEntry_margin_positions",
    [0, 1, 2]
  );

  // Order entry and side market list position, default Order entry in right
  const [layout, setLayout] = useLocalStorage(
    "orderly_order_entry_side_markets_layout",
    "right"
  );

  const [mainSplitSize, setMainSplitSize] = useSplitPersistent(
    "orderly_main_split_size",
    undefined,
    layout
  );
  const [dataListSplitSize, setDataListSplitSize] = useSplitPersistent(
    "orderly_datalist_split_size",
    "350px"
  );
  const [orderBookSplitSize, setOrderbookSplitSize] = useSplitPersistent(
    "orderly_orderbook_split_size",
    "280px",
    layout
  );

  const onCollapse = (collapsed: boolean) => {
    setCollapsed(collapsed);
    setAnimating(true);
  };

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

  const canTrading = useMemo(() => {
    if (state.status < AccountStatusEnum.EnableTrading || wrongNetwork) {
      return false;
    }
    return true;
  }, [state.status, wrongNetwork]);

  const showPositionIcon = useMemo(
    () => canTrading && !isFirstTimeDeposit,
    [canTrading, isFirstTimeDeposit]
  );

  const pos = useMemo(() => {
    return showPositionIcon ? (positions as number[]) : [0, 1, 2];
  }, [showPositionIcon, positions]);

  const _collapsed = useMemo(() => {
    // under 1440px markets force collapsed
    return is3XL ? true : collapsed;
  }, [is3XL, collapsed]);

  const collapsable = useMemo(() => !is3XL, [is3XL]);

  const map = {
    collapsable,
    collapsed: _collapsed,
    onCollapse,
    layout,
    onLayout: setLayout,
    orderBookSplitSize,
    setOrderbookSplitSize,
    dataListSplitSize,
    setDataListSplitSize,
    mainSplitSize,
    setMainSplitSize,
    is4XL,
    animating,
    setAnimating,
    positions: pos,
    updatePositions,
    canTrading,
    showPositionIcon,
    openMarketsSheet,
    onOpenMarketsSheetChange: setOpenMarketsSheet,
  };

  return { ...props, ...map } as TradingPageState & typeof map;
};

export function getOffsetSizeNum(size: string | null) {
  if (size) {
    return `${100 - Math.min(Number(size), 100)}`;
  }
  return "";
}
