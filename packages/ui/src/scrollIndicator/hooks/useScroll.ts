import { useEffect, useRef, useState } from "react";

export function useScroll() {
  const [leadingVisible, setLeadingVisible] = useState(false);
  const [tailingVisible, setTailingVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      setLeadingVisible(container.scrollLeft > 0);
      setTailingVisible(
        container.scrollLeft + container.clientWidth < container.scrollWidth
      );
    };

    setTimeout(() => {
      handleScroll();
    }, 0);

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const onScoll = (direction: string) => {
    if (direction === "left") {
      containerRef.current?.scrollBy({ left: -100, behavior: "smooth" });
    } else {
      containerRef.current?.scrollBy({ left: 100, behavior: "smooth" });
    }
  };

  return { containerRef, leadingVisible, tailingVisible, onScoll };
}
