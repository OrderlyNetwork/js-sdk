import type { Meta, StoryObj } from "@storybook/react-vite";
import { EditIcon, Statistic } from "@orderly.network/ui";

const meta: Meta<typeof Statistic> = {
  title: "Base/Typography/Statistic",
  component: Statistic,
  parameters: {
    layout: "centered",
  },
  // tags: [''],
  argTypes: {
    //   backgroundColor: { control: 'color' },
  },
  args: {
    // p: 5,
    // py: 2,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Unreal. PnL",
    children: "1234.5609",
    valueProps: {
      coloring: true,
      showIdentifier: true,
      unit: "USDC",
      // surfix:'USDC',
    },
  },
};
export const ReactNodeSurfix: Story = {
  args: {
    label: "Unreal. PnL",
    children: "1234.5609",
    valueProps: {
      coloring: true,
      showIdentifier: true,
      surfix: <span className="oui-text-xs">(45.7%)</span>,
    },
  },
};
export const CustomValue: Story = {
  args: {
    label: "Unreal. PnL",
    children: (
      <div className="oui-flex oui-items-center">
        <span>10</span>
        <span>x</span>
        <button className="oui-ml-1">
          <EditIcon size={18} />
        </button>
      </div>
    ),
  },
};
export const RightAlign: Story = {
  args: {
    label: "Available to withdraw",
    children: "1234.5609",
    align: "right",
    valueProps: {
      dp: 3,
    },
  },
};
