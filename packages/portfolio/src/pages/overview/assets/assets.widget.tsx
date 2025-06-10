import { useAssetScript } from "./assets.script";
import { AssetsUI } from "./assets.ui";

export const AssetWidget = () => {
  const { connect: connectWallet, ...rest } = useAssetScript();
  return (
    <AssetsUI
      // TODO: remove duplicate props
      onConnectWallet={connectWallet}
      connect={connectWallet}
      {...rest}
    />
  );
};
