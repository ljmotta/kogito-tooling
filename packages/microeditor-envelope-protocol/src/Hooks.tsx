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

import { useEffect } from "react";
import { ChannelKeyboardEvent } from "@kogito-tooling/keyboard-shortcuts";
import { EnvelopeBusOuterMessageHandler } from "./EnvelopeBusOuterMessageHandler";

function getChannelKeyboardEvent(keyboardEvent: KeyboardEvent): ChannelKeyboardEvent {
  return {
    altKey: keyboardEvent.altKey,
    ctrlKey: keyboardEvent.ctrlKey,
    shiftKey: keyboardEvent.shiftKey,
    metaKey: keyboardEvent.metaKey,
    code: keyboardEvent.code,
    type: keyboardEvent.type,
    channelOriginalTargetTagName: (keyboardEvent.target as HTMLElement)?.tagName
  };
}

export function useSyncedKeyboardEvents(envelopeBusOuterMessageHandler: EnvelopeBusOuterMessageHandler) {
  useEffect(() => {
    const listener = (keyboardEvent: KeyboardEvent) => {
      const keyboardShortcut = getChannelKeyboardEvent(keyboardEvent);
      console.debug(`New keyboard event (${JSON.stringify(keyboardShortcut)})!`);
      envelopeBusOuterMessageHandler.notify_channelKeyboardEvent(keyboardShortcut);
    };

    window.addEventListener("keydown", listener);
    window.addEventListener("keyup", listener);
    window.addEventListener("keypress", listener);
    return () => {
      window.removeEventListener("keydown", listener);
      window.removeEventListener("keyup", listener);
      window.removeEventListener("keypress", listener);
    };
  }, [envelopeBusOuterMessageHandler]);
}