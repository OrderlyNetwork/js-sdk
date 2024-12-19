import { addons, types } from "@storybook/manager-api";
import {
  WalletConnectAddonId,
  WalletConnectPanelId,
  WalletConnectTool,
  WalletConnectToolId,
} from "./tool";
import { Panel } from "./panel";

addons.register(WalletConnectAddonId, () => {
  // addons.add(WalletConnectToolId, {
  //   type: types.TOOL,
  //   title: "Wallet Connect",
  //   // match: ({viewMode}) => viewMode === "story",
  //   render: WalletConnectTool,
  // });

  addons.add(WalletConnectPanelId, {
    type: types.PANEL,
    title: "Orderly Key",
    render: Panel,
  });
});
