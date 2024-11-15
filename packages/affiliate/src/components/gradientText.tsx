import { Text } from "@orderly.network/ui";
import { FC, PropsWithChildren } from "react";

export type GradientTextItem = {
  text: string;
  gradient?: boolean;
  gradientColor?:
    | "inherit"
    | "brand"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "neutral";
};

export const GradientText: FC<
  PropsWithChildren<{ texts: GradientTextItem[]; className?: string }>
> = (props) => {
  const { texts, className } = props;

  return (
    <div className={className}>
      <h1>
        {texts.map((item, index) => {
          if (item.gradient) {
            return (
              <Text.gradient key={index} color={item.gradientColor}>
                {item.text}
              </Text.gradient>
            );
          }

          return <span key={index}>{item.text}</span>;
        })}
      </h1>
    </div>
  );
};
