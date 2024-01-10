import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

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
};

export const LayoutContext = createContext({} as LayoutContextState);

export const LayoutProvider: FC<PropsWithChildren> = (props) => {
  const context = useContext(LayoutContext);
  const isTopLevel = useMemo(() => !context.isTopLevel, []);
  const [siderWidth, setSiderWidth] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [pageHeaderHeight, setPageHeaderHeight] = useState(0);
  const [pageFooterHeight, setPageFooterHeight] = useState(0);

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
      }}
    >
      {props.children}
    </LayoutContext.Provider>
  );
};
