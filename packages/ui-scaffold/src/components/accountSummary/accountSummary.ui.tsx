import React, { FC } from "react";
import {
  Box,
  EyeCloseIcon,
  EyeIcon,
  Flex,
  Popover,
  Text,
} from "@orderly.network/ui";
import { AccountSummaryType } from "./useWidgetBuilder.script";

type AccountSummaryUi = {
  totalValue?: number;
  freeCollateral?: number;
  maxLeverage?: number;
  currentLeverage?: number;
  unrealized_pnl_ROI?: number;
  unrealPnL?: number;
  visible?: boolean;
  onToggleVisibility?: () => void;
  type: AccountSummaryType;
  onTypeChange: (type: AccountSummaryType) => void;
};

export const AccountSummary = (props: AccountSummaryUi) => {
  const { type, ...rest } = props;
  let element;
  switch (props.type) {
    case "freeCollateral":
      element = <FreeCollateral freeCollateral={props.freeCollateral} />;
      break;
    case "unrealPnL":
      element = (
        <UnrealPnL
          unrealPnL={props.unrealPnL}
          unrealized_pnl_ROI={props.unrealized_pnl_ROI}
        />
      );
      break;
    case "currentLeverage":
      element = <CurrentLeverage currentLeverage={props.currentLeverage} />;
      break;
    case "maxLeverage":
      element = <MaxLeverage maxLeverage={props.maxLeverage} />;
      break;
    case "totalValue":
    default:
      element = (
        <TotalValue
          totalValue={props.totalValue}
          onToggleVisibility={props.onToggleVisibility}
          visible={props.visible}
        />
      );
  }

  return (
    <Popover
      content={
        <AccountInfoPopover
          totalValue={rest.totalValue ?? 0}
          freeCollateral={props.freeCollateral ?? 0}
          maxLeverage={props.maxLeverage ?? 0}
          currentLeverage={props.currentLeverage ?? 0}
          unrealized_pnl_ROI={props.unrealized_pnl_ROI ?? 0}
          unrealPnL={props.unrealPnL ?? 0}
          type={props.type}
          onTypeChange={props.onTypeChange}
          visible={props.visible}
        />
      }
      contentProps={{
        onOpenAutoFocus: (event) => event.preventDefault(),
        sideOffset: 12,
      }}
      arrow
    >
      <div className={"oui-cursor-pointer"}>{element}</div>
    </Popover>
  );
};

//----------------- TotalValue -----------------
const TotalValue: FC<{
  totalValue?: number;
  visible?: boolean;
  onToggleVisibility?: () => void;
}> = (props) => {
  const { totalValue = 0, visible = true, onToggleVisibility } = props;
  return (
    <Flex
      direction={"column"}
      gap={0}
      className="oui-text-2xs"
      itemAlign={"start"}
    >
      <Flex gap={1} itemAlign={"center"}>
        <Text intensity={54} className="oui-whitespace-nowrap">
          Total Value
        </Text>
        <button onClick={() => onToggleVisibility?.()}>
          {visible ? (
            <EyeIcon size={12} className="oui-text-primary-light" opacity={1} />
          ) : (
            <EyeCloseIcon
              size={12}
              className="oui-text-primary-light"
              opacity={1}
            />
          )}
        </button>

        <Text intensity={54}>≈</Text>
      </Flex>
      <Text.numeral
        visible={props.visible}
        unit="USDC"
        unitClassName="oui-text-base-contrast-20 oui-ml-1"
        as="div"
      >
        {totalValue}
      </Text.numeral>
    </Flex>
  );
};

//----------------- FreeCollateral -----------------
const FreeCollateral: FC<{
  freeCollateral?: number;
}> = (props) => {
  const { freeCollateral } = props;
  return (
    <Flex
      direction={"column"}
      gap={0}
      className="oui-text-2xs"
      itemAlign={"start"}
    >
      <Box>
        <Text intensity={54} className="oui-whitespace-nowrap">
          Free collateral
        </Text>
      </Box>
      <Text.numeral
        unit="USDC"
        unitClassName="oui-text-base-contrast-20 oui-ml-1"
        as="div"
      >
        {freeCollateral ?? 0}
      </Text.numeral>
    </Flex>
  );
};

