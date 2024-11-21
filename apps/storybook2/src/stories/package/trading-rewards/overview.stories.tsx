import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  TradingRewards,
  TradingRewardsLayoutWidget,
} from "@orderly.network/trading-rewards";

const meta: Meta<typeof TradingRewards.HomePage> = {
  title: "Package/TradingRewards",
  component: TradingRewards.HomePage,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  args: {},
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
        leftSideProps={{
          current: currentPath,
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
