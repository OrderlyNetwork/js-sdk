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
    <Flex
      height={64}
      className="oui-bg-base-9 oui-px-[14px] oui-pt-[14px]"
      gap={1}
      justify={"between"}
    >
      <BalanceWidget />

      <Flex>
        <ChainWidget />
        <AccountWidget />
      </Flex>
    </Flex>
  );
};
