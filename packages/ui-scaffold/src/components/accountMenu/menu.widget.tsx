import { AccountMenu } from "./menu.ui";
import { useAccountMenu } from "./useWidgetBuilder.script";

export const AccountMenuWidget = () => {
  const state = useAccountMenu();
  return <AccountMenu {...state} />;
};
