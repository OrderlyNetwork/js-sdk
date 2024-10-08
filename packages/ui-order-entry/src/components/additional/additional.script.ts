import { useLocalStorage } from "@orderly.network/hooks";

export const useAdditionalScript = () => {
  const [pined, setPined] = useLocalStorage("pined", true);

  return {
    pined,
    setPined,
  };
};
