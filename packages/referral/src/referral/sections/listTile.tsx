import { FC } from "react";

export const ListTile: FC<{
    icon: React.ReactNode,
    title: string,
    subtitle: string,
}> = (props) => {

    const { icon, title, subtitle } = props;

    return (<div className="orderly-flex orderly-items-center lg:orderly-flex-col xl:orderly-flex-col 2xl:orderly-flex-col lg:orderly-items-center xl:orderly-items-center 2xl:orderly-items-center lg:orderly-text-center xl:orderly-text-center 2xl:orderly-text-center">
        {icon}
        <div className="orderly-flex orderly-ml-3 lg:orderly-ml-0 orderly-flex-col orderly-justify-between orderly-flex-1 lg:orderly-flex-grow orderly-py-1">
            <div className="orderly-text-lg md:orderly-text-[20px] lg:orderly-text-[22px] xl:orderly-text-[22px] 2xl:orderly-text-[24px]">{title}</div>
            <div className="orderly-text-3xs 2xl:orderly-text-xs orderly-mt-1 orderly-text-base-contrast-36">{subtitle}</div>
        </div>
    </div>);
}