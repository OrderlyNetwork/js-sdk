import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within, expect } from "storybook/test";
import {
  Box,
  CheckedCircleFillIcon,
  Flex,
  Input,
  InputAdditional,
  inputFormatter,
} from "@orderly.network/ui";

const meta = {
  title: "Base/Input/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  // tags: ["autodocs"],
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
