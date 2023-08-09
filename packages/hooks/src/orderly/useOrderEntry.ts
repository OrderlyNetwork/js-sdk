export interface OrderEntryReturn<T, R> {
  create: (values: T) => Promise<R>;
  validator: (values: T) => any;
}

export const useOrderEntry = <T, R extends any>(): OrderEntryReturn<T, R> => {
  return {
    create: (values: T) => {
      return Promise.resolve({} as R);
    },
    validator: (values: T) => {
      return {};
    },
  };
};
