import { useMutation } from "../useMutation";

export interface OrderEntryReturn<T, R> {
  create: (values: T) => Promise<R>;
  validator: (values: T) => Promise<any>;
}

export const useOrderEntry = <T, R extends any>(): OrderEntryReturn<T, R> => {
  const { mutation } = useMutation<T, R>("/order");

  return {
    create: (values: T) => {
      mutation(values);
      return Promise.resolve({} as R);
    },
    validator: (values: T) => {
      return Promise.resolve({} as R);
    },
  };
};
