import type { Meta, StoryObj } from '@storybook/react';
// import { fn } from '@storybook/test';
import { Box } from '@orderly.network/ui';


const meta = {
    title: 'Base/Layout/Box',
    component: Box,
    parameters: {
      // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
      layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
    //   backgroundColor: { control: 'color' },
    p:{control:{
      type: 'number',
        min: 0,
        max: 10,
        step: 1,
    },}
    },
    // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: {
      p: 5,
      // py: 2,

     },
  } satisfies Meta<typeof Box>;

  export default meta;
  type Story = StoryObj<typeof meta>;

  export const Default: Story = {
    render: (args) => {
        return <Box className='oui-bg-red-100' {...args}></Box>
    },
  };

  export const Size:Story = {
    args:{
      className: 'oui-bg-red-100',
      width: '100px',
      height: '100px',
    }
  }