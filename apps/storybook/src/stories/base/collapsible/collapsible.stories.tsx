// import { fn } from 'storybook/test';
import {
  Box,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Flex,
  Text,
} from "@kodiak-finance/orderly-ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Collapsible> = {
  title: "Base/Layout/Collapsible",
  component: Collapsible,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  // argTypes: {
  //   //   backgroundColor: { control: 'color' },
  //   p: {
  //     control: {
  //       type: 'number',
  //       min: 0,
  //       max: 10,
  //       step: 1,
  //     },
  //   }
  // },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    // return <>DSS</>;
    return (
      <Flex direction={"column"}>
        <Text>AAAAA</Text>
        <Collapsible>
          <CollapsibleTrigger>
            <Text className="oui-cursor-pointer">Show more</Text>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Box height={200} className="oui-bg-red-300"></Box>
          </CollapsibleContent>
        </Collapsible>
      </Flex>
    );
  },
};

// export const Size:Story = {
//   args:{
//     className: 'oui-bg-red-100',
//     width: '100px',
//     height: '100px',
//   }
// }