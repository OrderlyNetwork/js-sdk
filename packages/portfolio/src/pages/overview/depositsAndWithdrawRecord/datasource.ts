import { useAssetsHistory } from "@orderly.network/hooks";

const useDataSource = () => {
  const { data } = useAssetsHistory({});

  console.log(data);

  return data;
};

export { useDataSource };
