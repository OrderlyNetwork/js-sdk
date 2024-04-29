import type { Meta, StoryObj } from '@storybook/react';
// import { fn } from '@storybook/test';
import { Button, Flex } from '@orderly.network/ui';


const meta = {
    title: 'Base/Button',
    component: Button,
    parameters: {
      // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
      // layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
    //   backgroundColor: { control: 'color' },
    size:{
        control: {
            type: 'inline-radio',
          },
          options: ['nano', 'mini', 'medium', 'default', 'large'],
    },
    color:{
      control:{
        type:'inline-radio'
      },
      options:['primary','success','danger','warning','gray','darkGray']
    },
    variant:{
      control:{
        type:'inline-radio'
      },
      options:['contained','outlined','gradient']
    }
    
    },
    // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    // args: { onClick: fn() },
    args:{
      size: 'default',
      variant: 'contained',
      color: 'primary',
      children: 'Button',
      disabled:false,
      fullWidth:false
    }
  } satisfies Meta<typeof Button>;
  
  export default meta;
  type Story = StoryObj<typeof meta>;

  export const Variants: Story = {
    args: {
      
    },
  };

  export const Sizes:Story = {
    render: (args) => {
      const {size,...rest} = args;
      return <Flex gap={2} itemAlign={'center'}>
        <Button {...rest} size='nano'>Nano</Button>
        <Button {...rest} size='mini'>Mini</Button>
        <Button {...rest} size='medium'>Menium</Button>
        <Button {...rest}>Default</Button>
        <Button {...rest} size='large'>Large</Button>
      </Flex>
    }
  }