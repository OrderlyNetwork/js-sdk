import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { DatePicker } from "@orderly.network/ui";

const meta = {
  title: "Base/Picker/DatePicker",
  component: DatePicker,
  //   subcomponents: { SelectItem },
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  //   tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: { type: "inline-radio" },
    },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    selected: new Date(),
  },
};

export const Range: Story = {
  render: (args) => {
    return <DatePicker.range from={new Date()} to={new Date()} {...args} />;
  },
};
