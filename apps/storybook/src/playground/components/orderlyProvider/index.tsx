import { Outlet } from "react-router";
import { OrderlyAppProvider } from "../../../components/orderlyProvider/orderlyAppProvider";
import { WalletConnectorProvider } from "../../../components/orderlyProvider/walletConnectorProvider";
import { useNav } from "../../hooks/useNav";
import { usePageTitle } from "../../hooks/usePageTitle";
import { LocaleProvider } from "./localeProvider";

export const OrderlyProvider = () => {
  const { onRouteChange } = useNav();
  usePageTitle();

  return (
    <LocaleProvider>
      <WalletConnectorProvider>
        <OrderlyAppProvider onRouteChange={onRouteChange}>
          <Outlet />
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    </LocaleProvider>
  );
};
