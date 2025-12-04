import type { StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { OrderlyAppProvider } from "@veltodefi/react-app";
import {
  Flex,
  Text,
  ExtensionPositionEnum,
  installExtension,
} from "@veltodefi/ui";
import { Scaffold } from "@veltodefi/ui-scaffold";
import { WalletConnectorProvider } from "@veltodefi/wallet-connector";

const meta = {
  title: "Customize/Scaffold/extension",
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
        >
          <Story />
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof meta>;

const useAccountMenu = () => {
  return {
    currentWallet: "0x1234567890",
  };
};

installExtension({
  name: "account-menu",
  scope: ["*"],
  positions: [ExtensionPositionEnum.AccountMenu],
  builder: useAccountMenu,
  __isInternal: true,
})((props) => {
  return <div>{props.currentWallet}</div>;
});

export const Default: Story = {
  args: {
    children: (
      <Flex m={3} justify={"center"} height={"400px"} intensity={500} r={"lg"}>
        <Text size={"3xl"} intensity={54}>
          Content
        </Text>
      </Flex>
    ),
  },
};
