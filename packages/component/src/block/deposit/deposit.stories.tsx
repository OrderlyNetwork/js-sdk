import type { Meta, StoryObj } from "@storybook/react";
import { Deposit } from ".";
import { OrderlyProvider } from "../../provider";
import { useToken } from "@orderly/hooks";

const meta: Meta<typeof Deposit> = {
  component: Deposit,
  title: "Block/Deposit",
  argTypes: {
    // onChange: { action: "onChange" },
  },
  decorators: [
    (Story) => (
      <OrderlyProvider>
        <Story />
      </OrderlyProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Deposit>;

export const Default: Story = {};

export const WithHooks: Story = {
  render: () => {
    const { data } = useToken();
    return <Deposit />;
  },
};
