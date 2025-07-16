import type { Meta, StoryObj } from "@storybook/react-vite";
// import { fn } from 'storybook/test';
import {
  Icon,
  Box,
  CheckIcon,
  CheckedCircleFillIcon,
  CheckedSquareFillIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CloseIcon,
  CloseCircleFillIcon,
  CloseSquareFillIcon,
  Flex,
  ArrowDownUpIcon,
  CaretDownIcon,
  CaretUpIcon,
  SettingIcon,
  SettingFillIcon,
  ArrowUpSquareFillIcon,
  ArrowDownShortIcon,
  CopyIcon,
  EditIcon,
  EyeCloseIcon,
  CheckSquareEmptyIcon,
  CircleOutlinedIcon,
  SquareOutlinedIcon,
  ExclamationFillIcon,
  QuestionFillIcon,
  ArrowLeftRightIcon,
  ArrowDownSquareFillIcon,
  FeeTierIcon,
  EyeIcon,
  ShareIcon,
  RefreshIcon,
  TokenIcon,
  ChainIcon,
  CalendarIcon,
  ServerFillIcon,
  SortingAscIcon,
  SortingDescIcon,
  ArrowUpShortIcon,
  ArrowLeftShortIcon,
  ArrowRightShortIcon,
  SortingIcon,
  CaretLeftIcon,
  PlusIcon,
  CaretRightIcon,
} from "@orderly.network/ui";

const meta: Meta<typeof Icon> = {
  title: "Base/Icon/Icons",
  component: Icon,
  parameters: {
    layout: "centered",
  },
  // tags: ['autodocs'],
  argTypes: {
    //   backgroundColor: { control: 'color' },
    color: {
      control: {
        type: "inline-radio",
      },
      options: ["primary", "success", "danger", "warning", "white", "black"],
    },
    opacity: {
      control: {
        type: "range",
        min: 0,
        max: 1,
        step: 0.1,
      },
    },

    size: {
      control: {
        type: "number",
        min: 0,
        step: 1,
      },
    },
  },
  args: {
    //   p: 5,
    // py: 2,
    color: "primary",
    opacity: 1,
    size: 24,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Icons: Story = {
  render: (args) => {
    return (
      <Box width={"800px"} height={"600px"}>
        <Flex gap={3} wrap={"wrap"}>
          <CloseIcon {...args} />
          <CheckIcon {...args} />
          <ChevronDownIcon {...args} />
          <ChevronUpIcon {...args} />
          <CaretUpIcon {...args} />
          <CaretDownIcon {...args} />
          <CaretLeftIcon {...args} />
          <CaretRightIcon {...args} />
          <ChevronLeftIcon {...args} />
          <ChevronRightIcon {...args} />
          <SettingIcon {...args} />
          <SettingFillIcon {...args} />
          <CloseSquareFillIcon {...args} />
          <CloseCircleFillIcon {...args} />
          <CheckedCircleFillIcon {...args} />
          <CheckedSquareFillIcon {...args} />
          <CheckSquareEmptyIcon {...args} />
          <PlusIcon {...args} />
          <CircleOutlinedIcon {...args} />
          <SquareOutlinedIcon {...args} />
          <ExclamationFillIcon {...args} />
          <QuestionFillIcon {...args} />
          <ArrowLeftRightIcon {...args} />
          <ArrowDownUpIcon {...args} />
          <ArrowUpSquareFillIcon {...args} />
          <ArrowDownSquareFillIcon {...args} />
          <FeeTierIcon {...args} />
          <EditIcon {...args} />
          <EyeIcon {...args} />
          <ShareIcon {...args} />
          <EyeCloseIcon {...args} />
          <RefreshIcon {...args} />
          <CalendarIcon {...args} />
          <CopyIcon {...args} />
          <ServerFillIcon {...args} />
          <SortingAscIcon {...args} />
          <SortingDescIcon {...args} />
          <ArrowUpShortIcon {...args} />
          <ArrowDownShortIcon {...args} />
          <ArrowLeftShortIcon {...args} />
          <ArrowRightShortIcon {...args} />
          <SortingIcon {...args} />
        </Flex>
      </Box>
    );
  },
};
