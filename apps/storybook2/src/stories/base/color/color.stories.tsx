import type { Meta, StoryObj } from "@storybook/react";
import { Box, Flex } from "@orderly.network/ui";

const meta: Meta<typeof Box> = {
  title: "Base/Color/color",
  component: Box,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    p: 5,
    // py: 2,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return <Flex gap={2}>
        <Box width={20} height={20} className="oui-bg-primary"/>
        <Box width={20} height={20} className="oui-bg-primary-light"/>
        <Box width={20} height={20} className="oui-bg-primary-darken"/>
        <Box width={20} height={20} className="oui-bg-warning"/>
        <Box width={20} height={20} className="oui-bg-warning-light"/>
        <Box width={20} height={20} className="oui-bg-warning-darken"/>
        <Box width={20} height={20} className="oui-bg-warning-darken"/>
        <Box width={20} height={20} className="oui-bg-warning-contrast"/>
    </Flex>;
  },
};
