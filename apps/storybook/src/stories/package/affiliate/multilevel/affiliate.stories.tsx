import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ReferralProvider,
  MultilevelAffiliatePage,
} from "@orderly.network/affiliate";
import { TradingRewardsLeftSidebarPath } from "@orderly.network/trading-rewards";
import { TradingRewardsLayout } from "../../../../components/layout";

const meta: Meta<typeof MultilevelAffiliatePage> = {
  title: "Package/affiliate/multilevel/Affiliate",
  component: MultilevelAffiliatePage,
  decorators: [
    (Story: any) => {
      return (
        <ReferralProvider
          becomeAnAffiliateUrl="https://orderly.network"
          learnAffiliateUrl="https://orderly.network"
          referralLinkUrl="https://ordely.network"
          showReferralPage={() => {
            console.log("show referral page");
          }}
          splashPage={() => (
            <div style={{ backgroundColor: "#FF0000" }}>df</div>
          )}
          overwrite={{
            shortBrokerName: "Orderly",
            brokerName: "Orderly Network",
          }}
        >
          <Story />
        </ReferralProvider>
      );
    },
  ],
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

export const LayoutPage: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    return (
      <TradingRewardsLayout
        currentPath={TradingRewardsLeftSidebarPath.Affiliate}
      >
        <MultilevelAffiliatePage
          classNames={{ root: "oui-p-4 lg:oui-p-6 xl:oui-p-3" }}
        />
      </TradingRewardsLayout>
    );
  },
};
