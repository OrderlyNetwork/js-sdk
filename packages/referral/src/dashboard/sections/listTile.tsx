import { FC } from "react";

export const ListTile: FC<{
    icon: React.ReactNode,
    title: string,
    subtitle: string,
}> = (props) => {

    const { icon, title, subtitle } = props;

    return (<div className="orderly-flex">
        {icon}
        <div>
            <div>{title}</div>
            <div>{subtitle}</div>
        </div>
    </div>);
}