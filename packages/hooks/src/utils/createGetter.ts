/* eslint-disable @typescript-eslint/no-unnecessary-type-constraint */
import { isNil } from "ramda";
import { API } from "@orderly.network/types";

type objectDepth = 1 | 2;
type propertyType<D, K, F> = D extends 1 ? K : F;

// {
//   // [P in K]: (key: P, defaultValue?: T[P]) => T[K][P];
//   [P in K]: (key: P, defaultValue?: T[P]) => T[K][P];
// }

// type KeyOf<T> = keyof T;
export type ValueOf<T> = T[keyof T];

// export function createGetter<T extends Record<string, any>, K extends keyof T>(
export function createGetter<
  T extends any,
  K extends string = string,
  Key = keyof T,
>(
  data: Record<string, T> | null | undefined,
  depth: objectDepth = 2,
): (typeof depth extends 1
  ? { [P in K]: (defaultValue?: any) => any }
  : { [P in K]: (key?: Key, defaultValue?: ValueOf<T>) => any }) & {
  isNil: boolean;
} {
  const getValue = (value: any, defaultValue?: any) => {
    if (defaultValue === undefined) {
      return value;
    }

    return value ?? defaultValue;
  };

  return new Proxy(data || {}, {
    get(
      target: any,
      property: propertyType<typeof depth, keyof T, any>,
      receiver,
    ): any {
      if (property === "isNil") {
        return isNil(data);
      }
      if (depth === 1) {
        return (defaultValue: any) => {
          if (!target) return defaultValue;
          return getValue(target[property], defaultValue);
        };
      }
      return (key?: Key, defaultValue?: any) => {
        if (key) {
          return getValue((target as any)[property]?.[key], defaultValue);
        } else {
          return getValue(target[property], defaultValue);
        }
      };
    },
  });
}
