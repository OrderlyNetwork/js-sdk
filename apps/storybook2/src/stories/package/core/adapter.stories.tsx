import type { Meta, StoryObj } from "@storybook/react";
import { WalletConnectContent } from "@orderly.network/ui-connector";

const meta: Meta<typeof WalletConnectContent> = {
  title: "Package/core/adapter",
  component: WalletConnectContent,
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  args: {},
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    return <div>Wallet Adapter</div>;
  },
};
