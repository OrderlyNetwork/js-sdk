import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { Button, Close, Flex } from "@orderly.network/ui";

const meta = {
  title: "Base/Button",
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    size: {
      control: {
        type: "inline-radio",
      },
      options: ["xs", "sm", "md", "default", "lg"],
    },
    color: {
      control: {
        type: "inline-radio",
      },
      options: ["primary", "success", "danger", "warning", "gray", "darkGray"],
    },
    loading: {
      control: {
        type: "boolean",
      },
    },
    variant: {
      control: {
        type: "inline-radio",
      },
      options: ["contained", "outlined", "gradient"],
    },
    shadow: {
      control: {
        type: "inline-radio",
      },
      options: ["sm", "base", "md", "lg", "xl", "2xl", "inner", "none"],
    },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  // args: { onClick: fn() },
  args: {
    size: "default",
    variant: "contained",
    color: "primary",
    children: "Button",
    disabled: false,
    fullWidth: false,
    loading: false,
    shadow: "base",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  args: {},
};

export const Sizes: Story = {
  render: (args) => {
    const { size, ...rest } = args;
    return (
      <Flex gap={2} itemAlign={"center"}>
        <Button {...rest} size="xs">
          Nano
        </Button>
        <Button {...rest} size="sm">
          Mini
        </Button>
        <Button {...rest} size="md">
          Medium
        </Button>
        <Button {...rest}>Default</Button>
        <Button {...rest} size="lg">
          Large
        </Button>
      </Flex>
    );
  },
};

// export const IconButton: Story = {
//   render: (args) => {
//     return (
//       <Flex gap={2} itemAlign={"center"}>
//         <Button {...args} leading={<Close color="white" size={12} />}>
//           Left icon
//         </Button>
//         <Button {...args} trailing={<Close color="white" size={12} />}>
//           Right icon
//         </Button>
//       </Flex>
//     );
//   },
// };
