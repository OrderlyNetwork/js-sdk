import { BaseIcon } from "./baseIcon";
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
export { SettingIcon } from "./setting";
export { SettingFillIcon } from "./settingFill";
export { CloseSquareFillIcon } from "./closeSquareFill";
export { CloseCircleFillIcon } from "./closeCircleFill";
export { CheckedCircleFillIcon } from "./checkCircleFill";
export { CheckedSquareFillIcon } from "./checkSquareFill";
export { CheckSquareEmptyIcon } from "./checkSquareEmpty";
export { PlusIcon } from "./plus";
export { CircleOutlinedIcon } from "./circleOutlined";
export { SquareOutlinedIcon } from "./squareOutlined";
export { ExclamationFillIcon } from "./exclamationFill";
export { QuestionFillIcon } from "./questionFill";
export { ArrowLeftRightIcon } from "./arrowLeftRight";
export { ArrowDownUpIcon } from "./arrowDownUp";
export { ArrowUpSquareFillIcon } from "./arrowUpSquareFill";
export { ArrowDownSquareFillIcon } from "./arrowDownSquareFill";
export { FeeTierIcon } from "./feeTier";
export { EditIcon } from "./edit";
export { EyeIcon } from "./eye";
export { EyeCloseIcon } from "./eyeClose";

export { CoinIcon } from "./coinIcon";
export { ChainIcon } from "./chainIcon";
export { WalletIcon } from "./walletIcon";
export { CalendarIcon } from "./calendar";
export { CopyIcon } from "./copy";

import { CombineIcon } from "./combine";

type IconType = typeof BaseIcon & {
  combine: typeof CombineIcon;
};

const Icon = BaseIcon as IconType;
Icon.combine = CombineIcon;

export { Icon };

export type { IconType };
