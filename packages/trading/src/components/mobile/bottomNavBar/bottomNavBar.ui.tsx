import { FC } from "react";
import { Button, Flex, Text } from "@orderly.network/ui";
import { BottomNavBarState } from "./bottomNavBar.script";

export const BottomNavBar: FC<BottomNavBarState> = (props) => {
  return (
    <Flex height={64} className="oui-bg-base-9" gap={1} justify={"center"}>
      <Button
        size="sm"
        onClick={() => {
          props.onShowAccountSheet();
        }}
      >
        Account Sheet
      </Button>
      <Button
        size="sm"
        onClick={() => {
          props.onShowPortfolioSheet();
        }}
      >
        Portfolio Sheet
      </Button>
    </Flex>
  );
};
