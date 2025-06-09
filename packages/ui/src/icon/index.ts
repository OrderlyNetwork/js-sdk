import { BaseIcon } from "./baseIcon";
import { CombineIcon } from "./combine";

export type { BaseIconProps } from "./baseIcon";
export { CloseIcon } from "./close";
export { CheckIcon } from "./check";
export { ChevronDownIcon } from "./chevronDown";
export { ChevronUpIcon } from "./chevronUp";
export { CaretUpIcon } from "./caretUp";
export { CaretDownIcon } from "./caretDown";
export { CaretLeftIcon } from "./caretLeft";
export { CaretRightIcon } from "./caretRight";
export { ChevronLeftIcon } from "./chevronLeft";
export { ChevronRightIcon } from "./chevronRight";
export { CalendarMinusIcon } from "./calendarMinus";
export { SettingIcon } from "./setting";
export { SettingFillIcon } from "./settingFill";
export { CloseSquareFillIcon } from "./closeSquareFill";
export { CloseCircleFillIcon } from "./closeCircleFill";
export { CheckedCircleFillIcon } from "./checkCircleFill";
export { CheckedSquareFillIcon } from "./checkSquareFill";
export { CheckSquareEmptyIcon } from "./checkSquareEmpty";
export { PlusIcon } from "./plus";
export { ReduceIcon } from "./reduce";
export { CircleOutlinedIcon } from "./circleOutlined";
export { SquareOutlinedIcon } from "./squareOutlined";
export { ExclamationFillIcon } from "./exclamationFill";
export { QuestionFillIcon } from "./questionFill";
export { ArrowLeftRightIcon } from "./arrowLeftRight";
export { ArrowDownUpIcon } from "./arrowDownUp";
export { ArrowUpSquareFillIcon } from "./arrowUpSquareFill";
export { ArrowDownSquareFillIcon } from "./arrowDownSquareFill";
export { ArrowLeftRightSquareFill } from "./arrowLeftRightSquareFill";
export { FeeTierIcon } from "./feeTier";
export { EditIcon } from "./edit";
export { EyeIcon } from "./eye";
export { ShareIcon } from "./share";
export { EyeCloseIcon } from "./eyeClose";
export { RefreshIcon } from "./refresh";
export { OrderlyIcon } from "./orderly";
export { EsOrderlyIcon } from "./esOrderly";

export { TokenIcon } from "./tokenIcon";
export { ChainIcon } from "./chainIcon";
export { WalletIcon } from "./walletIcon";
export { CalendarIcon } from "./calendar";
export { CopyIcon } from "./copy";
export { ServerFillIcon } from "./serverFill";
export { SortingAscIcon } from "./sortingASCIcon";
export { SortingDescIcon } from "./sortingDESCIcon";
export {
  ArrowUpShortIcon,
  ArrowDownShortIcon,
  ArrowLeftShortIcon,
  ArrowRightShortIcon,
} from "./arrowShort";

export { SortingIcon } from "./sortingIcon";
export { TraderMobileIcon } from "./traderMobileIcon";
export { AffiliateIcon } from "./affiliateIcon";
export { TradingRewardsIcon } from "./tradingRewardsIcon";
export { PortfolioActiveIcon } from "./portfolioActiveIcon";
export { PortfolioInactiveIcon } from "./portfolioInactiveIcon";
export { TradingActiveIcon } from "./tradingActiveIcon";
export { TradingInactiveIcon } from "./tradingInactiveIcon";
export { LeaderboardActiveIcon } from "./leaderboardActive";
export { LeaderboardInactiveIcon } from "./leaderboardInactive";

type IconType = typeof BaseIcon & {
  combine: typeof CombineIcon;
};

const Icon = BaseIcon as IconType;
Icon.combine = CombineIcon;

export { Icon };

export type { IconType };
