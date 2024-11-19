import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogDescription,
  Divider,
  DialogFooter,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ExclamationFillIcon,
} from "@orderly.network/ui";

const meta: Meta<typeof Dialog> = {
  title: "Base/Dialog/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  subcomponents: { DialogContent, DialogTitle }, //👈
  argTypes: {
    size: {
      control: {
        type: "inline-radio",
      },
      options: ["sm", "md", "lg", "xl"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
        </DialogHeader>
        <Divider />
        <DialogBody>Dialog Content</DialogBody>
        <DialogDescription>
          Anyone who has this link will be able to view this.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  ),
  args: {
    open: true,
  },
};

export const Size: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogContent size={args.size}>
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
        </DialogHeader>
        <Divider />
        <DialogBody>Dialog Content</DialogBody>
        <DialogDescription>
          Anyone who has this link will be able to view this.
        </DialogDescription>
      </DialogContent>
    </Dialog>
  ),
  args: {
    open: true,
  },
};

export const NoTitle: Story = {
  render: (args) => {
    return (
      <Dialog {...args}>
        <DialogContent>
          <DialogBody>Dialog Content</DialogBody>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  },
  args: {
    open: true,
  },
};

// export const CustomHeader: Story = {
//   render: (args) => {
//     return (
//       <Dialog {...args}>
//         <DialogContent>
//           <Tabs defaultValue="account">
//             <DialogHeader>
//               <TabsList>
//                 <TabsTrigger value="account" icon={<ExclamationFillIcon />}>
//                   Account
//                 </TabsTrigger>
//                 <TabsTrigger value="password">Password</TabsTrigger>
//               </TabsList>
//             </DialogHeader>
//             <Divider />
//             <DialogBody>
//               <TabsContent value="account">
//                 Make changes to your account here.
//               </TabsContent>
//               <TabsContent value="password">
//                 Change your password here.
//               </TabsContent>
//             </DialogBody>
//           </Tabs>
//         </DialogContent>
//       </Dialog>
//     );
//   },
//   args: {
//     open: true,
//   },
// };

export const Footer: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
        </DialogHeader>
        <Divider />
        <DialogBody>Dialog Content</DialogBody>
        <DialogDescription>
          Anyone who has this link will be able to view this.
        </DialogDescription>
        <DialogFooter>
          <Button>Cancel</Button>
          <Button>Ok</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  args: {
    open: true,
  },
};
