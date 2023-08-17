import { FC, PropsWithChildren, createContext } from "react";

export type StatisticStyleContextValue = {
  labelClassName?: string;
  valueClassName?: string;
};

export const StatisticStyleContext = createContext<StatisticStyleContextValue>(
  {} as StatisticStyleContextValue
);

interface StatisticStyleProviderProps {
  labelClassName?: string;
  valueClassName?: string;
}

export const StatisticStyleProvider: FC<
  PropsWithChildren<StatisticStyleProviderProps>
> = (props) => {
  const { children, ...rest } = props;
  return (
    <StatisticStyleContext.Provider value={{ ...rest }}>
      {props.children}
    </StatisticStyleContext.Provider>
  );
};
