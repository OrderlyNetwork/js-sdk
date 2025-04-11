import type { Meta, StoryObj } from "@storybook/react";
import {
  TradingRewards,
  TradingRewardsLeftSidebarPath,
} from "@orderly.network/trading-rewards";
import { TradingRewardsLayout } from "../../../components/layout";

const meta: Meta<typeof TradingRewards.HomePage> = {
  title: "Package/trading-rewards",
  component: TradingRewards.HomePage,
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {
  parameters: {
    layout: "centered",
  },
};

export const LayoutPage: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: (args) => {
    return (
      <TradingRewardsLayout currentPath={TradingRewardsLeftSidebarPath.Trading}>
        <TradingRewards.HomePage
          className="oui-py-6 oui-px-4 lg:oui-px-6 xl:oui-pl-4 lx:oui-pr-6"
          titleConfig={{
            brokerName: "Mark",
          }}
        />
      </TradingRewardsLayout>
    );
  },
};
