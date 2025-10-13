// import { fn } from 'storybook/test';
import { Logo } from "@kodiak-finance/orderly-ui";
import type { StoryObj } from "@storybook/react-vite";

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
