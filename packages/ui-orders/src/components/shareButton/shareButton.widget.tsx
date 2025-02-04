// import { PositionsProps } from "../../../types/types";
import { useShareButtonScript } from "./shareButton.script";
import { ShareButton } from "./shareButton.ui";
import { SharePnLConfig, SharePnLParams } from "@orderly.network/ui-share";

export const ShareButtonWidget = (props: {
  order: any;
  sharePnLConfig?: SharePnLConfig &
    Partial<Omit<SharePnLParams, "position" | "refCode" | "leverage">>;
  modalId: string;
  iconSize?: number;
}) => {
  const state = useShareButtonScript(props);
  return <ShareButton {...state} />;
};
