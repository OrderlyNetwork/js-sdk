// import { fn } from 'storybook/test';
import { Button, Popover, SelectItem } from "@kodiak-finance/orderly-ui";
import type { StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Base/Popover",
  component: Popover,
  subcomponents: { SelectItem },
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    //   backgroundColor: { control: 'color' },
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "inline-radio" },
    },
  },
  args: {
    align: "left",
    arrow: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Popover {...args} content={<div>Popover content</div>}>
      <Button>Open popover</Button>
    </Popover>
  ),
  // args: {
  //   // children: <Button>Open popover</Button>,
  //   // content: <div>Popover content</div>,
  // },
};
