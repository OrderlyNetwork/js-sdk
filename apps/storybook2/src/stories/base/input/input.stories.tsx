import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, expect } from "@storybook/test";
import {
  Box,
  CheckedCircleFillIcon,
  Flex,
  Input,
  InputAdditional,
  inputFormatter,
} from "@orderly.network/ui";
import { useState } from "react";

const meta = {
  title: "Base/Input/Input",
  component: Input,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    color: {
      control: {
        type: "inline-radio",
      },
      options: ["default", "success", "danger", "warning"],
    },
    size: {
      control: {
        type: "inline-radio",
      },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    disabled: {
      control: {
        type: "boolean",
      },
    },
    fullWidth: {
      control: {
        type: "boolean",
      },
    },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    size: "default",
    disabled: false,
    fullWidth: false,
    placeholder: "text",
    onValueChange: fn(),
    onClear: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Clearable: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Input
        {...args}
        value={value}
        className="oui-w-60"
        onChange={(event) => {
          setValue(event.target.value);
        }}
        onClear={() => {
          setValue("");
        }}
      />
    );
  },
};

export const Prefix: Story = {
  render: (args) => {
    return (
      <Box width={"400px"}>
        <Flex direction={"column"} gap={3}>
          <Input {...args} prefix="Title" />
          <Input
            {...args}
            prefix={
              <InputAdditional>
                <CheckedCircleFillIcon />
              </InputAdditional>
            }
          />
        </Flex>
      </Box>
    );
  },
};
