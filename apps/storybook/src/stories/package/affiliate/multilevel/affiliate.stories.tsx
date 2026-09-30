import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ReferralProvider,
  MultiLevelAffiliatePage,
  ReferralContext,
  TabTypes,
  useReferralContext,
} from "@orderly.network/affiliate";
import { TradingRewardsLeftSidebarPath } from "@orderly.network/trading-rewards";
import { TradingRewardsLayout } from "../../../../components/layout";

const meta: Meta<typeof MultiLevelAffiliatePage> = {
  title: "Package/affiliate/multilevel/Affiliate",
  component: MultiLevelAffiliatePage,
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

const TraderTabPreview = () => {
  const context = useReferralContext();
  return (
    <ReferralContext.Provider
      value={{
        ...context,
        tab: TabTypes.trader,
        refereeKickbackInfo: { referee_kickback_rate: 0.3 },
      }}
    >
      <MultiLevelAffiliatePage />
    </ReferralContext.Provider>
  );
};

export const TraderTab: Story = {
  parameters: { layout: "fullscreen" },
  render: () => <TraderTabPreview />,
};

export const LayoutPage: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    return (
      <TradingRewardsLayout
        currentPath={TradingRewardsLeftSidebarPath.Affiliate}
      >
        <MultiLevelAffiliatePage
          classNames={{ root: "oui-p-4 lg:oui-p-6 xl:oui-p-3" }}
        />
      </TradingRewardsLayout>
    );
  },
};
