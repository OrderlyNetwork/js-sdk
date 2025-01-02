import { AccountSummary } from "./accountSummary.ui";
import { useTotalValueBuilderScript } from "./useWidgetBuilder.script";
import type { AccountSummaryList } from "./accountSummary.ui";

export const AccountSummaryWidget = () => {
  const state = useTotalValueBuilderScript();
  return (
    <AccountSummary
      {...state}
      elementKeys={state.elementKeys as AccountSummaryList}
    />
  );
};
