import { SubAccountScript } from "./subAccount.script";
import { SubAccountUI } from "./subAccount.ui";

export const SubAccountWidget = () => {
  const state = SubAccountScript();
  return <SubAccountUI {...state} />;
};
