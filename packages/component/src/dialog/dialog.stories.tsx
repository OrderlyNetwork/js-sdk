import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import Button from "../button";
import { modal } from "../modal";
import { OrderlyProvider } from "../provider/orderlyProvider";

const meta: Meta<typeof Dialog> = {
  component: Dialog,
  title: "Base/Dialog",
  decorators: [
    (Story) => (
      <OrderlyProvider>
        <Story />
      </OrderlyProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div>
            content...
            <br />
            content...
          </div>
        </DialogContent>
      </Dialog>
    );
  },
};

export const CommandStyle: Story = {
  render: () => {
    const showConfirm = () => {
      modal
        .confirm({
          title: "Edit Order",
          content:
            "You agree changing the quantity of ETH-PERP order to 1.0500.",
        })
        .then(
          (r) => {
            console.log("r", r);
          },
          (e) => {
            console.log("e", e);
          }
        );
    };
    return (
      <div>
        <button onClick={() => showConfirm()}>confirm</button>
      </div>
    );
  },
};
