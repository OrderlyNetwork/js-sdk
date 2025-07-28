import { useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useChains } from "@orderly.network/hooks";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { Box, Flex, Text } from "@orderly.network/ui";
import {
  AccountMenuWidget,
  MainNavWidget,
  AccountSummaryWidget,
  ChainMenuWidget,
  ChainMenu,
  CampaignPositionEnum,
  LanguageSwitcherWidget,
} from "@orderly.network/ui-scaffold";
import {
  ARBActiveIcon,
  ARBIcon,
  OrderlyActiveIcon,
  OrderlyIcon,
} from "../../../components/icons";

const meta = {
  title: "Package/ui-scaffold/MainNav",
  component: MainNavWidget,
  subComponents: {
    AccountMenuWidget,
    AccountSummaryWidget,
    ChainMenuWidget,
    // ChainMenu,
  },
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: any) => (
      <Box intensity={900}>
        <Story />
      </Box>
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
  // args:{

  // }
};

export const CustomChainsMenu: Story = {
  render: () => {
    const [chains] = useChains();

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
        wrongNetwork={false}
        isConnected
        currentChain={formattedChains.mainnet[0]}
      />
    );
  },

  decorators: [
    (Story) => (
      <OrderlyAppProvider
        brokerId="orderly"
        brokerName="Orderly"
        networkId="testnet"
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
      </OrderlyAppProvider>
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
    initialMenu: "/markets",
  },
};
export const SubMainNav: Story = {
  args: {
    mainMenus: [
      { name: "Trading", href: "/" },
      { name: "Markets", href: "/markets" },
      {
        name: "Reward",
        href: "/rewards",
        icon: "box-ani.gif",
        children: [
          {
            name: "Trading rewards",
            href: "/",
            description: "Trade with Orderly to earn ORDER",
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.426 1.667c-.184.01-.437.084-.573.192a2 2 0 0 0-.2.192L1.02 7.28a.96.96 0 0 0-.187.528c0 .376.258.603.258.603l8.193 9.592c.006.007.3.335.716.33.417-.008.71-.323.716-.33l8.224-9.626s.227-.298.227-.569c0-.272-.218-.574-.218-.574l-3.592-5.182c-.025-.036-.084-.023-.114-.054-.037-.042-.042-.102-.087-.138-.135-.108-.296-.118-.458-.137-.044-.006-.07-.054-.114-.054h-.087zm1.939 1.757h5.27L10 6.438zm-1.862.603 2.55 2.905H3.468zm8.994 0 2.034 2.905h-4.583zM3.698 8.687h5.385v6.302zm7.219 0h5.385c-1.278 1.494-3.802 4.452-5.385 6.302z"
                  fill="#fff"
                  fillOpacity=".54"
                />
              </svg>
            ),
            activeIcon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="a"
                    x1="17.5"
                    y1="10"
                    x2="2.5"
                    y2="10"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="rgb(var(--oui-gradient-brand-end))" />
                    <stop
                      offset="1"
                      stopColor="rgb(var(--oui-gradient-brand-start))"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M5.426 1.667c-.184.01-.437.084-.573.192a2 2 0 0 0-.2.192L1.02 7.28a.96.96 0 0 0-.187.528c0 .376.258.603.258.603l8.193 9.592c.006.007.3.335.716.33.417-.008.71-.323.716-.33l8.224-9.626s.227-.298.227-.569c0-.272-.218-.574-.218-.574l-3.592-5.182c-.025-.036-.084-.023-.114-.054-.037-.042-.042-.102-.087-.138-.135-.108-.296-.118-.458-.137-.044-.006-.07-.054-.114-.054h-.087zm1.939 1.757h5.27L10 6.438zm-1.862.603 2.55 2.905H3.468zm8.994 0 2.034 2.905h-4.583zM3.698 8.687h5.385v6.302zm7.219 0h5.385c-1.278 1.494-3.802 4.452-5.385 6.302z"
                  fill="url(#a)"
                />
              </svg>
            ),
          },
          {
            name: "Trading rewards x2",
            href: "/trading-rewards",
            description:
              "Trade with Orderly to earn ORDER x2 Trade with Orderly to earn ORDER",
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.426 1.667c-.184.01-.437.084-.573.192a2 2 0 0 0-.2.192L1.02 7.28a.96.96 0 0 0-.187.528c0 .376.258.603.258.603l8.193 9.592c.006.007.3.335.716.33.417-.008.71-.323.716-.33l8.224-9.626s.227-.298.227-.569c0-.272-.218-.574-.218-.574l-3.592-5.182c-.025-.036-.084-.023-.114-.054-.037-.042-.042-.102-.087-.138-.135-.108-.296-.118-.458-.137-.044-.006-.07-.054-.114-.054h-.087zm1.939 1.757h5.27L10 6.438zm-1.862.603 2.55 2.905H3.468zm8.994 0 2.034 2.905h-4.583zM3.698 8.687h5.385v6.302zm7.219 0h5.385c-1.278 1.494-3.802 4.452-5.385 6.302z"
                  fill="#fff"
                  fillOpacity=".54"
                />
              </svg>
            ),
            activeIcon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="a"
                    x1="17.5"
                    y1="10"
                    x2="2.5"
                    y2="10"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="rgb(var(--oui-gradient-brand-end))" />
                    <stop
                      offset="1"
                      stopColor="rgb(var(--oui-gradient-brand-start))"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M5.426 1.667c-.184.01-.437.084-.573.192a2 2 0 0 0-.2.192L1.02 7.28a.96.96 0 0 0-.187.528c0 .376.258.603.258.603l8.193 9.592c.006.007.3.335.716.33.417-.008.71-.323.716-.33l8.224-9.626s.227-.298.227-.569c0-.272-.218-.574-.218-.574l-3.592-5.182c-.025-.036-.084-.023-.114-.054-.037-.042-.042-.102-.087-.138-.135-.108-.296-.118-.458-.137-.044-.006-.07-.054-.114-.054h-.087zm1.939 1.757h5.27L10 6.438zm-1.862.603 2.55 2.905H3.468zm8.994 0 2.034 2.905h-4.583zM3.698 8.687h5.385v6.302zm7.219 0h5.385c-1.278 1.494-3.802 4.452-5.385 6.302z"
                  fill="url(#a)"
                />
              </svg>
            ),
          },
          {
            name: "Affiliate",
            href: "/markets",
            tag: "40% Rebate",
            description: "Earn more as a Orderly affiliate",
          },
          {
            name: "Orderly airdrop",
            href: "https://app.orderly.network",
            description: "Earn Orderly merits by trading on Orderly.",
            target: "_blank",
            icon: <OrderlyIcon size={14} />,
            activeIcon: <OrderlyActiveIcon size={14} />,
          },
          {
            name: "ARB incentives",
            href: "https://app.orderly.network/tradingRewards",
            description: "Trade to win a share of 9,875 ARB each week.",
            target: "_blank",
            icon: <ARBIcon size={14} />,
            activeIcon: <ARBActiveIcon size={14} />,
          },
        ],
      },
    ],
    initialMenu: "/markets",
    onItemClick: fn(),
  },
};

export const CampaignsNav: Story = {
  args: {
    mainMenus: [
      { name: "Trading", href: "/" },
      { name: "Markets", href: "/markets" },
    ],
    initialMenu: "/markets",
    campaigns: {
      name: "Reward",
      href: "/rewards",
      icon: "box-ani.gif",
      children: [
        {
          name: "Orderly airdrop",
          href: "https://app.orderly.network",
          description: "Earn Orderly merits by trading on Orderly.",
          target: "_blank",
          icon: <OrderlyIcon size={14} />,
          activeIcon: <OrderlyActiveIcon size={14} />,
        },

        {
          name: "ARB incentives",
          href: "https://app.orderly.network/tradingRewards",
          description: "Trade to win a share of 9,875 ARB each week.",
          target: "_blank",
          icon: <ARBIcon size={14} />,
          activeIcon: <ARBActiveIcon size={14} />,
        },
      ],
    },
    campaignPosition: CampaignPositionEnum.navTailing,

    onItemClick: fn(),
  },
};

export const CustomChildren: Story = {
  args: {
    children: <div className={"oui-bg-primary oui-px-2"}>Custom Element</div>,
  },
};

export const LanguageSwitcher: Story = {
  render: () => {
    return <LanguageSwitcherWidget />;
  },
};
