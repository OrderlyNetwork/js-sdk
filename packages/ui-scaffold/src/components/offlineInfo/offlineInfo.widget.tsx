import { useOfflineInfoScript } from "./offlineInfo.script";
import { OfflineInfo, OfflineInfoProps } from "./offlineInfo.ui";

export type OfflineInfoWidgetProps = Pick<
  OfflineInfoProps,
  "style" | "className" | "onRefresh" | "onStatusChange"
>;

export const OfflineInfoWidget: React.FC<OfflineInfoWidgetProps> = (props) => {
  const state = useOfflineInfoScript({
    onStatusChange:
      props.onStatusChange ??
      ((prev: boolean, next: boolean) => {
        if (prev === true && next === false) {
          if (props.onRefresh) {
            props.onRefresh();
          } else {
            window.location.reload();
          }
        }
      }),
  });
  return <OfflineInfo {...state} {...props} />;
};
