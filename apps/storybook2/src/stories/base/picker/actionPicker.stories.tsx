import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import {
  ActionSheet,
  ActionSheetItem,
  BaseActionSheetItem,
  Button,
  DatePicker,
} from "@orderly.network/ui";
import { useState } from "react";

const meta = {
  title: "Base/Picker/ActionPicker",
  component: DatePicker,
  //   subcomponents: { SelectItem },
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  //   tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: { type: "inline-radio" },
    },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
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
            console.log("xxxxxxx click ", a, "find ",item);
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
