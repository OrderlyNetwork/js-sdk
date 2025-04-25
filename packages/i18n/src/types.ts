import "i18next";
import { defaultNS, LocaleEnum } from "./constant";
import { en } from "./locale/en";

export type LocaleCode = keyof typeof LocaleEnum | (string & {});

type ExtendLocaleMessages = Record<`extend.${string}`, string>;

export type LocaleMessages = typeof en & ExtendLocaleMessages;

export type Resources<T extends {} = {}> = {
  [key in LocaleCode]?: Partial<LocaleMessages & T>;
};

// https://www.i18next.com/overview/typescript#create-a-declaration-file
// Enhance the input parameter intelliSense for the t function.
declare module "i18next" {
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    // defaultNS: "translation";

    // custom resources type
    resources: {
      [defaultNS]: LocaleMessages;
    };
  }
}
