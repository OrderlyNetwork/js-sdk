import { Input } from ".";
import { Meta, StoryObj } from "@storybook/react";
import { InputMask } from "./inputMask";
import { ArrowLeftRight } from "lucide-react";
import { TokenQtyInput } from "./tokenQtyInput";

const meta: Meta = {
  title: "Base/Input",
  component: Input,
  //   parameters: {
  //     layout: "fullscreen",
  //   },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Primary: Story = {
  args: {
    // primary: true,
    // label: "Button",
  },
};

// export const TokenInput: Story = {
//   render: (args) => {
//     return <TokenQtyInput />;
//   },
// };
