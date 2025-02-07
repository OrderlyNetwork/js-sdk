import { useEffect, useRef, useState } from "react";

export function useScroll() {
  const [leadingVisible, setLeadingVisible] = useState(false);
  const [tailingVisible, setTailingVisible] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      setLeadingVisible(container.scrollLeft > 0);
      setTailingVisible(
        container.scrollLeft + container.clientWidth < container.scrollWidth
      );
    };

    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          handleScroll();
        }
      });
    });

    const container = containerRef.current;
    container.addEventListener("scroll", handleScroll);
    intersectionObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      intersectionObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
        }
      });
    });

    intersectionObserver.observe(containerRef.current);

    return () => {
      intersectionObserver.disconnect();
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
