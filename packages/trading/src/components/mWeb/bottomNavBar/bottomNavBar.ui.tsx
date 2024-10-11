import { FC } from "react";
import { Button, Flex, Text } from "@orderly.network/ui";
import { BottomNavBarState } from "./bottomNavBar.script";

export const BottomNavBar: FC<BottomNavBarState> = (props) => {
  return (
    <Flex height={44}>
      <Button
        onClick={() => {
          props.onShowAccountSheet();
        }}
      >
        Account Sheet
      </Button>
      <Button
        onClick={() => {
          props.onShowPortfolioSheet();
        }}
      >
        Portfolio Sheet
      </Button>
    </Flex>
  );
};
