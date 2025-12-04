import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Flex } from "@veltodefi/ui";

const meta: Meta<typeof Flex> = {
  title: "Base/Layout/Flex",
  component: Flex,
  parameters: {
    //   layout: 'centered',
  },
  tags: ["autodocs"],
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
