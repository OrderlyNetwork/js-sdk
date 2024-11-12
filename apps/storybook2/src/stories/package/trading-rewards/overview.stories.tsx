import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  TradingRewards,
  TradingRewardsLayoutWidget,
} from "@orderly.network/trading-rewards";

import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { CustomConfigStore } from "../../../components/configStore/customConfigStore";

const meta: Meta<typeof TradingRewards.HomePage> = {
  title: "Package/TradingRewards",
  component: TradingRewards.HomePage,
  // subcomponents: {
  //     Assets: OverviewModule.AssetWidget,
  //     DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
  // },
  decorators: [
    (Story: any) => {
      const configStore = new CustomConfigStore({
        networkId: "testnet",
        brokerId: "orderly",
        brokerName: "Orderly",
        env: "staging",
      });
      return (
        <WalletConnectorProvider>
          <OrderlyAppProvider configStore={configStore}>
            <Story />
          </OrderlyAppProvider>
        </WalletConnectorProvider>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    // p: {
    //     control: {
    //         type: "number",
    //         min: 0,
    //         max: 10,
    //         step: 1,
    //     },
    // },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    // p: 5,
    // py: 2,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

export const LayoutPage: Story = {
  render: (args) => {
    const [currentPath, setCurrentPath] = useState("/rewards/affiliate");

    return (
      <TradingRewardsLayoutWidget
        routerAdapter={{
          onRouteChange: (options) => {
            console.log("options", options);
            setCurrentPath(options.href);
          },
          currentPath: currentPath,
        }}
        // @ts-ignore
        leftSideProps={{
          current: currentPath,
          // items
        }}
      >
        <TradingRewards.HomePage
          className="oui-py-6 oui-px-4 lg:oui-px-6 xl:oui-pl-4 lx:oui-pr-6"
          titleConfig={{
            brokerName: "Mark",
          }}
        />
      </TradingRewardsLayoutWidget>
    );
  },
};
