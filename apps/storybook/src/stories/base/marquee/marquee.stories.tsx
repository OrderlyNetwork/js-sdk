import { Marquee } from "@kodiak-finance/orderly-ui";
import type { Meta, StoryObj } from "@storybook/react";

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
A flexible marquee component built on top of Embla Carousel with auto-scroll functionality.

## Features
- **Embla Carousel integration**: Full access to embla carousel options
- **Auto-scroll plugin**: Configurable auto-scrolling behavior
- **Multiple directions**: forward/backward with axis control (x/y)
- **Customizable speed**: Control scrolling speed in pixels per second
- **Hover pause**: Optional pause on mouse hover
- **TypeScript support**: Full type safety with generics
- **Responsive**: Automatically adjusts to container size

## Usage
\`\`\`tsx
<Marquee
  data={yourData}
  renderItem={(item, index) => <YourComponent key={index} item={item} />}
  carouselOptions={{
    loop: true,
    align: "start",
    axis: "x"
  }}
  autoScrollOptions={{
    speed: 1,
    direction: "forward",
    stopOnMouseEnter: true
  }}
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
    carouselOptions: {
      description: "Embla carousel configuration options",
      control: false,
    },
    autoScrollOptions: {
      description: "Auto-scroll plugin configuration options",
      control: false,
    },
    className: {
      description: "Additional CSS classes",
      control: { type: "text" },
    },
  },
  args: {
    carouselOptions: {
      loop: true,
      align: "start",
      axis: "x",
    },
    autoScrollOptions: {
      speed: 1,
      direction: "forward",
      stopOnMouseEnter: true,
    },
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
    carouselOptions: {
      loop: true,
      align: "start",
      axis: "x",
    },
    autoScrollOptions: {
      speed: 1,
      direction: "forward",
      stopOnMouseEnter: true,
    },
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
    carouselOptions: {
      loop: true,
      align: "start",
      axis: "x",
    },
    autoScrollOptions: {
      speed: 1,
      direction: "forward",
      stopOnMouseEnter: true,
    },
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
