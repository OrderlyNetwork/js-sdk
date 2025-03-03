import { FC } from "react";
import {
  Button,
  Divider,
  EyeCloseIcon,
  EyeIcon,
  Flex,
  Text,
} from "@orderly.network/ui";
import { BalanceState } from "./balance.script";
import { commifyOptional } from "@orderly.network/utils";

export const Balance: FC<BalanceState> = (props) => {
  return (
    <Flex gap={3}>
      <Flex
        direction={"column"}
        itemAlign={"start"}
        className="oui-text-[11px] oui-cursor-pointer"
        onClick={(e) => {
          props.onShowPortfolioSheet();
        }}
      >
        <Flex>
          <Text intensity={54}>Total value</Text>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              props.setHideAssets(!props.hideAssets);
            }}
            className="oui-px-1"
          >
            {props.hideAssets ? (
              <EyeIcon
                color="primary"
                opacity={1}
                size={16}
                className="oui-text-primary-light"
              />
            ) : (
              <EyeCloseIcon
                color="primary"
                opacity={1}
                size={16}
                className="oui-text-primary-light"
              />
            )}
          </button>
          <MaybeEqual />
        </Flex>
        <Text.numeral
          suffix={<Text intensity={20}>&nbsp;USDC</Text>}
          dp={2}
          visible={!props.hideAssets}
        >
          {props.canTrade ? props.total ?? "--" : "--"}
        </Text.numeral>
      </Flex>
      {props.canTrade && (
        <Divider direction="vertical" className="oui-h-[26px]" />
      )}
      {props.canTrade && (
        <Button
          variant={"outlined"}
          onClick={(e) => {
            props.onShowPortfolioSheet();
          }}
          className="oui-h-[28px] oui-text-2xs oui-text-primary-light oui-border-primary-light"
        >
          {commifyOptional(props.currentLeverage, { fix: 2 }) + "x"}
        </Button>
      )}
    </Flex>
  );
};

const MaybeEqual = () => {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.456 3.48a3.5 3.5 0 0 0 .431-.567 9 9 0 0 0 .361-.654l-.648-.66-.107.185q-.071.12-.142.244a3 3 0 0 1-.27.396 1.4 1.4 0 0 1-.318.29.67.67 0 0 1-.38.114q-.307 0-.666-.194t-.742-.42q-.383-.227-.777-.42a1.7 1.7 0 0 0-.771-.194q-.401.001-.72.154a2.1 2.1 0 0 0-.57.404 2.6 2.6 0 0 0-.43.574 5 5 0 0 0-.307.646l.649.66q.165-.437.464-.833.298-.395.742-.396.347 0 .7.194.354.193.721.42.37.227.763.42.396.195.826.195.374.001.665-.155.29-.151.526-.404m.352 2.941a3.5 3.5 0 0 0 .431-.566q.196-.315.361-.654l-.648-.66-.107.184-.142.244a3 3 0 0 1-.27.396 1.4 1.4 0 0 1-.318.29.67.67 0 0 1-.38.115q-.307 0-.666-.195-.36-.193-.742-.42-.383-.226-.778-.42a1.7 1.7 0 0 0-.77-.194q-.401.001-.72.154a2.1 2.1 0 0 0-.57.405 2.6 2.6 0 0 0-.43.574 5 5 0 0 0-.307.646l.649.66q.165-.437.464-.833.297-.395.742-.396.347 0 .7.194.354.193.721.42.369.226.763.42.396.194.826.194.374.001.665-.154.29-.152.526-.404"
        fill="#fff"
        fillOpacity=".54"
      />
    </svg>
  );
};
