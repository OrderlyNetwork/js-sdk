import type { Meta, StoryObj } from "@storybook/react-vite";
import { LandingPage, ReferralProvider } from "@orderly.network/affiliate";

const meta: Meta<typeof LandingPage> = {
  title: "Package/affiliate/landingPage",
  component: LandingPage,
  decorators: [
    (Story: any) => {
      return (
        <ReferralProvider
          becomeAnAffiliateUrl="https://orderly.network"
          learnAffiliateUrl="https://orderly.network"
          referralLinkUrl="https://orderly.network"
          showReferralPage={() => {
            console.log("show referral page");
          }}
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

export const Default: Story = {
  parameters: {
    layout: "fullscreen",
  },
};
