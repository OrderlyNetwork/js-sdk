import { FC, useContext } from "react";
import { TradingPageProps } from "./types";
import { TradingPageProvider } from "./context/tradingPageContext";

import { MobileTradingPage } from "./mobile/trading";
import { DesktopTradingPage } from "./desktop/trading";
import { Layout } from "@/layout";

import { TopNavbar } from "../common/topNavbar";
import { Footer } from "@/layout/footer";
import { SystemStatusBar } from "@/block/systemStatusBar";
import { OrderlyAppContext } from "@/provider";
import { useWsStatus } from "@/block/systemStatusBar/useWsStatus";

const { Header, Content, Sider, PageHeader } = Layout;

export const BaseTradingPage: FC<TradingPageProps> = (props) => {
  const { footerStatusBar } = useContext(OrderlyAppContext);
  const wsStatus = useWsStatus();

  return (
    <TradingPageProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
      disableFeatures={props.disableFeatures}
    >
      <Layout mobile={<MobileTradingPage {...props} wsStatus={wsStatus} />}>
        <Header className="orderly-app-trading-header orderly-border-b orderly-border-divider">
          <TopNavbar wsStatus={wsStatus} />
        </Header>
        <Layout style={{ paddingBottom: "42px" }}>
          {/* <Sider style={{ minWidth: "44px", backgroundColor: "red" }}></Sider> */}
          <Content>
            {/* <PageHeader
              style={{ height: "30px", backgroundColor: "blue" }}
            ></PageHeader> */}
            <DesktopTradingPage {...props} />
          </Content>
        </Layout>
        <Footer
          fixed
          className="orderly-bg-base-900 orderly-flex orderly-items-center orderly-px-4 orderly-w-full orderly-h-[42px] orderly-justify-between orderly-border-t-[1px] orderly-border-base-500 orderly-z-50"
        >
          <SystemStatusBar
            xUrl={footerStatusBar?.xUrl}
            telegramUrl={footerStatusBar?.telegramUrl}
            discordUrl={footerStatusBar?.discordUrl}
            wsStatus={wsStatus}
          />
        </Footer>
      </Layout>
    </TradingPageProvider>
  );
};
