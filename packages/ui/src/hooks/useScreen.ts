import { useMediaQuery } from "./useMediaQuery";

export function useScreen() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return {
    isMobile,
    isDesktop: !isMobile,
  };
}
