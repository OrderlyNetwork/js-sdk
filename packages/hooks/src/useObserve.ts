import { useState } from "react";

export enum Subjects {
  Orders = "orders",
  Positions = "positions",
}

/**
 * observe subject
 * @param key subjectKey
 * @param initialValue 
 * 
 * @example
 * ```typescript
 * const [orders] = useObserve(Subjects.Orders, []);
 * ```
 */
export const useObserve = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
    const [data, setData] = useState<T>(initialValue);
};
