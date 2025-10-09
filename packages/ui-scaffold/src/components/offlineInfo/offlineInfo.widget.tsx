import { useOfflineInfoScript } from "./offlineInfo.script";
import { OfflineInfo, OfflineInfoProps } from "./offlineInfo.ui";

export type OfflineInfoWidgetProps = Pick<
  OfflineInfoProps,
  "style" | "className" | "onRefresh"
>;

export const OfflineInfoWidget: React.FC<OfflineInfoWidgetProps> = (props) => {
  const state = useOfflineInfoScript();
  return <OfflineInfo {...state} {...props} />;
};
