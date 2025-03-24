import { useContext } from "react";
import { FlatNamespace, KeyPrefix } from "i18next";
import {
  FallbackNs,
  useTranslation as _useTranslation,
  UseTranslationOptions,
  I18nContext,
} from "react-i18next";
import { type $Tuple } from "react-i18next/helpers";
import i18n from "./i18n";

export function useTranslation<
  Ns extends FlatNamespace | $Tuple<FlatNamespace> | undefined,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined
>(ns?: Ns, options?: UseTranslationOptions<KPrefix>) {
  // @ts-ignore
  const context = useContext(I18nContext);
  return _useTranslation(ns, { i18n: context?.i18n || i18n, ...options });
}
