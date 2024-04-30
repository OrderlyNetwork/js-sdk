import type { Meta, StoryObj } from '@storybook/react';
// import { fn } from '@storybook/test';
import { BaseIcon, Box, Check, CheckCircleFill, CheckSquareFill, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Close, CloseCircleFill, CloseSquareFill, Flex, Setting, SettingFill } from '@orderly.network/ui';


const meta = {
    title: 'Base/Icon',
    component: BaseIcon,
    parameters: {
      // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
      layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
    //   backgroundColor: { control: 'color' },
    color:{
        control:{
            type:'inline-radio'
        },
        options:['primary','success','danger','warning','white','black']
    },
    opacity:{
        control:{
            type:'range',
            min:0,
            max:1,
            step:0.1
        }
    },

    size:{control:{
      type: 'number',
        min: 0,
        step: 1,
    },}
    },
    // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: { 
    //   p: 5,
      // py: 2,
      color: 'primary',
      opacity: 1,
size: 24,
     },
  } satisfies Meta<typeof BaseIcon>;
  
  export default meta;
  type Story = StoryObj<typeof meta>;

  export const Icons: Story = {
    render: (args) => {
        return <Box width={'400px'} height={'300px'}>
            <Flex gap={3} wrap={'wrap'}>
            <Close {...args}/>
            <CloseSquareFill {...args}/>
            <CloseCircleFill {...args}/>
            <Check {...args}/>
            <CheckCircleFill {...args}/>
            <CheckSquareFill {...args}/>
            <ChevronUp {...args}/>
            <ChevronDown {...args}/>
            <ChevronLeft {...args}/>
            <ChevronRight {...args}/>
            <Setting {...args}/>
            <SettingFill {...args}/>
        </Flex>
        </Box>
    },
  };

