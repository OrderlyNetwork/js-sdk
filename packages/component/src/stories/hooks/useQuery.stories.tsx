import { Meta, StoryObj } from "@storybook/react";
import React from "react";

const QueryDemo = () => {
  return <div></div>;
};

const meta: Meta = {
  title: "hooks/useQuery",
  component: QueryDemo,
};

type Story = StoryObj<typeof QueryDemo>;

export default meta;

export const Default: Story = {
  render: () => {
    return <div></div>;
  },
};
