import { FC } from "react";
import { TitleReturns } from "./title.script";
import { Box, Flex, Text } from "@orderly.network/ui";


export const TitleUI: FC<TitleReturns> = (props) => {

    return (
        <div className="oui-text-[28px] md:oui-text-[32px] lg:oui-text-[36px] xl:oui-text-[48px] oui-font-bold oui-text-center">
            <span dangerouslySetInnerHTML={{ __html: 'Earn more as a ' }}/>
            <span dangerouslySetInnerHTML={{__html: ` ${props.gradientTitle}`}} className="oui-gradient-brand oui-text-transparent oui-bg-clip-text" />
            <span dangerouslySetInnerHTML={{ __html: ' affiliate' }} />
        </div>
    );
}
