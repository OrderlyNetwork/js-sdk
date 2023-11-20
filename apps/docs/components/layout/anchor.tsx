import { LinkIcon } from "lucide-react";
import { FC } from "react";

interface Props {
  name: string;
}

export const Anchor: FC<Props> = (props) => {
  const onClick = () => {
    const target = document.getElementById(props.name);

    if (target) {
      target.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    }
  };
  return (
    <a href={`#${props.name}`} onClick={onClick}>
      <LinkIcon size={14} className="stroke-gray-400 ml-2" />
    </a>
  );
};
