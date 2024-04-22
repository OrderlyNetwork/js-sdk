import type { Meta, StoryObj } from "@storybook/react";

import { DatePicker, subDays } from "./index";
import { DateRange } from "./datePiker";
import { useState } from "react";

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  title: "Base/DatePicker",
  argTypes: {
    // onCheckedChange: { action: "checkedChange" },
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {};

export const Base: Story = {
  render: () => {
    
    return (
      <div>
        <DatePicker
          required
          onDateUpdate={(date) => {
            console.log("xxxx on date update", date);

          }} />
      </div>
    );
  },
};
