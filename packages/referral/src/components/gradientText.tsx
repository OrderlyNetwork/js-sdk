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
                {/* {gradientText.split(' ').map((word, index) => {
          if (word === '40%' || word === 'fee') {
            return (
              <span
                key={index}
                className="bg-gradient-to-r from-pink-500 to-blue-500 bg-clip-text text-transparent"
              >
                {word}
              </span>
            );
          } else {
            return <span key={index} className="text-white">{word}</span>;
          }
        })} */}
            </h1>
        </div>
    );

    // return (<span className={cn("orderly-bg-gradient-to-r orderly-from-referral-top orderly-to-referral-bottom orderly-bg-clip-text orderly-text-transparent", props.className)}>
    //     {props?.text || props.children}
    // </span>);
}