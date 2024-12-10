import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import {
  Icon,
  Box,
  CheckIcon,
  CheckedCircleFillIcon,
  CheckedSquareFillIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CloseIcon,
  CloseCircleFillIcon,
  CloseSquareFillIcon,
  Flex,
  ArrowDownUpIcon,
  CaretDownIcon,
  CaretUpIcon,
  SettingIcon,
  SettingFillIcon,
  ArrowUpSquareFillIcon,
  ArrowDownShortIcon,
} from "@orderly.network/ui";

const meta: Meta<typeof Icon> = {
  title: "Base/Icon/Icons",
  component: Icon,
  parameters: {
    layout: "centered",
  },
  // tags: ['autodocs'],
  argTypes: {
    //   backgroundColor: { control: 'color' },
    color: {
      control: {
        type: "inline-radio",
      },
      options: ["primary", "success", "danger", "warning", "white", "black"],
    },
    opacity: {
      control: {
        type: "range",
        min: 0,
        max: 1,
        step: 0.1,
      },
    },

    size: {
      control: {
        type: "number",
        min: 0,
        step: 1,
      },
    },
  },
  args: {
    //   p: 5,
    // py: 2,
    color: "primary",
    opacity: 1,
    size: 24,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Icons: Story = {
  render: (args) => {
    return (
      <Box width={"400px"} height={"300px"}>
        <Flex gap={3} wrap={"wrap"}>
          <CloseIcon {...args} />
          <CloseSquareFillIcon {...args} />
          <CloseCircleFillIcon {...args} />
          <CheckIcon {...args} />
          <CheckedCircleFillIcon {...args} />
          <CheckedSquareFillIcon {...args} />
          <ChevronUpIcon {...args} />
          <ChevronDownIcon {...args} />
          <ChevronLeftIcon {...args} />
          <ChevronRightIcon {...args} />
          <SettingIcon {...args} />
          <SettingFillIcon {...args} />
          <ArrowDownUpIcon {...args} />
          <CaretDownIcon {...args} />
          <CaretUpIcon {...args} />
          <ArrowUpSquareFillIcon {...args} />
          <ArrowDownShortIcon {...args} />
        </Flex>
      </Box>
    );
  },
};
