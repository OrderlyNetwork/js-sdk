import { useCallback } from "react";
import { useLocalStorage, usePositionStream } from "@orderly.network/hooks";
import { modal } from "@orderly.network/ui";
import { ORDERLY_ASSETS_VISIBLE_KEY } from "../../assets/type";
import { PerformanceMobileSheetId } from "../performanceMobileDialog";

export const usePortfolioChartsState = () => {
  const [data] = usePositionStream();
  const [visible, setVisible] = useLocalStorage<boolean>(
    ORDERLY_ASSETS_VISIBLE_KEY,
    true,
  );
  const onPerformanceClick = useCallback(() => {
    return modal.show(PerformanceMobileSheetId);
  }, []);
  return {
    unrealPnL: data?.aggregated.total_unreal_pnl,
    unrealROI: data?.totalUnrealizedROI,
    visible: visible as boolean,
    setVisible: setVisible,
    onPerformanceClick: onPerformanceClick,
  } as const;
};
