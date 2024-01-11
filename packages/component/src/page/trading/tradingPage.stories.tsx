import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { TradingPage } from ".";

import { Layout, Page } from "../../layout";
import { TradingPageProvider } from "./context/tradingPageContext";
import { TopNavbar } from "../common/topNavbar";
import { SystemStatusBar } from "../../block/systemStatusBar";
import { TradingFeatures } from "./features";

const meta: Meta = {
  title: "Page/Trading",
  component: TradingPage,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    symbol: {
      // control: 'text'
      control: "select",
      options: ["BTC/USDT", "ETH/USDT"],
    },
  },
  args: {
    tradingViewConfig: {
      scriptSRC: "/tradingview/charting_library/charting_library.js",
      library_path: "/tradingview/charting_library/",
      customCssUrl: "/tradingview/chart.css",
    },
  },
  // decorators: [
  //   (Story) => (
  //     <SWRDevTools>
  //       <Story />
  //     </SWRDevTools>
  //   ),
  // ],
};

export default meta;

type Story = StoryObj<typeof TradingPage>;

const { Header, Footer, PageHeader, Sider, Content } = Layout;

// const {mobile} = TradingPage;

export const Default: Story = {
  render: (args, { globals }) => {
    const { symbol } = globals;
    return <TradingPage {...args} symbol={symbol} />;
  },
};

export const CustomizeLayout: Story = {
  render: (args, { globals }) => {
    return (
      <TradingPageProvider
        {...args}
        symbol={globals.symbol}
        disableFeatures={[TradingFeatures.AssetAndMarginInfo]}
      >
        <Layout
          mobile={<TradingPage.mobile {...args} symbol={globals.symbol} />}
        >
          <Header className="orderly-app-trading-header orderly-border-b orderly-border-divider">
            <div className="orderly-bg-base-800" style={{ height: "44px" }}>
              Header
            </div>
          </Header>
          <Layout>
            <Sider
              style={{ minWidth: "44px" }}
              className="orderly-bg-base-900 orderly-border-r orderly-border-divider"
            ></Sider>
            <Content>
              <PageHeader
                className="orderly-bg-base-800 orderly-border-b orderly-border-divider"
                style={{ height: "30px" }}
              ></PageHeader>
              <TradingPage.desktop {...args} symbol={globals.symbol} />
            </Content>
          </Layout>
          <Footer
            fixed
            className="orderly-bg-base-900 orderly-flex orderly-items-center orderly-px-4 orderly-w-full orderly-h-[42px] orderly-justify-between orderly-border-t-[1px] orderly-border-base-500 orderly-z-20"
          >
            <SystemStatusBar />
          </Footer>
        </Layout>
      </TradingPageProvider>
    );
  },
};
