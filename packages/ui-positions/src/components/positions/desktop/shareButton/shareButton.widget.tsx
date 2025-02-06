import { SharePnLConfig } from "@orderly.network/ui-share";
import { useShareButtonScript } from "./shareButton.script";
import { ShareButton } from "./shareButton.ui";

export const ShareButtonWidget = (props: {
  position: any;
  sharePnLConfig?: SharePnLConfig;
  modalId: string;
  iconSize?: number;
}) => {
  const state = useShareButtonScript(props);
  return <ShareButton {...state} />;
};
