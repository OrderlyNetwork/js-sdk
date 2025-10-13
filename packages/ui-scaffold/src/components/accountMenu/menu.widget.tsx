import {
  ExtensionPositionEnum,
  ExtensionSlot,
  installExtension,
} from "@kodiak-finance/orderly-ui";
import { AccountMenu, AccountMenuProps } from "./menu.ui";
import { useAccountMenu } from "./useWidgetBuilder.script";
import { FC } from "react";

export const AccountMenuWidget = () => {
  const state = useAccountMenu();
  return <AccountMenu {...state} />;
};

installExtension<AccountMenuProps>({
  name: "account-menu",
  scope: ["*"],
  positions: [ExtensionPositionEnum.AccountMenu],
  builder: useAccountMenu,
  __isInternal: true,
})((props: AccountMenuProps) => {
  return <AccountMenu {...props} />;
});

export const WalletConnectButtonExtension = () => {
  return <ExtensionSlot position={ExtensionPositionEnum.AccountMenu} />;
};
