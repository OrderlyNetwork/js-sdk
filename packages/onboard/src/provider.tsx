import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";

import { initConfig } from "./config";
import { Main } from "./main";

export interface WalletConnectorProviderProps {
  apiKey?: string;
}

export const ConnectorProvider: FC<
  PropsWithChildren<WalletConnectorProviderProps>
> = (props) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initConfig(props.apiKey).then(() => {
      console.log("inited");
      setInitialized(true);
    });
  }, []);

  if (!initialized) return null;

  return <Main>{props.children}</Main>;
};
