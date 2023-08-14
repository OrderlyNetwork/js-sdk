import type { Meta, StoryObj } from "@storybook/react";

import { Spinner } from ".";

const meta: Meta = {
  title: "Base/Spinner",
  component: Spinner,
  //   parameters: {
  //     layout: "fullscreen",
  //   },
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  // description: "Description",
};
