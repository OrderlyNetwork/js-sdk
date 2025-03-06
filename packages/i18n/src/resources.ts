import { en } from "./locale/en";

export const defaultNS = "translation";

// translation catalog
export const resources = {
  en: { [defaultNS]: en },
};

export type Resources = typeof resources;