//----------------- CurrentLeverage -----------------
const CurrentLeverage: FC<{
  currentLeverage?: number;
}> = (props) => {
  const { currentLeverage } = props;
  return (
    <Flex
      direction={"column"}
      gap={0}
      className="oui-text-2xs"
      itemAlign={"start"}
    >
      <Box>
        <Text intensity={54} className="oui-whitespace-nowrap">
          Current leverage
        </Text>
      </Box>
      <Text.numeral as={"div"} unit="x">
        {currentLeverage ?? 0}
      </Text.numeral>
    </Flex>
  );
};

//----------------- MaxLeverage -----------------
const MaxLeverage: FC<{
  maxLeverage?: number;
}> = (props) => {
  return (
    <Flex
      direction={"column"}
      gap={0}
      className="oui-text-2xs"
      itemAlign={"start"}
    >
      <Box>
        <Text intensity={54} className="oui-whitespace-nowrap">
          Max leverage
        </Text>
      </Box>
      <Text color="primary" as={"div"}>{`${props.maxLeverage ?? 0}x`}</Text>
    </Flex>
  );
};

//----------------- UnrealPnL -----------------
const UnrealPnL: FC<{
  unrealized_pnl_ROI?: number;
  unrealPnL?: number;
}> = (props) => {
  return (
    <Flex
      direction={"column"}
      gap={0}
      className="oui-text-2xs"
      itemAlign={"start"}
    >
      <Box>
        <Text intensity={54} className="oui-whitespace-nowrap">
          Unreal. PnL
        </Text>
      </Box>
      <Text.numeral
        as={"div"}
        coloring
        showIdentifier
        weight={"semibold"}
        suffix={
          <Text.numeral coloring prefix={"("} suffix={")"} rule={"percentages"}>
            {props.unrealized_pnl_ROI ?? 0}
          </Text.numeral>
        }
      >
        {props.unrealPnL ?? 0}
      </Text.numeral>
    </Flex>
  );
};

//----------------- AccountInfoPopover -----------------
const AccountInfoPopover = (props: {
  totalValue: number;
  freeCollateral: number;
  maxLeverage: number;
  currentLeverage: number;
  unrealPnL: number;
  unrealized_pnl_ROI: number;
  type: AccountSummaryType;
  visible?: boolean;
  onTypeChange: (type: AccountSummaryType) => void;
}) => {
  const { totalValue } = props;
  return (
    <Flex
      className={"oui-text-2xs oui-font-semibold"}
      direction={"column"}
      gapY={1}
    >
      <Flex justify={"between"} width={"100%"}>
        <Flex className={"oui-text-base-contrast-54"} gapX={2}>
          <IdentityButton
            active={props.type === "totalValue"}
            onClick={() => props.onTypeChange("totalValue")}
          />
          <span>Total Value</span>
        </Flex>
        <Text.numeral
          visible={props.visible}
          unit="USDC"
          unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
        >
          {totalValue}
        </Text.numeral>
      </Flex>
      <Flex justify={"between"} width={"100%"}>
        <Flex className={"oui-text-base-contrast-54"} gapX={2}>
          <IdentityButton
            active={props.type === "freeCollateral"}
            onClick={() => props.onTypeChange("freeCollateral")}
          />
          <span>Free collateral</span>
        </Flex>
        <Text.numeral
          unit="USDC"
          unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
        >
          {props.freeCollateral}
        </Text.numeral>
      </Flex>
      <Flex justify={"between"} width={"100%"}>
        <Flex className={"oui-text-base-contrast-54"} gapX={2}>
          <IdentityButton
            active={props.type === "unrealPnL"}
            onClick={() => props.onTypeChange("unrealPnL")}
          />
          <span>Unreal. PnL</span>
        </Flex>
        <Text.numeral
          coloring
          showIdentifier
          suffix={
            <Text.numeral
              coloring
              prefix={"("}
              suffix={")"}
              rule={"percentages"}
            >
              {props.unrealized_pnl_ROI}
            </Text.numeral>
          }
        >
          {props.unrealPnL}
        </Text.numeral>
      </Flex>
      <Flex justify={"between"} width={"100%"}>
        <Flex className={"oui-text-base-contrast-54"} gapX={2}>
          <IdentityButton
            active={props.type === "currentLeverage"}
            onClick={() => props.onTypeChange("currentLeverage")}
          />
          <span>Current leverage</span>
        </Flex>
        <Text.numeral unit="x">{props.currentLeverage}</Text.numeral>
      </Flex>
      <Flex justify={"between"} width={"100%"}>
        <Flex className={"oui-text-base-contrast-54"} gapX={2}>
          <IdentityButton
            active={props.type === "maxLeverage"}
            onClick={() => props.onTypeChange("maxLeverage")}
          />
          <span>Max leverage</span>
        </Flex>
        <Text color="primary">{`${props.maxLeverage}x`}</Text>
      </Flex>
    </Flex>
  );
};

