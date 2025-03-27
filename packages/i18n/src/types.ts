import "i18next";
import { Resources } from "./resources";
import { LocaleEnum } from "./constant";

// https://www.i18next.com/overview/typescript#create-a-declaration-file
// Enhance the input parameter intelliSense for the t function.
declare module "i18next" {
  interface CustomTypeOptions {
    // custom namespace type, if you changed it
    // defaultNS: "translation";

    // custom resources type
    resources: Resources["en"];
  }
}

export type LocaleCode = keyof typeof LocaleEnum | (string & {});
