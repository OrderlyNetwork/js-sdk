import type { Meta, StoryObj } from "@storybook/react";
import { useMemo } from "react";
import { OrderlyApp } from "@orderly.network/react-app";
import { Box, Flex, Text } from "@orderly.network/ui";
import {
  AccountMenuWidget,
  MainNavWidget,
  AccountSummaryWidget,
  ChainMenuWidget,
  ChainMenu,
  Scaffold,
} from "@orderly.network/ui-scaffold";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { useChains } from "@orderly.network/hooks";
import { fn } from "@storybook/test";

const meta = {
  title: "Package/ui-scaffold/Scaffold",
  component: Scaffold,
  subComponents: {
    AccountMenuWidget,
    AccountSummaryWidget,
    ChainMenuWidget,
    // ChainMenu,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: any) => (
      <WalletConnectorProvider>
        <OrderlyApp
          brokerId={"orderly"}
          brokerName={""}
          networkId={"testnet"}
          onChainChanged={fn()}
        >
          <Story />
        </OrderlyApp>
      </WalletConnectorProvider>
    ),
  ],
  argTypes: {},
  args: {
    leftSideProps: {
      // items: [
      //   {
      //     name: "Home",
      //     icon: <HomeIcon />,
      //     href: "/",
      //   },
      //   {
      //     name: "Trade",
      //     icon: <TradeIcon />,
      //     href: "/trade",
      //   },
      //   {
      //     name: "Wallet",
      //     icon: <WalletIcon />,
      //     href: "/wallet",
      //   },
      //   {
      //     name: "Settings",
      //     icon: <SettingsIcon />,
      //     href: "/settings",
      //   }],
      className:
        "oui-border oui-border-line-12 oui-m-4 oui-p-3 oui-rounded-lg oui-h-[calc(100vh_-_180px)]",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Box m={3} justify={"center"} height={"400px"} intensity={500} r={"lg"} />
    ),
  },
};

export const NoLeftSidebar: Story = {
  args: {
    leftSidebar: null,
    children: (
      <Flex m={3} justify={"center"} height={"400px"} intensity={500} r={"lg"}>
        <Text size={"3xl"} intensity={54}>
          Content
        </Text>
      </Flex>
    ),
  },
};
