import { UserCenter } from "./components/userCenter";

import { installExtension } from "@orderly.network/ui";
import { ExtensionPositionEnum } from "@orderly.network/ui";
import { MwebUserCenter } from "./components/userCenter";
import React from "react";

export const injectUsercenter = () => {
  installExtension({
    name: "account-menu",
    scope: ["*"],
    positions: [ExtensionPositionEnum.AccountMenu],
    __isInternal: true,
  })((props: any) => {
    return <UserCenter {...props} />
  });
  
  installExtension({
    name: "mobile-account-menu",
    scope: ["*"],
    positions: [ExtensionPositionEnum.MobileAccountMenu],
    __isInternal: true,
  })((props: any) => {
    return <MwebUserCenter {...props} />
  });
}