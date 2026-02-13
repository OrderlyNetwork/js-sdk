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
  // New icons
  CalendarMinusIcon,
  ReduceIcon,
  ArrowLeftRightSquareFill,
  ArrowRightUpSquareFillIcon,
  AssetIcon,
  BarChartIcon,
  BattleIcon,
  OrderlyIcon,
  EsOrderlyIcon,
  InfoCircleIcon,
  WalletIcon,
  TraderMobileIcon,
  AffiliateIcon,
  TradingRewardsIcon,
  PortfolioActiveIcon,
  PortfolioInactiveIcon,
  TradingActiveIcon,
  TradingIcon,
  TradingInactiveIcon,
  LeaderboardActiveIcon,
  LeaderboardInactiveIcon,
  MarketsActiveIcon,
  MarketsInactiveIcon,
  EmptyStateIcon,
  VectorIcon,
  SwapHorizIcon,
  PeopleIcon,
  PersonIcon,
  TradingLeftNavIcon,
  VaultsIcon,
  LeftNavVaultsIcon,
  NewsFillIcon,
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

// Icon config: component and name
const iconConfigs = [
  // Base icons
  { component: CloseIcon, name: "CloseIcon" },
  { component: CheckIcon, name: "CheckIcon" },
  { component: ChevronDownIcon, name: "ChevronDownIcon" },
  { component: ChevronUpIcon, name: "ChevronUpIcon" },
  { component: ChevronLeftIcon, name: "ChevronLeftIcon" },
  { component: ChevronRightIcon, name: "ChevronRightIcon" },
  { component: CaretUpIcon, name: "CaretUpIcon" },
  { component: CaretDownIcon, name: "CaretDownIcon" },
  { component: CaretLeftIcon, name: "CaretLeftIcon" },
  { component: CaretRightIcon, name: "CaretRightIcon" },
  { component: SettingIcon, name: "SettingIcon" },
  { component: SettingFillIcon, name: "SettingFillIcon" },
  { component: PlusIcon, name: "PlusIcon" },
  { component: ReduceIcon, name: "ReduceIcon" },

  // Filled icons
  { component: CloseSquareFillIcon, name: "CloseSquareFillIcon" },
  { component: CloseCircleFillIcon, name: "CloseCircleFillIcon" },
  { component: CheckedCircleFillIcon, name: "CheckedCircleFillIcon" },
  { component: CheckedSquareFillIcon, name: "CheckedSquareFillIcon" },
  { component: CheckSquareEmptyIcon, name: "CheckSquareEmptyIcon" },
  { component: CircleOutlinedIcon, name: "CircleOutlinedIcon" },
  { component: SquareOutlinedIcon, name: "SquareOutlinedIcon" },
  { component: ExclamationFillIcon, name: "ExclamationFillIcon" },
  { component: QuestionFillIcon, name: "QuestionFillIcon" },
  { component: InfoCircleIcon, name: "InfoCircleIcon" },

  // Arrow icons
  { component: ArrowLeftRightIcon, name: "ArrowLeftRightIcon" },
  { component: ArrowDownUpIcon, name: "ArrowDownUpIcon" },
  { component: ArrowUpSquareFillIcon, name: "ArrowUpSquareFillIcon" },
  { component: ArrowDownSquareFillIcon, name: "ArrowDownSquareFillIcon" },
  { component: ArrowLeftRightSquareFill, name: "ArrowLeftRightSquareFill" },
  { component: ArrowRightUpSquareFillIcon, name: "ArrowRightUpSquareFillIcon" },
  { component: ArrowUpShortIcon, name: "ArrowUpShortIcon" },
  { component: ArrowDownShortIcon, name: "ArrowDownShortIcon" },
  { component: ArrowLeftShortIcon, name: "ArrowLeftShortIcon" },
  { component: ArrowRightShortIcon, name: "ArrowRightShortIcon" },

  // Feature icons
  { component: FeeTierIcon, name: "FeeTierIcon" },
  { component: EditIcon, name: "EditIcon" },
  { component: EyeIcon, name: "EyeIcon" },
  { component: EyeCloseIcon, name: "EyeCloseIcon" },
  { component: ShareIcon, name: "ShareIcon" },
  { component: RefreshIcon, name: "RefreshIcon" },
  { component: CopyIcon, name: "CopyIcon" },
  { component: CalendarIcon, name: "CalendarIcon" },
  { component: CalendarMinusIcon, name: "CalendarMinusIcon" },
  { component: ServerFillIcon, name: "ServerFillIcon" },
  { component: TokenIcon, name: "TokenIcon" },
  { component: ChainIcon, name: "ChainIcon" },
  { component: WalletIcon, name: "WalletIcon" },

  // Sort icons
  { component: SortingAscIcon, name: "SortingAscIcon" },
  { component: SortingDescIcon, name: "SortingDescIcon" },
  { component: SortingIcon, name: "SortingIcon" },

  // App icons
  { component: OrderlyIcon, name: "OrderlyIcon" },
  { component: EsOrderlyIcon, name: "EsOrderlyIcon" },
  { component: AssetIcon, name: "AssetIcon" },
  { component: BarChartIcon, name: "BarChartIcon" },
  { component: BattleIcon, name: "BattleIcon" },
  { component: TraderMobileIcon, name: "TraderMobileIcon" },
  { component: AffiliateIcon, name: "AffiliateIcon" },
  { component: TradingRewardsIcon, name: "TradingRewardsIcon" },

  // Navigation icons
  { component: PortfolioActiveIcon, name: "PortfolioActiveIcon" },
  { component: PortfolioInactiveIcon, name: "PortfolioInactiveIcon" },
  { component: TradingActiveIcon, name: "TradingActiveIcon" },
  { component: TradingIcon, name: "TradingIcon" },
  { component: TradingInactiveIcon, name: "TradingInactiveIcon" },
  { component: TradingLeftNavIcon, name: "TradingLeftNavIcon" },
  { component: LeaderboardActiveIcon, name: "LeaderboardActiveIcon" },
  { component: LeaderboardInactiveIcon, name: "LeaderboardInactiveIcon" },
  { component: MarketsActiveIcon, name: "MarketsActiveIcon" },
  { component: MarketsInactiveIcon, name: "MarketsInactiveIcon" },
  { component: VaultsIcon, name: "VaultsIcon" },
  { component: LeftNavVaultsIcon, name: "LeftNavVaultsIcon" },

  // Other icons
  { component: EmptyStateIcon, name: "EmptyStateIcon" },
  { component: VectorIcon, name: "VectorIcon" },
  { component: SwapHorizIcon, name: "SwapHorizIcon" },
  { component: PeopleIcon, name: "PeopleIcon" },
  { component: PersonIcon, name: "PersonIcon" },
  { component: NewsFillIcon, name: "NewsFillIcon" },
];

export const Icons: Story = {
  render: (args) => {
    return (
      <Box width={"100%"} height={"800px"} style={{ overflow: "auto" }}>
        <Flex gap={4} wrap={"wrap"} p={4}>
          {iconConfigs.map(({ component: IconComponent, name }) => (
            <Flex
              key={name}
              direction={"column"}
              itemAlign={"center"}
              gap={2}
              p={3}
              className="oui-bg-base-9 oui-rounded-md"
              style={{
                minWidth: "120px",
              }}
            >
              <IconComponent {...(args as any)} />
              {name}
            </Flex>
          ))}
        </Flex>
      </Box>
    );
  },
};
