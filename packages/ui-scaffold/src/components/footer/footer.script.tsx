import { useWsStatus, WsNetworkStatus } from "@orderly.network/hooks";
import { FooterConfig } from ".";
import { useScaffoldContext } from "../scaffoldContext";

export type FooterReturns = {
    wsStatus: WsNetworkStatus,
    config?: FooterConfig,
};

export const useFooterScript = (): FooterReturns => {

    const wsStatus = useWsStatus();
    const { footerConfig } = useScaffoldContext();

    return {
        wsStatus,
        config: footerConfig,
    };
};
