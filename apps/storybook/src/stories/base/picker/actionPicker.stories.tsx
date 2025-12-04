import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
// import { fn } from 'storybook/test';
import {
  ActionSheet,
  ActionSheetItem,
  BaseActionSheetItem,
  Button,
  DatePicker,
} from "@veltodefi/ui";

const meta = {
  title: "Base/Picker/ActionPicker",
  component: DatePicker,
  //   subcomponents: { SelectItem },
  parameters: {
    layout: "centered",
  },
  //   tags: ["autodocs"],
  argTypes: {
    //   backgroundColor: { control: 'color' },
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: { type: "inline-radio" },
    },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const list: BaseActionSheetItem[] = [
  {
    label: "A",
    value: "aAAA",
    // onClick: (ac) => {},
  },
  {
    label: "B",
    value: "b22",
    // onClick: (ac) => {},
  },
  {
    label: "c",
    value: "Cwa",
    // onClick: (ac) => {},
  },
];
export const Default: Story = {
  render: () => {
    const [cur, setCur] = useState(list[0]);
    const [open, setOpen] = useState(false);
    return (
      <>
        <ActionSheet
          open={open}
          onOpenChange={setOpen}
          onClose={() => setOpen(false)}
          value={cur}
          actionSheets={[...list, "Cancel"]}
          onValueChange={(a) => {
            const item = list.find((item) => item.value === a);
            console.log("xxxxxxx click ", a, "find ", item);
            if (item) {
              setCur(item);
            }
          }}
        >
          <Button onClick={() => {}}>{cur.label}</Button>
        </ActionSheet>
      </>
    );
  },
};