const IdentityButton = (props: {
  active: boolean;
  onClick: React.MouseEventHandler;
}) => {
  return (
    <button onClick={props.onClick}>
      {props.active ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M7.506.977a.56.56 0 0 0-.365.16C6.367 1.88 6.13 2.5 6.413 3.348c-.661.506-1.078.63-1.903.63-1.127 0-1.863.137-2.364.637v.016a1.187 1.187 0 0 0 0 1.686l1.4 1.411-2.385 2.385a.513.513 0 0 0-.015.717.514.514 0 0 0 .719 0l2.394-2.395 1.403 1.396a1.19 1.19 0 0 0 1.687 0h.016c.501-.5.64-1.142.64-2.358 0-.773.16-1.319.64-1.893.924.271 1.462.012 2.22-.746a.5.5 0 0 0 .14-.36c0-.175-.044-.445-.156-.78a4 4 0 0 0-.984-1.577 4 4 0 0 0-1.578-.984C7.95 1.02 7.682.977 7.506.977"
            fill="currentcolor"
            className={"oui-text-primary-light"}
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M7.506.977a.56.56 0 0 0-.365.16C6.367 1.88 6.13 2.5 6.413 3.348c-.661.506-1.078.63-1.903.63-1.127 0-1.863.137-2.364.637v.016a1.187 1.187 0 0 0 0 1.686l1.4 1.411-2.385 2.385a.513.513 0 0 0-.015.717.514.514 0 0 0 .719 0l2.394-2.395 1.403 1.396a1.19 1.19 0 0 0 1.687 0h.016c.501-.5.64-1.142.64-2.358 0-.773.16-1.319.64-1.893.924.271 1.462.012 2.22-.746a.5.5 0 0 0 .14-.36c0-.175-.044-.445-.156-.78a4 4 0 0 0-.984-1.577 4 4 0 0 0-1.578-.984C7.95 1.02 7.682.977 7.506.977m.193 1.027c.531.098 1.066.45 1.447.83.381.382.706.848.84 1.459-.477.458-.77.494-1.247.243a.5.5 0 0 0-.583.087c-.91.91-1.15 1.736-1.15 2.85 0 .97-.057 1.33-.36 1.655-.085.092-.203.078-.281 0L2.849 5.615a.18.18 0 0 1-.012-.255c.178-.217.576-.386 1.669-.386 1.306.001 2-.335 2.859-1.14a.5.5 0 0 0 .094-.578c-.257-.513-.217-.784.24-1.252"
            fill="currentcolor"
          />
        </svg>
      )}
    </button>
  );
};
