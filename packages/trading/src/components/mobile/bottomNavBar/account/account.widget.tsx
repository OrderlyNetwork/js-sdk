import { ExtensionPositionEnum, ExtensionSlot, installExtension } from "@orderly.network/ui";
import { useAccountScript } from "./account.script";
import { Account } from "./account.ui";

export const AccountWidget = () => {
    const state = useAccountScript();
    return (<Account {...state} />);
};
installExtension<any>({
    name: "mweb-account-menu",
    scope: ["*"],
    positions: [ExtensionPositionEnum.MwebAccountMenu],
    builder: useAccountScript,
    __isInternal: true,
  })((props:any) => {
    return <Account {...props} />;
  });
  
  export const MwebAccountMenuExtension = () => {
    return <ExtensionSlot position={ExtensionPositionEnum.MwebAccountMenu} />;
  };
  