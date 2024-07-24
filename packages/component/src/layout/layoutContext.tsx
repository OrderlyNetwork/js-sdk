import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
const KEY = "MARIN_MODULE_PLACE";

type MarginModuleType = "top" | "bottom";

export type LayoutContextState = {
  siderWidth: number;
  headerHeight: number;
  footerHeight: number;
  pageHeaderHeight?: number;
  pageFooterHeight?: number;
  // contentWidth:number;
  setSiderWidth: (width: number) => void;
  setHeaderHeight: (height: number) => void;
  setFooterHeight: (height: number) => void;
  setPageHeaderHeight: (height: number) => void;
  setPageFooterHeight: (height: number) => void;
  isTopLevel?: boolean;
  marginModulePosition: MarginModuleType;
  setMarginModulePosition: (position: MarginModuleType) => void;
};

export const LayoutContext = createContext({} as LayoutContextState);

export const LayoutProvider: FC<PropsWithChildren> = (props) => {
  const context = useContext(LayoutContext);
  const [position, setPosition] = useState<"top" | "bottom">(() => {
    const oldPlace = localStorage.getItem(KEY);
    if (!oldPlace) {
      return "top";
    }
    if (!["top", "bottom"].includes(oldPlace)) {
      localStorage.setItem(KEY, "top");
      return "top";
    }
    return oldPlace as MarginModuleType;
  });
  const isTopLevel = useMemo(() => !context.isTopLevel, []);
  const [siderWidth, setSiderWidth] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [pageHeaderHeight, setPageHeaderHeight] = useState(0);
  const [pageFooterHeight, setPageFooterHeight] = useState(0);
  const changePosition = useCallback(
    (newPosition: MarginModuleType) => {
      localStorage.setItem(KEY, newPosition);
      setPosition(newPosition);
    },
    [setPosition]
  );
  return (
    <LayoutContext.Provider
      value={{
        siderWidth,
        headerHeight: isTopLevel ? headerHeight : context.headerHeight,
        footerHeight: isTopLevel ? footerHeight : context.footerHeight,
        setSiderWidth,
        setHeaderHeight,
        setFooterHeight,
        pageHeaderHeight,
        pageFooterHeight,
        setPageHeaderHeight,
        setPageFooterHeight,
        isTopLevel,
        marginModulePosition: position,
        setMarginModulePosition: changePosition,
      }}
    >
      {props.children}
    </LayoutContext.Provider>
  );
};
