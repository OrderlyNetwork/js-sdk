import {
  Layout,
  TradingPage,
  TradingPageProvider,
  TooltipProvider,
} from "@orderly.network/react";
import { TradingPageProps } from "../types/types";

const { Header, Content } = Layout;

const { mobile: MobileTradingPage, desktop: DesktopTradingPage } = TradingPage;

export const Trading = (props: TradingPageProps) => {

  console.log("xxxxxxxx Trading", props);
  
  return (
    <TradingPageProvider
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
      disableFeatures={props.disableFeatures}
      shareOptions={props.shareOptions}
      referral={props.referral}
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