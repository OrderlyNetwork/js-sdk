import { camelCaseToUnderscoreCase } from "@orderly.network/utils";

export function object2underscore(obj: any) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[camelCaseToUnderscoreCase(key)] = obj[key];
    return acc;
  }, {} as any);
}
