import type { Meta, StoryObj } from '@storybook/react';
// import { fn } from '@storybook/test';
import { Slider } from '@orderly.network/ui';
import { fn } from '@storybook/test';


const meta = {
  title: 'Base/Slider',
  component: Slider,
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    )
  ],
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    color: {
      control: {
        type: "inline-radio",
      },
      options: ["primary","primaryLight", 'sell', 'buy'],
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

  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    // size:'default'
    color: 'primary',
    step: 10,
    onValueChange: fn(),
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Marks: Story = {
  args:{
    markCount: 5,
  }
}