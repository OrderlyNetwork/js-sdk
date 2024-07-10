import { Button, toast } from "@orderly.network/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { OrderlyApp } from "@orderly.network/react-app";

const meta = {
  title: "Base/toast",
  component: "div",
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
        <Story />
      </OrderlyApp>
    ),
  ],
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  render: (args) => {
    return <Button>Success</Button>;
  },
};
