import { createContext, FC, PropsWithChildren, useState } from "react";

interface ColorContextState {
  currentColor: string | null;
  setCurrentColor: (color: string | null) => void;
}

export const ColorContext = createContext({} as ColorContextState);

export const ColorProvider: FC<PropsWithChildren> = (props) => {
  const [currentColor, setCurrentColor] = useState<string | null>(null);

  return (
    <ColorContext.Provider value={{ currentColor, setCurrentColor }}>
      {props.children}
    </ColorContext.Provider>
  );
};
