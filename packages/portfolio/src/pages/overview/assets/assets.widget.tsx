import { AssetsUI } from "./assets.ui";
import { useAssetScript } from "./useBuilder.script";

export const AssetWidget = () => {
  const {
    connected,
    connect: connectWallet,
    portfolioValue,
    onLeverageEdit,
    ...rest
  } = useAssetScript();
  return (
    <AssetsUI
      onConnectWallet={connectWallet}
      connected={connected}
      portfolioValue={portfolioValue}
      onLeverageEdit={onLeverageEdit}
      {...rest}
    />
  );
};
