import { createContext, FC, PropsWithChildren, useMemo, useState } from "react";

interface ColorContextState {
  currentColor: string | null;
  setCurrentColor: (color: string | null) => void;
}

export const ColorContext = createContext({} as ColorContextState);

export const ColorProvider: FC<PropsWithChildren> = (props) => {
  const [currentColor, setCurrentColor] = useState<string | null>(null);
  const memoizedValue = useMemo<ColorContextState>(
    () => ({ currentColor, setCurrentColor }),
    [currentColor, setCurrentColor],
  );
  return (
    <ColorContext.Provider value={memoizedValue}>
      {props.children}
    </ColorContext.Provider>
  );
};
