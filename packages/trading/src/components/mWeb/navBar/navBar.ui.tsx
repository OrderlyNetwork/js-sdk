import { FC } from "react";
import { cn, Flex, Text } from "@orderly.network/ui";
import { NavBarState } from "./navBar.script";


export const NavBar: FC<NavBarState & {
    className?: string;
}> = (props) => {

    return (
        <Flex height={54} className={cn("oui-sticky", props.className)}>
            Nav bar
        </Flex>
    );
}
