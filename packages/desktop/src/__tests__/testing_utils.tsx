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

import { EmbeddedEditorRouter } from "@kogito-tooling/embedded-editor";
import * as React from "react";
import { GlobalContext, GlobalContextType } from "../webview/common/GlobalContext";
import { I18nDictionariesProvider, I18nDictionariesProviderProps } from "@kogito-tooling/i18n";
import { desktopI18nDefaults, desktopI18nDictionaries, DesktopI18nContext } from "../webview/common/i18n/locales";
import { DesktopI18n } from "../webview/common/i18n";

export function usingTestingGlobalContext(children: React.ReactElement, ctx?: Partial<GlobalContextType>) {
  const usedCtx = {
    router: new EmbeddedEditorRouter(),
    file: { filePath: "test.dmn", fileContent: "", fileType: "dmn" },
    ...ctx
  };
  return {
    ctx: usedCtx,
    wrapper: (
      <GlobalContext.Provider key={""} value={usedCtx}>
        {children}
      </GlobalContext.Provider>
    )
  };
}

export function usingTestingDesktopI18nContext(
  children: React.ReactElement,
  ctx?: Partial<I18nDictionariesProviderProps<DesktopI18n>>
) {
  const usedCtx: I18nDictionariesProviderProps<DesktopI18n> = {
    defaults: desktopI18nDefaults,
    dictionaries: desktopI18nDictionaries,
    ctx: DesktopI18nContext,
    children,
    ...ctx
  };
  return {
    ctx: usedCtx,
    wrapper: (
      <I18nDictionariesProvider defaults={usedCtx.defaults} dictionaries={usedCtx.dictionaries} ctx={usedCtx.ctx}>
        {usedCtx.children}
      </I18nDictionariesProvider>
    )
  };
}
