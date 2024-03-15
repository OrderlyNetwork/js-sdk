import { cn } from "@orderly.network/react";
import { FC, PropsWithChildren } from "react";

export type GradientTextItem = {
    text: string,
    gradient?: boolean,
};

export const GradientText: FC<PropsWithChildren<{ texts: GradientTextItem[], className?: string }>> = (props) => {

    const { texts, className } = props;

    return (
        <div className={className}>
            <h1>
                {texts.map((item, index) => {
                    if (item.gradient) {
                        return (<span key={index} className="orderly-bg-gradient-to-r orderly-from-referral-top orderly-to-referral-bottom orderly-bg-clip-text orderly-text-transparent">
                            {item.text}
                        </span>);
                    }

                    return (<span key={index}>{item.text}</span>)
                })}

            </h1>
        </div>
    );
}