import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { Box, Flex, ModalProvider } from "@orderly.network/ui";
import { SideNavbarWidget } from "@orderly.network/ui-scaffold";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { leftSidebarMenus } from "./data";

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
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId={"orderly"}
          brokerName={""}
          networkId={"testnet"}
        >
          <ModalProvider>
            <Story />
          </ModalProvider>
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    ),
  ],
  argTypes: {},
  args: {
    items: leftSidebarMenus,
    open: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <Box width={args.open ? "160px" : "75px"} intensity={900} p={4} r={"2xl"}>
        <SideNavbarWidget {...args} />
      </Box>
    );
  },
  // decorators: [
  //   (Story) => (

  //   ),
  // ],
};
