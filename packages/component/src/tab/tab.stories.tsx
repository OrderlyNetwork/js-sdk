import type { Meta, StoryObj } from "@storybook/react";

import { Tabs, TabPane, TabList, useTab } from ".";
import { useState } from "react";
import { TabItem } from "./tabList";

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  title: "Base/Tabs",
  argTypes: {
    onTabChange: { action: "tabChange" },
  },
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabPane title="Tab 1" value="1">
        Tab 1
      </TabPane>
      <TabPane title="Tab 2" value="2">
        Tab 2
      </TabPane>
    </Tabs>
  ),
  args: {
    value: "1",
  },
};

export const State: Story = {
  render: () => {
    const [value, setValue] = useState("1");
    return (
      <Tabs value={value} onTabChange={(value) => setValue(value)}>
        <TabPane title="Tab 1" value="1">
          Tab 1
        </TabPane>
        <TabPane title="Tab 2" value="2">
          Tab 2
        </TabPane>
      </Tabs>
    );
  },
};

export const TabHeader: Story = {
  render: () => {
    const [value, setValue] = useState("1");
    return (
      <TabList
        tabs={[
          { title: "Tab1", value: "1" },
          { title: "Tab2", value: "2" },
          { title: "Long title", value: "3" },
        ]}
        value={value}
        onTabChange={(value) => setValue(value)}
      />
    );
  },
};

export const Dsibaled: Story = {
  render: () => {
    const [value, setValue] = useState("1");
    return (
      <TabList
        tabs={[
          { title: "Tab1", value: "1" },
          { title: "Tab2", value: "2" },
          { title: "Tab3", value: "3" },
          { title: "Disabled Tab", value: "4", disabled: true },
        ]}
        value={value}
        onTabChange={(value) => setValue(value)}
      />
    );
  },
};

export const ExtraNode: Story = {
  render: () => {
    const [value, setValue] = useState("1");
    return (
      <Tabs
        value={value}
        onTabChange={(value) => setValue(value)}
        tabBarExtra={({ toggleContentVisible, contentVisible }) => (
          <button
            className="border px-2 bg-slate-100"
            onClick={() => {
              toggleContentVisible();
            }}
          >
            {`${contentVisible ? "Close" : "Open"}`}
          </button>
        )}
      >
        <TabPane title="Tab 1" value="1">
          <div className="bg-green-200 h-[300px]">Tab 1</div>
        </TabPane>
        <TabPane title="Tab 2" value="2">
          Tab 2
        </TabPane>
      </Tabs>
    );
  },
};
