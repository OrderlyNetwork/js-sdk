import { Input } from ".";

export default {
  title: "Base/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
};

export const Primary = {
  args: {
    primary: true,
    label: "Button",
  },
};
