import { useMatch } from "react-router";

export function useIsRwaRoute() {
  // match /:lang/rwa or /:lang/rwa/:symbol
  const match = useMatch("/:lang/rwa/*");
  return Boolean(match);
}
