import { API, WSMessage } from "@veltodefi/types";

export interface IOrderMergeHandler<T, D> {
  merge(
    key: string,
    updatedOrder: T,
    prevData: API.OrderResponse[]
  ): API.OrderResponse[];
  insert(prevData: API.OrderResponse[]): API.OrderResponse[];
  update(prevData: API.OrderResponse[]): API.OrderResponse[];
  remove(prevData: API.OrderResponse[]): API.OrderResponse[];
}
