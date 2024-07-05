import { FC } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { SummaryReturns } from "./summary.script";


export const SummaryUI: FC<SummaryReturns> = () => {

    return (
        <Flex r={"2xl"} p={6} width={"100%"} className="oui-bg-base-9">
            <Flex direction={"row"} justify={"between"}>
                <Text className="oui-text-lg">Summary</Text>
                
            </Flex>
        </Flex>
    );
}
