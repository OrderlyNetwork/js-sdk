import { Button, TriggerDialog } from "@kodiak-finance/orderly-ui";
import type { StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Base/Dialog/TriggerDialog",
  component: TriggerDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      // type:'enum',
      control: {
        type: "inline-radio",
      },
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    open: true,
    title: "Title",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    trigger: <Button>Trigger</Button>,
    children: "Dialog Content",
    // actions: {
    //   primary: {
    //     label: "Confirm",
    //     onClick: fn(),
    //   },
    //   secondary: {
    //     label: "Cancel",
    //     onClick: fn(),
    //   },
    // },
  },
};

export const Description: Story = {
  args: {
    trigger: <Button>Trigger</Button>,
    children: "Dialog Content",
    description: "Anyone who has this link will be able to view this.",
    // actions: {
    //   primary: {
    //     label: "Confirm",
    //     onClick: fn(),
    //   },
    //   secondary: {
    //     label: "Cancel",
    //     onClick: fn(),
    //   },
    // },
  },
};
