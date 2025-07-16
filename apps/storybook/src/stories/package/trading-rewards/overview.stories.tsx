import type { Meta, StoryObj } from "@storybook/react-vite";
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
          className="lx:oui-pr-6 oui-px-4 oui-py-6 lg:oui-px-6 xl:oui-pl-4"
          titleConfig={{
            brokerName: "Orderly",
          }}
          showEpochPauseCountdown={true}
        />
      </TradingRewardsLayout>
    );
  },
};
