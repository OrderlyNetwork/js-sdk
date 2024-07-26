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
} from "@orderly.network/ui-scaffold";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { useChains } from "@orderly.network/hooks";

const meta = {
  title: "Package/ui-scaffold/MainNav",
  component: MainNavWidget,
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
      <ConnectorProvider>
        <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
          <Box intensity={900}>
            <Story />
          </Box>
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

export const ChainMenuComponent: Story = {
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

export const CustomChainsMenu: Story = {
  render: () => {
    const [chains] = useChains();
    console.log("chains", chains);
    const formattedChains = useMemo(() => {
      return {
        mainnet: chains.mainnet.map((chain) => ({
          name: chain.network_infos.name,
          id: chain.network_infos.chain_id,
          lowestFee: chain.network_infos.bridgeless,
        })),
        testnet: chains.testnet.map((chain) => ({
          name: chain.network_infos.name,
          id: chain.network_infos.chain_id,
          lowestFee: chain.network_infos.bridgeless,
        })),
      };
    }, [chains]);
    return (
      <ChainMenu
        chains={formattedChains}
        isUnsupported={false}
        isConnected
        currentChain={formattedChains.mainnet[0]}
      />
    );
  },

  decorators: [
    (Story) => (
      <OrderlyApp
        brokerId={"orderly"}
        brokerName={""}
        networkId={"testnet"}
        customChains={{
          mainnet: [
            {
              chain_id: 1,
              name: "Ethereum",
              network_infos: {
                chain_id: 1,
                name: "Ethereum",
                bridgeless: false,
              },
            },
          ],
          testnet: [
            {
              network_infos: {
                name: "Arbitrum Sepolia",
                shortName: "Arbitrum Sepolia",
                public_rpc_url:
                  "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
                chain_id: 421614,
                currency_symbol: "ETH",
                bridge_enable: true,
                mainnet: false,
                explorer_base_url: "https://sepolia.arbiscan.io",
                est_txn_mins: null,
              },
              token_infos: [
                {
                  symbol: "USDC",
                  address: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
                  decimals: 6,
                },
              ],
            },
          ],
        }}
      >
        <Flex justify={"center"} itemAlign={"center"} p={3}>
          <Story />
        </Flex>
      </OrderlyApp>
    ),
  ],
};

export const CustomMainNav: Story = {
  args: {
    mainMenus: [
      { name: "Trading", href: "/" },
      { name: "Reward", href: "/rewards" },
      { name: "Markets", href: "/markets" },
    ],
    products: [
      { name: "Swap", href: "/swap" },
      { name: "Trade", href: "/trade" },
    ],
    initialMenu: "/markets",
    initialProduct: "/trade",
  },
};

export const CustomChildren: Story = {
  args: {
    children: <div className={"oui-bg-primary oui-px-2"}>Custom Element</div>,
  },
};
