// import { fn } from 'storybook/test';
import { Either } from "@kodiak-finance/orderly-ui";
import type { StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Base/misc/Either",
  component: Either,
  //   subcomponents: { SelectItem },
  parameters: {
    layout: "centered",
  },
  //   tags: ["autodocs"],
  argTypes: {
    //   backgroundColor: { control: 'color' },
    value: {
      type: "boolean",
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: false,
    left: <div>Not connected</div>,
    children: <div>Connected</div>,
  },
};
