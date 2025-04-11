import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { useObserverElement, useScreen } from "@orderly.network/ui";

export const useScaffoldScript = () => {
  const { restrictedInfo, showAnnouncement } = useAppContext();

  const [topNavbarRef, topNavbarHeight] = useRefAndHeight(48);
  const [footerRef, footerHeight] = useRefAndHeight(29);
  const [announcementRef, announcementHeight] = useRefAndHeight(0, [
    showAnnouncement,
  ]);

  const [expand, setExpand] = useLocalStorage(
    "orderly_scaffold_expanded",
    true
  );

  const { isMobile } = useScreen();

  return {
    topNavbarRef,
    footerRef,
    topNavbarHeight,
    footerHeight,
    announcementRef,
    announcementHeight,
    restrictedInfo,
    expand,
    setExpand,
    isMobile,
  };
};

const useRefAndHeight = (defaultHeight: number, deps: any[] = []) => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(defaultHeight);

  useObserverElement(ref.current, (entry) => {
    setHeight(entry.contentRect.height);
  });

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const height = ref.current?.getBoundingClientRect().height;
    setHeight(height!);
  }, [ref, ...deps]);

  return [ref, height] as const;
};
