import type { StoryObj } from "@storybook/react";
import { EditorProvider } from "./components/editorContext";
import { CodeEditor } from "./components/codeEditor";

const meta = {
  title: "Theme Tool/Color Theme Builder",
  component: CodeEditor,
  // tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "Light" },
  },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    return (
      <EditorProvider>
        <CodeEditor />
      </EditorProvider>
    );
  },
};
