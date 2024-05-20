import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import {Box, Divider, ExclamationFillIcon, Tabs, TabsContent, TabsList, TabsTrigger} from '@orderly.network/ui';


// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Base/Tabs',
  component: Tabs,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    size: {
      control: {
        type: "inline-radio",
      },
      options: ["sm", "md", "lg", "xl"],
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
    render: (args) => {
        return <Tabs defaultValue="account" className="oui-w-[400px]">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">Make changes to your account here.</TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </Tabs>
    },
args: {
size: "sm",
},
};

export const Icon: Story = {
    render: (args) => {
        return <Tabs defaultValue="account" className="oui-w-[400px]">
        <TabsList>
          <TabsTrigger value="account" icon={
            <ExclamationFillIcon/>
          }>Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <Divider/>
        <Box p={2}>
<TabsContent value="account">Make changes to your account here.</TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
        </Box>
        
      </Tabs>
    },
}
