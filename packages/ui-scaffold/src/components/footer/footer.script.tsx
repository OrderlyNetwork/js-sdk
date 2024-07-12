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

    console.log("footer config", footerConfig);
    


    return {
        wsStatus,
        config: footerConfig,
    };
};
