import { FC } from "react";

interface Props {
  name: string;
}

export const AnchorElement: FC<Props> = (props) => {
  return <a id={props.name} className="scroll-mt-[90px]"></a>;
};
