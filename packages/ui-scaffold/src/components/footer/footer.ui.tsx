import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { FooterReturns } from "./footer.script";


export const FooterUI: FC<FooterReturns> = (props) => {

    return (
        <Flex direction={"row"} justify={"between"} height={29} className="oui-hide lg:oui-flex oui-border-t-2 oui-border-line-6">
            <Flex></Flex>
            <Flex direction={"row"}>
                <Text></Text>
            </Flex>
        </Flex>
    );
}
