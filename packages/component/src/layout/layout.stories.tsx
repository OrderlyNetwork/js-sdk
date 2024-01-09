import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Layout } from "./layout";
import { Header } from "./header";
import { Content } from "./content";
import { Sider } from "./sider";

const meta: Meta<typeof Layout> = {
  component: Layout,
  title: "Base/Layout",
};

export default meta;
type Story = StoryObj<typeof Layout>;

export const Default: Story = {
  args: {},
  render: (args) => {
    return (
      <Layout>
        <Sider>Sider</Sider>
        <Layout>
          <Header className="orderly-h-[40px]">Header</Header>
          <Content>Content</Content>
        </Layout>
      </Layout>
    );
  },
};
