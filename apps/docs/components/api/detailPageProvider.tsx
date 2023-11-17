import { FC, PropsWithChildren, createContext } from "react";

export interface DetailsPageContextState {
  moduleName: string;
  slug: string;
  type: string;
}

export const DetailsPageContext = createContext({} as DetailsPageContextState);

interface Props {
  slug: string;
  type: string;
}

export const DetailsPageProvider: FC<PropsWithChildren<Props>> = (props) => {
  return (
    <DetailsPageContext.Provider
      value={{ moduleName: "", slug: props.slug, type: props.type }}
    >
      {props.children}
    </DetailsPageContext.Provider>
  );
};
