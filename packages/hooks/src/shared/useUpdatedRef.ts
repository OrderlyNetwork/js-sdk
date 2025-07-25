import { useRef } from "react";

export const useUpdatedRef = <T>(val: T) => {
  const latestRef = useRef<T>(val);
  latestRef.current = val;
  return latestRef;
};
