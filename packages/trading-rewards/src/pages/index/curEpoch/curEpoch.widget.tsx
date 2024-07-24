import { FC } from "react";
import { CurEpoch } from "./curEpoch.ui";
import { useCurEpochScript } from "./curEpoch.script";

export const CurEpochWidget: FC = (props) => {
  const state = useCurEpochScript();
  return <CurEpoch {...state}/>;
};
