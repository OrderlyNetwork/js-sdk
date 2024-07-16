import { APIManager } from "./apiManager.ui";
import { useApiManagerScript } from "./apiManager.script";


export const APIManagerWidget = () => {
  const state = useApiManagerScript();
  return <APIManager {...state} />;
};
