import type { Meta, StoryObj } from "@storybook/react";
import {
  DepositFormWidget,
  WithdrawFormWidget,
  DepositAndWithdrawWithDialogId,
  DepositAndWithdrawWithSheetId,
} from "@orderly.network/ui-transfer";
import { Box, Flex, Button, modal } from "@orderly.network/ui";

const meta: Meta<typeof DepositFormWidget> = {
  title: "Package/ui-transfer",
  component: DepositFormWidget,
  subcomponents: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DepositForm: Story = {
  decorators: [
    (Story) => (
      <Flex justify="center" mt={10}>
        <Box width={420} intensity={800} p={5} r="lg">
          <Story />
        </Box>
      </Flex>
    ),
  ],
};

export const WithdrawForm: Story = {
  render: () => {
    return (
      <Flex justify="center" mt={10}>
        <Box width={420} intensity={800} p={5} r="lg">
          <WithdrawFormWidget />
        </Box>
      </Flex>
    );
  },
};

export const DepositDialog: Story = {
  decorators: [
    (Story) => (
      <Flex justify="center" itemAlign="center" height="100vh">
        <Button
          onClick={() => {
            modal.show(DepositAndWithdrawWithDialogId, {
              activeTab: "deposit",
            });
          }}
        >
          Show Deposit Dialog
        </Button>
      </Flex>
    ),
  ],
};

export const DepositSheet: Story = {
  decorators: [
    (Story) => (
      <Flex justify="center" itemAlign="center" height="100vh">
        <Button
          onClick={() => {
            modal.show(DepositAndWithdrawWithSheetId, { activeTab: "deposit" });
          }}
        >
          Show Deposit Sheet
        </Button>
      </Flex>
    ),
  ],
};

export const WithdrawDialog: Story = {
  decorators: [
    (Story) => (
      <Flex justify="center" itemAlign="center" height="100vh">
        <Button
          onClick={() => {
            modal.show(DepositAndWithdrawWithDialogId, {
              activeTab: "withdraw",
            });
          }}
        >
          Show Withdraw Dialog
        </Button>
      </Flex>
    ),
  ],
};

export const WithdrawSheet: Story = {
  decorators: [
    (Story) => (
      <Flex justify="center" itemAlign="center" height="100vh">
        <Button
          onClick={() => {
            modal.show(DepositAndWithdrawWithSheetId, {
              activeTab: "withdraw",
            });
          }}
        >
          Show Withdraw Sheet
        </Button>
      </Flex>
    ),
  ],
};
