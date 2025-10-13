import {
  ArrowLeftRightIcon,
  Box,
  ExclamationFillIcon,
  FeeTierIcon,
  TabPanel,
  Tabs,
  TabsBase,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@kodiak-finance/orderly-ui";
import type { StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Base/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Box r={"md"} intensity={600} p={2}>
        <Story />
      </Box>
    ),
  ],
  // tags: ['autodocs'],
  argTypes: {
    variant: {
      control: {
        type: "inline-radio",
      },
      options: ["text", "contained"],
    },
    size: {
      control: {
        type: "inline-radio",
      },
      options: ["sm", "md", "lg", "xl"],
    },
  },
  // args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <TabsBase defaultValue="account" className="oui-w-[400px]" {...args}>
        <TabsList variant={args.variant} size={args.size}>
          <TabsTrigger value="account" variant={args.variant} size={args.size}>
            Account
          </TabsTrigger>
          <TabsTrigger value="password" variant={args.variant} size={args.size}>
            Password
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          Make changes to your account here.
        </TabsContent>
        <TabsContent value="password">Change your password here.</TabsContent>
      </TabsBase>
    );
  },
  args: {
    size: "sm",
  },
};

export const Icon: Story = {
  render: (args) => {
    return (
      <TabsBase defaultValue="account" className="oui-w-[400px]" {...args}>
        <TabsList variant={args.variant} size={args.size}>
          <TabsTrigger
            value="account"
            icon={<ExclamationFillIcon />}
            variant={args.variant}
            size={args.size}
          >
            Account
          </TabsTrigger>
          <TabsTrigger value="password" variant={args.variant} size={args.size}>
            Password
          </TabsTrigger>
        </TabsList>

        <Box p={2}>
          <TabsContent value="account">
            Make changes to your account here.
          </TabsContent>
          <TabsContent value="password">Change your password here.</TabsContent>
        </Box>
      </TabsBase>
    );
  },
};

export const Simple: Story = {
  render: (args) => {
    return (
      <Tabs
        defaultValue="account"
        {...args}
        variant={args.variant}
        size={args.size}
      >
        <TabPanel
          value="account"
          title="Deposits & Withdrawals"
          icon={<ArrowLeftRightIcon />}
        >
          Deposits & Withdrawals
        </TabPanel>
        <TabPanel value="password" title="Funding" icon={<FeeTierIcon />}>
          Funding
        </TabPanel>
        <TabPanel value="destribution" title="Distribution">
          Distribution
        </TabPanel>
      </Tabs>
    );
  },
};
