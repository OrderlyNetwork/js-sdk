import i18n from "./i18n";
import { LocaleCode } from "./types";

export type BackendOptions = {
  loadPath: (lang: LocaleCode, ns?: string) => string;
};

export class Backend {
  options: BackendOptions;
  cache: Set<string>;

  constructor(options: BackendOptions) {
    this.options = options;
    this.cache = new Set();
  }

  async loadLanguage(lang: LocaleCode, ns: string) {
    if (typeof this.options?.loadPath !== "function") {
      return;
    }

    const loadPath = this.options.loadPath(lang, ns);

    if (!loadPath) {
      return;
    }

    const hasResourceBundle = i18n.hasResourceBundle(lang, ns);

    if (hasResourceBundle && this.cache.has(loadPath)) {
      return;
    }

    try {
      const res = await fetch(loadPath);
      const data = await res.json();
      i18n.addResourceBundle(lang, ns, data, true, true);
      this.cache.add(loadPath);
    } catch (error) {
      console.error("loadLanguage failed: ", error);
    }
  }
}
