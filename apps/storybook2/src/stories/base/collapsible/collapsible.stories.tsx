import type { Meta, StoryObj } from '@storybook/react';
// import { fn } from '@storybook/test';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger, 
  Flex, 
  Text, 
  Box 
} from '@orderly.network/ui';


const meta = {
  title: 'Base/Layout/Collapsible',
  component: Collapsible,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  // argTypes: {
  //   //   backgroundColor: { control: 'color' },
  //   p: {
  //     control: {
  //       type: 'number',
  //       min: 0,
  //       max: 10,
  //       step: 1,
  //     },
  //   }
  // },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    // return <>DSS</>;
    return <Flex direction={"column"}>
      <Text>AAAAA</Text>
      <Collapsible>
        <CollapsibleTrigger>
          <Text className='oui-cursor-pointer'>Show more</Text>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Box height={200} className="oui-bg-red-300"></Box>
        </CollapsibleContent>
      </Collapsible>
    </Flex>
  },

};

// export const Size:Story = {
//   args:{
//     className: 'oui-bg-red-100',
//     width: '100px',
//     height: '100px',
//   }
// }