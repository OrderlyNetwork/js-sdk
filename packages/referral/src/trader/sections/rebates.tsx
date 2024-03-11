import { Divider, cn } from "@orderly.network/react";
import { RebateList } from "./rebateList";
import { FC } from "react";

export const Rebates: FC<{
    className?: string,
}> = (props) => {

    return (
        <div className={cn("orderly-rounded-lg orderly-p-6 orderly-outline-1 orderly-outline-base-600", props.className)}>
            <div className="orderly-flex orderly-items-center orderly-justify-between">
                <div className="orderly-flex-1 orderly-text-base 2xl:orderly-text-lg">My rebates</div>
                <div className="orderly-text-3xs orderly-text-base-contrast-36">2024-02-01 00:00 UTC</div>
            </div>

            <Divider className="orderly-mt-3"/>
            <RebateList dataSource={[]}/>
        </div>
    );
}

