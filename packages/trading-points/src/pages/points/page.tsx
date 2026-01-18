import { FC } from "react";
import { PointsProvider } from "../../hooks/usePointsData";
import Main from "./main";

export type RouteOption = {
  href: string;
  name: string;
  scope?: string;
  target?: string;
};

export type PointSystemPageProps = {
  onRouteChange: (option: RouteOption) => void;
};

export const PointSystemPage: FC<PointSystemPageProps> = (props) => {
  return (
    <PointsProvider>
      <Main onRouteChange={props.onRouteChange} />
    </PointsProvider>
  );
};
