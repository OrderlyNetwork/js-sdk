import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { AccountStatusEnum } from "@orderly.network/types";
import { Box, Button, Card, modal, SimpleDialog } from "@orderly.network/ui";
import {
  WalletConnectContent,
  WalletConnectorWidget,
  WalletConnectorModalId,
} from "@orderly.network/ui-connector";

const meta: Meta<typeof WalletConnectContent> = {
  title: "Package/ui-connector",
  component: WalletConnectContent,
  parameters: {
    layout: "centered",
  },
  tags: ["!autodocs"],
  argTypes: {},
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
            },
          );
        }}
      >
        Connect Orderly
      </Button>
    );
  },
};
