import { AssetsUI } from "./assets.ui";
import { useAssetScript } from "./useBuilder.script";

export const AssetWidget = () => {
  const {
    canTrade,
    connect: connectWallet,
    portfolioValue,
    onLeverageEdit,
    ...rest
  } = useAssetScript();
  return (
    <AssetsUI
      onConnectWallet={connectWallet}
      canTrade={canTrade}
      portfolioValue={portfolioValue}
      onLeverageEdit={onLeverageEdit}
      {...rest}
    />
  );
};
