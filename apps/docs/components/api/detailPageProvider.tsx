import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export interface DetailsPageContextState {
  moduleName: string;
  setModuleName: (moduleName: string) => void;
  slug: string;
  type: string;

  apiName: string;
  setApiName: (apiName: string) => void;
}

export const DetailsPageContext = createContext({} as DetailsPageContextState);

interface Props {
  slug: string;
  type: string;
  moduleName?: string;
  apiName?: string;
}

export const DetailsPageProvider: FC<PropsWithChildren<Props>> = (props) => {
  const [moduleName, setModuleName] = useState(props.moduleName!);
  const [apiName, setApiName] = useState(props.apiName!);

  // console.log("------DetailsPageProvider-------", props);

  useEffect(() => {
    setModuleName(moduleName);
  }, [props.moduleName]);

  useEffect(() => {
    setApiName(apiName);
  }, [props.apiName]);

  return (
    <DetailsPageContext.Provider
      value={{
        moduleName,
        setModuleName,
        slug: props.slug,
        type: props.type,
        apiName,
        setApiName,
      }}
    >
      {props.children}
    </DetailsPageContext.Provider>
  );
};

export function useDetailsPageContext() {
  return useContext(DetailsPageContext);
}
