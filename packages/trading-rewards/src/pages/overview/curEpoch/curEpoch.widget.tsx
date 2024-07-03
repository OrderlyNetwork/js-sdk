import { FC } from "react";
import { CurEpochUI } from "./curEpoch.ui";
import { useCurEpochScript } from "./curEpoch.script";

export const CurEpochWidget: FC = (props) => {
  const state = useCurEpochScript();
  return <CurEpochUI {...state}/>;
};
