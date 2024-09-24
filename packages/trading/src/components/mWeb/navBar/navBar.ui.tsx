import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { NavBarState } from "./navBar.script";


export const NavBar: FC<NavBarState> = (props) => {

    return (
        <Flex height={54} className="oui-sticky">
            Nav bar
        </Flex>
    );
}
