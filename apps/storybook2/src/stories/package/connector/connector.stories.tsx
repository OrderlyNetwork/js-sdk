import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  WalletConnectContent,
  WalletConnectorWidget,
  WalletConnectorModalId,
} from "@orderly.network/ui-connector";
import {
  Box,
  Button,
  Card,
  modal,
  ModalProvider,
  SimpleDialog,
} from "@orderly.network/ui";
import { AccountStatusEnum } from "@orderly.network/types";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";

const meta = {
  title: "Widget/Connector",
  component: WalletConnectContent,
  // subComponents: { Logo },
  parameters: {
    //   // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  decorators: [
    (Story: any) => (
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
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    initAccountState: AccountStatusEnum.NotConnected,
    enableTrading: fn(),
    signIn: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <Card>
        <Box width={"380px"}>
          <Story />
        </Box>
      </Card>
    ),
  ],
};

export const Widget: Story = {
  render: () => {
    return <WalletConnectorWidget />;
  },
  decorators: [
    (Story) => (
      <Card>
        <Box width={"380px"}>
          <Story />
        </Box>
      </Card>
    ),
  ],
};

export const Dialog: Story = {
  args: {
    initAccountState: 3,
  },

  // render: () => (
  decorators: [
    (Story) => (
      <SimpleDialog open title={"Connect your wallet"} size={"md"}>
        <Story />
      </SimpleDialog>
    ),
  ],
};

export const CommandStyle: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          modal.show(WalletConnectorModalId).then(
            (res) => {
              console.log("return ::", res);
            },
            (err) => {
              console.log("error:::", err);
            }
          );
        }}
      >
        Connect Orderly
      </Button>
    );
  },
};
