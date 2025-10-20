import { useOfflineInfoScript } from "./offlineInfo.script";
import { OfflineInfo, OfflineInfoProps } from "./offlineInfo.ui";

export type OfflineInfoWidgetProps = Pick<
  OfflineInfoProps,
  "style" | "className" | "onRefresh" | "onStatusChange"
> & {
  hideDelay?: number; // 网络恢复后延迟隐藏UI的时间（毫秒），默认 3000
};

export const OfflineInfoWidget: React.FC<OfflineInfoWidgetProps> = (props) => {
  const state = useOfflineInfoScript({
    opts: {
      onStatusChange: props.onStatusChange,
      hideDelay: props.hideDelay,
    },
  });
  return <OfflineInfo {...state} {...props} />;
};
