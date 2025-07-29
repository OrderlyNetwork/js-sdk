import { addons, types } from "storybook/manager-api";
import { Panel } from "./panel";
import {
  WalletConnectAddonId,
  WalletConnectPanelId,
  WalletConnectTool,
  WalletConnectToolId,
} from "./tool";

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
