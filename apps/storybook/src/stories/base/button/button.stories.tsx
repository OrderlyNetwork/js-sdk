import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import {
  Button,
  Flex,
  ArrowUpSquareFillIcon,
  ArrowDownSquareFillIcon,
  DebouncedButton,
  ThrottledButton,
} from "@orderly.network/ui";
import { useState } from "react";

const meta: Meta<typeof Button> = {
  title: "Base/Button",
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    size: {
      control: {
        type: "inline-radio",
      },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    color: {
      control: {
        type: "inline-radio",
      },
      options: [
        "primary",
        "success",
        "danger",
        "warning",
        "gray",
        "darkGray",
        "light",
      ],
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
    angle: {
      control: {
        type: "inline-radio",
      },
      options: ["0", "45", "90", "135", "180"],
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
    size: "lg",
    variant: "contained",
    color: "primary",
    children: "Button",
    disabled: false,
    fullWidth: false,
    loading: false,
    shadow: "base",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  args: {
    color: "danger",
  },
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
        <Button {...rest} size="xl">
          Large
        </Button>
      </Flex>
    );
  },
};

export const IconButton: Story = {
  render: (args) => {
    return (
      <Flex gap={2} itemAlign={"center"}>
        <Button {...args} icon={<ArrowUpSquareFillIcon />}>
          Icon
        </Button>
        <Button {...args} leading={<ArrowUpSquareFillIcon />}>
          Leading element
        </Button>
        <Button {...args} trailing={<ArrowDownSquareFillIcon />}>
          Trailing element
        </Button>
      </Flex>
    );
  },
};

export const Debounce: Story = {
  render: (args) => {
    return (
      <Flex gapX={3}>
        <ThrottledButton
          throttleDuration={5000}
          onClick={(event: any) => {
            console.log("event 1", Date.now());
          }}
          children={`throttle 5000`}
        />
        <ThrottledButton
          throttleDuration={1000}
          onClick={(event: any) => {
            console.log("event 2", Date.now());
          }}
          color={"danger"}
          children={`throttle 1000`}
        />
      </Flex>
    );
  },
};
