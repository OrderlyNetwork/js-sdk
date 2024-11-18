import type { Meta, StoryObj } from "@storybook/react";
import {
  CrossDepositFormWidget,
  installCrossDeposit,
} from "@orderly.network/ui-cross-deposit";
import { Box, Flex, Button, modal } from "@orderly.network/ui";
import {
  DepositAndWithdrawWithDialogId,
  DepositAndWithdrawWithSheetId,
} from "@orderly.network/ui-transfer";
installCrossDeposit();

const meta: Meta<typeof CrossDepositFormWidget> = {
  title: "Package/ui-cross-deposit",
  component: CrossDepositFormWidget,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CrossDepositForm: Story = {
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

export const CrossDepositDialog: Story = {
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

export const CrossDepositSheet: Story = {
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
