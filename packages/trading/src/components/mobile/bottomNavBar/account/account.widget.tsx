import { ExtensionPositionEnum, ExtensionSlot, installExtension } from "@orderly.network/ui";
import { useAccountScript } from "./account.script";
import { Account } from "./account.ui";

export const AccountWidget = () => {
    const state = useAccountScript();
    return (<Account {...state} />);
};
installExtension<any>({
    name: "mobile-account-menu",
    scope: ["*"],
    positions: [ExtensionPositionEnum.MobileAccountMenu],
    builder: useAccountScript,
    __isInternal: true,
  })((props:any) => {
    return <Account {...props} />;
  });
  
  export const MobileAccountMenuExtension = () => {
    return <ExtensionSlot position={ExtensionPositionEnum.MobileAccountMenu} />;
  };
  