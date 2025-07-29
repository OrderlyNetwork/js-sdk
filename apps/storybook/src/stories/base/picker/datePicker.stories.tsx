import type { Meta, StoryObj } from "@storybook/react-vite";
// import { fn } from 'storybook/test';
import { DatePicker } from "@orderly.network/ui";

const meta = {
  title: "Base/Picker/DatePicker",
  component: DatePicker,
  //   subcomponents: { SelectItem },
  parameters: {
    layout: "centered",
  },
  //   tags: ["autodocs"],
  argTypes: {
    //   backgroundColor: { control: 'color' },
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: { type: "inline-radio" },
    },
  },
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
