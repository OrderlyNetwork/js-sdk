import { UserCenter } from "./components/userCenter";

import { installExtension } from "@kodiak-finance/orderly-ui";
import { ExtensionPositionEnum } from "@kodiak-finance/orderly-ui";
import { MwebUserCenter } from "./components/userCenter";
import React from "react";

installExtension({
  name: "account-menu-privy",
  scope: ["*"],
  positions: [ExtensionPositionEnum.AccountMenu],
})((props: any) => {
  return <UserCenter {...props} />;
});

installExtension({
  name: "mobile-account-menu-privy",
  scope: ["*"],
  positions: [ExtensionPositionEnum.MobileAccountMenu],
})((props: any) => {
  return <MwebUserCenter {...props} />;
});
