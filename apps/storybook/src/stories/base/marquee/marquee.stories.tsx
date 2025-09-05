import type { Meta, StoryObj } from "@storybook/react";
import { Marquee } from "@orderly.network/ui";

const stringData = [
  "Welcome to Orderly Network",
  "Decentralized Trading Protocol",
  "Built for the Future of Finance",
  "Secure • Fast • Reliable",
  "Join the Revolution",
];

const meta: Meta<typeof Marquee> = {
  title: "Base/Marquee",
  component: Marquee,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A flexible marquee component that supports both continuous and screen-by-screen scrolling modes.

## Features
- **Multiple directions**: left, right, up, down
- **Two modes**: continuous (seamless loop) and screen (item-by-item)
- **Customizable speed**: Control scrolling speed in pixels per second
- **Hover pause**: Optional pause on mouse hover
- **TypeScript support**: Full type safety with generics
- **Responsive**: Automatically adjusts to container size

## Usage
\`\`\`tsx
<Marquee
  data={yourData}
  renderItem={(item, index) => <YourComponent key={index} item={item} />}
  direction="left"
  mode="continuous"
  speed={50}
  pauseOnHover={true}
/>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    data: {
      description: "Array of data items to display in the marquee",
      control: false,
    },
    renderItem: {
      description: "Function to render each item",
      control: false,
    },
    direction: {
      description: "Scroll direction",
      control: { type: "select" },
      options: ["left", "right", "up", "down"],
    },
    mode: {
      description:
        "Scroll mode - continuous for seamless loop, screen for item-by-item",
      control: { type: "select" },
      options: ["continuous", "screen"],
    },
    speed: {
      description: "Scroll speed in pixels per second",
      control: { type: "range", min: 10, max: 200, step: 10 },
    },
    delay: {
      description: "Delay between scrolls in milliseconds (screen mode only)",
      control: { type: "range", min: 0, max: 3000, step: 100 },
    },
    pauseOnHover: {
      description: "Pause scrolling when mouse hovers over the marquee",
      control: { type: "boolean" },
    },
    className: {
      description: "Additional CSS classes",
      control: { type: "text" },
    },
  },
  args: {
    direction: "left",
    mode: "continuous",
    speed: 50,
    delay: 1000,
    pauseOnHover: true,
    className: "",
  },
};

export default meta;
type Story = StoryObj<typeof Marquee>;

type StringStory = StoryObj<typeof Marquee<string>>;

export const CustomStyling: StringStory = {
  args: {
    data: stringData,
    className:
      "oui-border-2 oui-border-dashed oui-border-gray-300 oui-rounded-lg !oui-h-[54px]",
    renderItem: (item: string, index: number) => (
      <div
        key={index}
        className="oui-flex oui-items-center oui-justify-center oui-whitespace-nowrap oui-px-6 oui-py-3 oui-bg-gradient-to-r oui-from-cyan-500 oui-to-blue-500 oui-text-white oui-rounded-full oui-mr-6 oui-shadow-lg oui-transform oui-hover:scale-105 oui-transition-transform"
      >
        <span className="oui-text-lg oui-font-semibold">{item}</span>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Marquee with custom container styling and hover effects on items.",
      },
    },
  },
};

export const Interactive: StringStory = {
  args: {
    data: stringData,
    renderItem: (item: string, index: number) => (
      <div
        key={index}
        className="oui-flex oui-items-center oui-justify-center oui-whitespace-nowrap oui-px-4 oui-py-2 oui-bg-blue-100 oui-text-blue-800 oui-rounded-lg oui-mr-4"
      >
        {item}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive marquee - use the controls below to adjust all properties in real-time.",
      },
    },
  },
};
