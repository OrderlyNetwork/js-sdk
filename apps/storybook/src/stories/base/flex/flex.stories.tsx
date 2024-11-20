import type { Meta, StoryObj } from "@storybook/react";
import { Box, Flex } from "@orderly.network/ui";

const meta: Meta<typeof Flex> = {
  title: "Base/Layout/Flex",
  component: Flex,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    //   layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    p: {
      control: {
        type: "number",
        min: 0,
        max: 10,
        step: 1,
      },
    },
    direction: {
      // type:'enum',
      control: {
        type: "inline-radio",
      },
      options: ["row", "rowReverse", "column", "columnReverse"],
    },
    justify: {
      // type:'enum',
      control: {
        type: "inline-radio",
      },
      options: [
        "start",
        "end",
        "center",
        "between",
        "around",
        "evenly",
        "stretch",
      ],
    },
    itemAlign: {
      // type:'enum',
      control: {
        type: "inline-radio",
      },
      options: ["start", "end", "center", "baseline", "stretch"],
    },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    // py: 2,
    direction: "row",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <Flex {...args}>
        <Box className="oui-bg-red-100" p={5}></Box>
        <Box className="oui-bg-red-200" p={5}></Box>
        <Box className="oui-bg-red-300" p={5}></Box>
        <Box className="oui-bg-red-400" p={5}></Box>
        <Box className="oui-bg-red-500" p={5}></Box>
      </Flex>
    );
  },
  args: {
    gap: 5,
    itemAlign: "center",
    justify: "center",
    className: "oui-min-h-[300px]",
  },
};

export const Responsive: Story = {
  render: (args) => {
    return (
      <Flex {...args}>
        <Box className="oui-bg-red-100" p={5}></Box>
        <Box className="oui-bg-red-200" p={5}></Box>
        <Box className="oui-bg-red-300" p={5}></Box>
        <Box className="oui-bg-red-400" p={5}></Box>
        <Box className="oui-bg-red-500" p={5}></Box>
      </Flex>
    );
  },
  args: {
    className: "oui-min-h-[300px]",
    gap: {
      initial: 10,
      sm: 2,
      md: 5,
    },
  },
};
