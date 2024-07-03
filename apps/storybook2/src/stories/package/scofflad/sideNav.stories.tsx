import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { Box, Flex, ModalProvider } from "@orderly.network/ui";
import { SideNavbarWidget } from "@orderly.network/ui-scaffold";

const meta = {
  title: "Package/ui-scaffold/SideNavbar",
  component: SideNavbarWidget,
  // subComponents: { AccountMenuWidget, AccountSummaryWidget, ChainMenuWidget },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      // <ConnectorProvider>
      <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
        <ModalProvider>
          <Story />
        </ModalProvider>
      </OrderlyApp>
      // </ConnectorProvider>
    ),
  ],
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <Box width={"160px"} intensity={900} p={4} r={"2xl"}>
        <Story />
      </Box>
    ),
  ],
};
