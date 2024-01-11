import { FC } from "react";
import { TradingPageProps } from "./types";
import { TradingPageProvider } from "./context/tradingPageContext";

import { MobileTradingPage } from "./mobile/trading";
import { DesktopTradingPage } from "./desktop/trading";
import { Layout } from "@/layout";

import { TopNavbar } from "../common/topNavbar";
import { Footer } from "@/layout/footer";
import { SystemStatusBar } from "@/block/systemStatusBar";

const { Header, Content, Sider, PageHeader } = Layout;

export const BaseTradingPage: FC<TradingPageProps> = (props) => {
  return (
    <TradingPageProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
      disableFeatures={props.disableFeatures}
    >
      <Layout mobile={<MobileTradingPage {...props} />}>
        <Header className="orderly-app-trading-header orderly-border-b orderly-border-divider">
          <TopNavbar />
        </Header>
        <Layout>
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
          className="orderly-bg-base-900 orderly-flex orderly-items-center orderly-px-4 orderly-w-full orderly-h-[42px] orderly-justify-between orderly-border-t-[1px] orderly-border-base-500 orderly-z-20"
        >
          <SystemStatusBar />
        </Footer>
      </Layout>
      {/* <Page md={<XSTradingPage {...props} />}>
        <FullTradingPage {...props} />
      </Page> */}
    </TradingPageProvider>
  );
};
