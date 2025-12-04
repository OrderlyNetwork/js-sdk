import type { StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { OrderlyAppProvider } from "@veltodefi/react-app";
import { Flex, Text, ExtensionPositionEnum } from "@veltodefi/ui";
import { Scaffold } from "@veltodefi/ui-scaffold";
import { WalletConnectorProvider } from "@veltodefi/wallet-connector";

const meta = {
  title: "Customize/Scaffold/components",
  component: Scaffold,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: any) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId="orderly"
          brokerName="Orderly"
          networkId="testnet"
          onChainChanged={fn()}
          components={{
            [ExtensionPositionEnum.MainMenus]: (props) => {
              return (
                <div>
                  <ul className="oui-flex oui-gap-x-2">
                    {props.items.map((menu) => {
                      const isActive = (props.current as string[]).includes(
                        menu.href,
                      );
                      console.log("isActive", isActive);
                      return (
                        <li
                          key={menu.href}
                          className={isActive ? "oui-text-primary" : ""}
                        >
                          {menu.name}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            },
          }}
        >
          <Story />
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <Flex m={3} justify={"center"} height={"400px"} intensity={500} r={"lg"}>
        <Text size={"3xl"} intensity={54}>
          Content
        </Text>
      </Flex>
    ),
    mainNavProps: {
      mainMenus: [
        { name: "Trading", href: "/" },
        { name: "Reward", href: "/rewards" },
        { name: "Markets", href: "/markets" },
      ],
      initialMenu: "/markets",
    },
  },
};
