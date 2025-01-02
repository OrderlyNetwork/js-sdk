import type { StoryObj } from "@storybook/react";
import { ThemeEditor } from "./components/editor";

const meta = {
  title: "Theme Tool/Color Theme Builder",
  component: ThemeEditor,
  // tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
