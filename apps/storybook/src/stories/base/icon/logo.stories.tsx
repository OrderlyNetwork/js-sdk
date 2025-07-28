import type { Meta, StoryObj } from "@storybook/react-vite";
// import { fn } from 'storybook/test';
import { Logo } from "@orderly.network/ui";

const meta = {
  title: "Base/Icon/Logo",
  component: Logo,
  //   subcomponents: { SelectItem },
  parameters: {
    layout: "centered",
  },
  // tags: ["autodocs"],
  argTypes: {
    //   backgroundColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "https://oss.orderly.network/static/symbol_logo/ETH.png",
  },
};
