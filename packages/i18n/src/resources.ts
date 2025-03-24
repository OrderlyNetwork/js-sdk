import { en } from "./locale/en";

export const defaultNS = "translation";
export const defaultLng = "en";

export type LocaleMessages = typeof en;

export const resources = {
  [defaultLng]: { [defaultNS]: en },
};

export type Resources = typeof resources;
