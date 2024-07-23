import {
  Layout,
  TradingPage,
  TradingPageProvider,
} from "@orderly.network/react";
import type { TradingPageProps } from "@orderly.network/react";

const { Header, Content } = Layout;

const { mobile: MobileTradingPage, desktop: DesktopTradingPage } = TradingPage;

export const Trading = (props: TradingPageProps) => {
  return (
    <TradingPageProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
      disableFeatures={props.disableFeatures}
    >
      <Layout mobile={<MobileTradingPage {...props} />}>
        <Layout style={{ paddingBottom: "42px" }}>
          <Content>
            <DesktopTradingPage {...props} />
          </Content>
        </Layout>
      </Layout>
    </TradingPageProvider>
  );
};
