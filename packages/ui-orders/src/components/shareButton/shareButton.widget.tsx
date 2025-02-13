import { useShareButtonScript } from "./shareButton.script";
import { ShareButton } from "./shareButton.ui";
import { SharePnLConfig } from "@orderly.network/ui-share";

export const ShareButtonWidget = (props: {
  order: any;
  sharePnLConfig?: SharePnLConfig;
  modalId: string;
  iconSize?: number;
}) => {
  const state = useShareButtonScript(props);
  return <ShareButton {...state} />;
};
