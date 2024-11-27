import { FC } from "react";
import {
  Box,
  Button,
  ChainIcon,
  Divider,
  EyeCloseIcon,
  EyeIcon,
  Flex,
  Text,
} from "@orderly.network/ui";
import { BottomNavBarState } from "./bottomNavBar.script";
import { ChainWidget } from "./chain";
import { AccountWidget } from "./account";
import { BalanceWidget } from "./balance";

export const BottomNavBar: FC<BottomNavBarState> = (props) => {
  return (
    <div className="oui-bg-base-9 oui-border-t oui-border-line-4">
      <Flex
        height={64}
        gap={1}
        justify={"between"}
        itemAlign={"center"}
        className=" oui-px-[14px] oui-pt-[7px] "
        // style={{
        //   height: "calc(64px + env(safe-area-inset-bottom))"
        // }}
      >
        <BalanceWidget />

        <Flex gap={2}>
          {!props.wrongNetwork && <ChainWidget />}
          <AccountWidget />
        </Flex>
      </Flex>
      <div className="oui-h-[env(safe-area-inset-bottom)]" />
    </div>
  );
};
