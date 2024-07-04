import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { Box, Flex, ModalProvider } from "@orderly.network/ui";
import {
  AccountMenuWidget,
  MainNavWidget,
  AccountSummaryWidget,
  ChainMenuWidget,
} from "@orderly.network/ui-scaffold";
import { ConnectorProvider } from "@orderly.network/web3-onboard";

const meta = {
  title: "Package/ui-scaffold/MainNav",
  component: MainNavWidget,
  subComponents: { AccountMenuWidget, AccountSummaryWidget, ChainMenuWidget },
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: any) => (
      <ConnectorProvider>
        <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
          <ModalProvider>
            <Box intensity={900}>
              <Story />
            </Box>
          </ModalProvider>
        </OrderlyApp>
      </ConnectorProvider>
    ),
  ],
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AccountMenu: Story = {
  render: () => {
    return <AccountMenuWidget />;
  },

  decorators: [
    (Story) => (
      <Flex justify={"end"} itemAlign={"center"} p={3}>
        {/*<Box width={"100px"}>*/}
        <Story />
        {/*</Box>*/}
      </Flex>
    ),
  ],
};

export const AccountSummary: Story = {
  render: () => {
    return <AccountSummaryWidget />;
  },

  decorators: [
    (Story) => (
      <Flex justify={"center"} itemAlign={"center"} p={3}>
        <Story />
      </Flex>
    ),
  ],
};

export const ChainMenu: Story = {
  render: () => {
    return <ChainMenuWidget />;
  },

  decorators: [
    (Story) => (
      <Flex justify={"center"} itemAlign={"center"} p={3}>
        <Story />
      </Flex>
    ),
  ],
};
