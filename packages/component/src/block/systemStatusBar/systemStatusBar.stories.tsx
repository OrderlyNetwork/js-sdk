import type { Meta, StoryObj } from "@storybook/react";
import { SystemStatusBar } from ".";

import React from "react";
import { type } from "os";
import exp from "constants";

const meta: Meta<typeof SystemStatusBar> = {
    component: SystemStatusBar,
    title: "Block/SymtemStatusBar",
    tags: ["autodocs"],
    argTypes: {},
    args: {
    },
}

export default meta;

type Story = StoryObj<typeof SystemStatusBar>;

export const Default: Story = {};

