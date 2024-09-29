import { useLocalStorage } from "@orderly.network/hooks";
import { useTradingPageContext } from "../provider/context";
import { TradingPageState } from "../types/types";
import { useSplitPersistent } from "../components/desktop/layout/useSplitPersistent";

export type TradingV2State = ReturnType<typeof useTradingV2Script>;

export const useTradingV2Script = () => {
  const props = useTradingPageContext();

  const [collapsed, setCollapsed] = useLocalStorage(
    "orderly_side_markets_collapsed",
    false
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
    "280px"
  );

  const map = {
    collapsed,
    onCollapse: setCollapsed,
    layout,
    onLayout: setLayout,
    orderBookSplitSize,
    setOrderbookSplitSize,
    dataListSplitSize,
    setDataListSplitSize,
    mainSplitSize,
    setMainSplitSize,
  };

  return { ...props, ...map } as TradingPageState & typeof map;
};

export function getOffsetSizeNum(size: string | null) {
  if (size) {
    return `${100 - Math.min(Number(size), 100)}`;
  }
  return "";
}
