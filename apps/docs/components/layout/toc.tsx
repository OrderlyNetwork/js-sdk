import { FC } from "react";
import { Indexes } from "../api/indexes";
import Link from "next/link";
import { TypeIcon } from "../api/typeIcon";
import { TOCSection } from "./tocSection";

interface Props {
  doc: any;
}

export const TOC: FC<Props> = (props) => {
  const { doc } = props;
  return (
    <div>
      <TOCSection data={doc.properties} />
    </div>
  );
};
