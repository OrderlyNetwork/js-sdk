import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  modal,
  Sheet,
  ModalProvider,
  registerSimpleSheet,
} from "@orderly.network/ui";
import { useEffect } from "@storybook/preview-api";

const meta = {
  title: "Base/Sheet",
  component: Sheet,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  decorators: [
    (Story: any) => (
      <ModalProvider>
        <Story />
      </ModalProvider>
    ),
  ],
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    // open: true,
    // title: "Title",
    // size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CommandStyle: Story = {
  render: () => {
    const id = "SIMPLE_SHEET";
    useEffect(() => {
      registerSimpleSheet(
        id,
        (props: { id: string }) => <div>{`Sheet id: ${props.id}`}</div>,
        {
          title: "Bottom sheet",
        }
      );
    }, []);
    return (
      <div>
        <Button
          onClick={() => {
            modal.show(id, { id });
          }}
        >
          Open
        </Button>
      </div>
    );
  },
};
