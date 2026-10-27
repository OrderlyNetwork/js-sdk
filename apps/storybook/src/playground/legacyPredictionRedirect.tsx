import { Navigate, useLocation } from "react-router";
import { migratePredictionPath } from "./navigationPaths";

export function LegacyPredictionRedirect() {
  const { pathname, search, hash } = useLocation();
  return (
    <Navigate
      to={`${migratePredictionPath(pathname)}${search}${hash}`}
      replace
    />
  );
}
