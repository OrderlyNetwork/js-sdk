// import i18n from "i18next";
// import { initReactI18next } from "react-i18next";
import { createInstance } from "i18next";
import { resources, defaultLng } from "./resources";
import LanguageDetector from "i18next-browser-languagedetector";

// i18n
//   // passes i18n down to react-i18next
//   .use(initReactI18next)
//   .init({
//     // the translations
//     resources,
//     // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
//     // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
//     // if you're using a language detector, do not define the lng option
//     lng: "en",
//     fallbackLng: "en",
//     interpolation: {
//       // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
//       escapeValue: false,
//     },
//   });

// https://react.i18next.com/latest/i18nextprovider#when-to-use
const i18n = createInstance({
  // lng: defaultLng,
  fallbackLng: defaultLng,
  // debug: true,
  interpolation: {
    escapeValue: false,
  },
  resources,
}).use(LanguageDetector);

i18n.init();

export default i18n;
