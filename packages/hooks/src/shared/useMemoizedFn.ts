/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef } from "react";

type noop = (this: any, ...args: any[]) => any;

type PickFunction<T extends noop> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

export const useMemoizedFn = <T extends noop>(fn: T) => {
  if (typeof fn !== "function") {
    console.error(
      `useMemoizedFn expected parameter a function, got ${typeof fn}`,
    );
  }

  const fnRef = useRef<T>(fn);

  fnRef.current = useMemo<T>(() => fn, [fn]);

  const memoizedFn = useRef<PickFunction<T>>(undefined);

  if (!memoizedFn.current) {
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args);
    };
  }

  return memoizedFn.current;
};
