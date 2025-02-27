import { FC } from "react";
import { TitleReturns } from "./title.script";

export const Title: FC<TitleReturns> = (props) => {
  return (
    <div
      id="oui-affiliate-home-title"
      className="oui-text-3xl md:oui-text-3xl lg:oui-text-4xl xl:oui-text-5xl oui-font-bold oui-text-center"
    >
      <span dangerouslySetInnerHTML={{ __html: "Earn more as a " }} />
      <span
        dangerouslySetInnerHTML={{ __html: ` ${props.gradientTitle}` }}
        className="oui-gradient-brand oui-text-transparent oui-bg-clip-text"
        style={{
          // @ts-ignore
          '--oui-gradient-angle': "270deg"
        }}
      />
      <span dangerouslySetInnerHTML={{ __html: " affiliate" }} />
    </div>
  );
};
