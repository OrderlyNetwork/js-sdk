import { useEffect, useState } from "react";

export const useCSSVariable = (names?: string[]) => {
  const [variables, setVariables] = useState(() =>
    getCSSVariableValue(names ?? [])
  );

  function getCSSVariableValue(names: string[]) {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    if (names) {
      const obj = names.reduce((acc: any, name: string, index: number) => {
        acc[name] = styles.getPropertyValue(name);
        return acc;
      }, {});

      return obj;
    }
    return {};
  }

  useEffect(() => {
    if (names?.length === 0) return;

    const styleObserver = new MutationObserver((mutations) => {
      console.info("document.documentElement.style changed");
      getCSSVariableValue(names!);
    });

    styleObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      styleObserver.disconnect();
    };
  }, [names]);

  return variables as Partial<{ [key: string]: string }>;
};
