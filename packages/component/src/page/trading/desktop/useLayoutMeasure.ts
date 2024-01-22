import { useState } from "react";

export const useLayoutMeasure = () => {
  const [main, setMain] = useState(0);
  const [content, setContent] = useState(0);

  return {
    main: 0,
    content: 0,
    header: 0,
    footer: {
      h: 42,
    },
  };
};
