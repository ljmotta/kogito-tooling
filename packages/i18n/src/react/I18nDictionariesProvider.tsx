/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { useMemo, useState } from "react";
import { TranslatedDictionary, ReferenceDictionary, Defaults } from "../Dictionary";
import { I18nContextType } from "./I18nContext";
import { immutableDeepMerge } from "../immutableDeepMerge";

// tslint:disable-next-line:interface-name
export interface I18nDictionariesProviderProps<D extends ReferenceDictionary<D>> {
  defaults: Defaults<D>;
  dictionaries: Map<string, TranslatedDictionary<D>>;
  ctx: React.Context<I18nContextType<D>>;
  children: React.ReactNode;
}

export const I18nDictionariesProvider = <D extends ReferenceDictionary<D>>(props: I18nDictionariesProviderProps<D>) => {
  const [locale, setLocale] = useState(props.defaults.locale);
  const i18n = useMemo(() => {
    const selectedDictionary =
      props.dictionaries.get(locale) ?? props.dictionaries.get(locale.split("-").shift()!) ?? {};

    return immutableDeepMerge(props.defaults.dictionary, selectedDictionary);
  }, [locale]) as D;

  return <props.ctx.Provider value={{ locale, setLocale, i18n }}>{props.children}</props.ctx.Provider>;
};
