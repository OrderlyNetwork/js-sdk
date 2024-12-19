import type { Meta, StoryObj } from "@storybook/react";
import { Slider } from "@orderly.network/ui";

const meta: Meta<typeof Slider> = {
  title: "Base/Slider",
  component: Slider,
  decorators: [
    (Story) => (
      <div style={{ width: "300px" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: {
        type: "inline-radio",
      },
      options: ["primary", "primaryLight", "sell", "buy"],
    },
    step: {
      control: {
        type: "number",
      },
    },
    // size: {
    //     control: {
    //         type: "inline-radio",
    //     },
    //     options: ['nano', 'mini','medium','default','large'],
    // }
  },

  args: {
    // size:'default'
    color: "primary",
    step: 10,
    showTip: true,
    // onValueChange: fn(),
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MarksCount: Story = {
  args: {
    markCount: 5,
  },
};

export const MarksItems: Story = {
  args: {
    step: 11.1,
    markLabelVisible: true,
    color: "primary",
    marks: [
      {
        label: "1x",
        value: 1,
      },
      {
        label: "2x",
        value: 2,
      },
      {
        label: "3x",
        value: 3,
      },
      {
        label: "4x",
        value: 4,
      },
      {
        label: "5x",
        value: 5,
      },
      {
        label: "10x",
        value: 10,
      },
      {
        label: "20x",
        value: 20,
      },
      {
        label: "30x",
        value: 30,
      },
      {
        label: "40x",
        value: 40,
      },
      {
        label: "50x",
        value: 50,
      },
    ],
  },
};
