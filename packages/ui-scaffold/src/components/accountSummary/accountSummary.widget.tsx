import { AccountSummary } from "./accountSummary.ui";
import { useTotalValueBuilderScript } from "./useWidgetBuilder.script";

export const AccountSummaryWidget = () => {
  const state = useTotalValueBuilderScript();
  return <AccountSummary {...state} />;
};
