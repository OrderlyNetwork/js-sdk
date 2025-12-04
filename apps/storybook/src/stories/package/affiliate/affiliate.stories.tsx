import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dashboard, ReferralProvider } from "@veltodefi/affiliate";
import { TradingRewardsLeftSidebarPath } from "@veltodefi/trading-rewards";
import { TradingRewardsLayout } from "../../../components/layout";

const meta: Meta<typeof Dashboard.AffiliatePage> = {
  title: "Package/affiliate/Affiliate",
  component: Dashboard.AffiliatePage,
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
          // onEnterAffiliatePage={() => {
          //     console.log("show affiliate page");
          // }}
          // onEnterTraderPage={() => {
          //     console.log("show trader page");
          // }}
          // chartConfig={
          //   {
          //     trader: {
          //       bar: { ...InitialBarStyle, fill: "#00B49E", columnPadding: 20 }
          //     },
          //     affiliate: {
          //       bar: { ...InitialBarStyle, fill: "#608CFF", columnPadding: 20 }
          //     },
          //   }
          // }
          // intl={
          // {
          // messages,
          // }
          // }
          splashPage={() => (
            <div style={{ backgroundColor: "#FF0000" }}>df</div>
          )}
          overwrite={{
            shortBrokerName: "Orderly",
            brokerName: "Orderly Network",
            ref: {
              // top: (state) =>  (<div>ASD</div>),
              // card: (state) => (<div>GFHJK</div>)
              // card: {
              // refClassName: "orderly-text-red-900",
              // refIcon: (<div className="orderly-bg-white orderly-h-full">DDS</div>),
              // ref: (state) => (<div>gdjsj</div>)
              // traderClassName: "orderly-text-red-900",
              // traderIcon: (<div className="orderly-bg-white orderly-h-full">DDS</div>),
              // trader: (state) => (<div>gdjsj</div>)
              // },
              // step: (state) => (<div>DJD</div>)
              // step: {
              //   applyIcon: (<div>Apply</div>),
              //   shareIcon: (<div>Share</div>),
              //   earnIcon: (<div>Earn</div>),
              // }
            },
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
        <Dashboard.AffiliatePage />
      </TradingRewardsLayout>
    );
  },
};
