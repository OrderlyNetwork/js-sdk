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
  title: "Base/input/Input",
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
      options: ["mini", "medium", "default", "large"],
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
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Formatter: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <Input
        {...args}
        className="oui-w-60"
        data-testid="Only input number"
        value={value}
        placeholder="Only input number"
        onValueChange={(val) => {
          console.log(val);
          setValue(val);
        }}
      />
    );
  },
  args: {
    formatters: [
      inputFormatter.numberFormatter,
      inputFormatter.currencyFormatter,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    userEvent.type(canvas.getByTestId("Only input number"), "1234567890");
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
