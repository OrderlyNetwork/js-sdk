import { AssetsWidget } from "./assets.widget";
import { useAssetsBuilder } from "./useBuilder.script";

export const Assets = () => {
  const { connected, connect: connectWallet } = useAssetsBuilder();
  return <AssetsWidget onConnectWallet={connectWallet} connected={connected} />;
};
