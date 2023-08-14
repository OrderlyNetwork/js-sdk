import { usePrivateInfiniteQuery } from "../usePrivateInfiniteQuery";

/**
 * Get the order history of the current user
 * @returns
 */
export const useOrderHistory = () => {
  return usePrivateInfiniteQuery((pageIndex: number) => ``);
};
