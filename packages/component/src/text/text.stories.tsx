import type { Meta, StoryObj } from "@storybook/react";

import { OrderlyProvider } from "../provider";
import { Text } from "./text";

const meta: Meta<typeof Text> = {
  component: Text,
  title: "Base/Text",
  decorators: [
    (Story) => {
      return (
        <OrderlyProvider>
          <Story />
        </OrderlyProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {};
