import { FC } from "react";
import { TradingPageProps } from "./types";
import { TradingPageProvider } from "./context/tradingPageContext";
// import { Page } from "@/layout/page";

import { MobileTradingPage } from "./xs/trading";
import { DesktopTradingPage } from "./desktop/trading";
import { useExecutionReport } from "./hooks/useExecutionReport";
import { Layout } from "@/layout/layout";
import { Header } from "@/layout/header";
import { Content } from "@/layout/content";
import { Sider } from "@/layout/sider";
import { TopNavbar } from "../common/topNavbar";
import { Footer } from "@/layout/footer";
import { SystemStatusBar } from "@/block/systemStatusBar";
import { PageHeader } from "@/layout/pageHeader";

export { DataListView } from "./desktop";

export const TradingPage: FC<TradingPageProps> = (props) => {
  useExecutionReport();
  return (
    <TradingPageProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
      disableFeatures={props.disableFeatures}
    >
      <Layout mobile={<MobileTradingPage {...props} />}>
        {/* <Header className="orderly-app-trading-header orderly-border-b orderly-border-divider">
          <TopNavbar />
        </Header> */}
        <Layout>
          {/* <Sider style={{ minWidth: "44px", backgroundColor: "red" }}>
            
          </Sider> */}
          <Content>
            {/* <PageHeader
              style={{ height: "30px", backgroundColor: "blue" }}
            ></PageHeader> */}
            <DesktopTradingPage {...props} />
          </Content>
        </Layout>
        <Footer className="orderly-bg-base-900 orderly-flex orderly-items-center orderly-px-4 orderly-w-full orderly-h-[42px] orderly-justify-between orderly-border-t-[1px] orderly-border-base-500 orderly-z-20">
          <SystemStatusBar />
        </Footer>
      </Layout>
      {/* <Page md={<XSTradingPage {...props} />}>
        <FullTradingPage {...props} />
      </Page> */}
    </TradingPageProvider>
  );
};
