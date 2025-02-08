import {
  useShareButtonScript,
  UseShareButtonScriptOptions,
} from "./shareButton.script";
import { ShareButton } from "./shareButton.ui";

export type ShareButtonWidgetProps = UseShareButtonScriptOptions;

export const ShareButtonWidget = (props: ShareButtonWidgetProps) => {
  const state = useShareButtonScript(props);
  return <ShareButton {...state} />;
};
