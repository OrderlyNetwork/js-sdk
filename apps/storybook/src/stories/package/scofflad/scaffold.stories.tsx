import type { Meta, StoryObj } from "@storybook/react-vite";
import { Flex, Text } from "@veltodefi/ui";
import {
  AccountMenuWidget,
  AccountSummaryWidget,
  ChainMenuWidget,
  Scaffold,
} from "@veltodefi/ui-scaffold";
import { leftSidebarMenus } from "./data";

const meta = {
  title: "Package/ui-scaffold/Scaffold",
  component: Scaffold,
  subComponents: {
    AccountMenuWidget,
    AccountSummaryWidget,
    ChainMenuWidget,
    // ChainMenu,
  },
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {},
  // args: {
  //   leftSideProps: {
  //     items: leftSidebarMenus,
  //     className:
  //       "oui-border oui-border-line-12 oui-m-4 oui-p-3 oui-rounded-lg oui-h-[calc(100vh_-_180px)]",
  //   },
  //   children: (
  //     <Flex m={3} justify={"center"} height={"400px"} intensity={500} r={"lg"}>
  //       <Text size={"3xl"} intensity={54}>
  //         Content
  //       </Text>
  //     </Flex>
  //   ),
  // },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    leftSideProps: {
      items: leftSidebarMenus,
      className:
        "oui-border oui-border-line-12 oui-m-4 oui-p-3 oui-rounded-lg oui-h-[calc(100vh_-_180px)]",
    },
    children: (
      <Flex m={3} justify={"center"} height={"400px"} intensity={500} r={"lg"}>
        <Text size={"3xl"} intensity={54}>
          Content
        </Text>
      </Flex>
    ),
  },
};

export const NoLeftSidebar: Story = {
  args: {
    children: (
      <Flex m={3} justify={"center"} height={"400px"} intensity={500} r={"lg"}>
        <Text size={"3xl"} intensity={54}>
          Content
        </Text>
      </Flex>
    ),
  },
};
