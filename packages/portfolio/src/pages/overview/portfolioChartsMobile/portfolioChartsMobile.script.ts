import { useLocalStorage, usePositionStream } from "@orderly.network/hooks";
import { ORDERLY_ASSETS_VISIBLE_KEY } from "../../assets/assets.script";

export const usePortfolioChartsState = () => {
  const [data] = usePositionStream();
  const [visible, setVisible] = useLocalStorage<boolean>(
    ORDERLY_ASSETS_VISIBLE_KEY,
    true,
  );
  return {
    unrealPnL: data?.aggregated.total_unreal_pnl,
    unrealROI: data?.totalUnrealizedROI,
    visible: visible as boolean,
    setVisible: setVisible,
  } as const;
};
