
import { EmptyView, NoData } from "@orderly.network/react";
import { FC, useMemo } from "react";

interface EmptyViewProps {
    // visible?: boolean;
    text?: string;
    icon?: React.ReactNode;
    iconSize?: number;
}

export const RefEmptyView: FC<EmptyViewProps> = (props) => {
    const { iconSize = 62 } = props;
    return <EmptyView
        className="orderly-gap-5"
        iconSize={iconSize}
        text={props.text}
        icon={props.icon}
    />;

}