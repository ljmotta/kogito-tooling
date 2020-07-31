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
import { renderHook } from "@testing-library/react-hooks";
import { EmbeddedEditorRef } from "../../embedded";
import { useDirtyState, StateControl } from "../../stateControl";
import { act } from "react-test-renderer";

describe("useDirtyState", () => {
  let embeddedEditorRef: EmbeddedEditorRef;
  let stateControl: StateControl;
  let editorRef: React.MutableRefObject<EmbeddedEditorRef>;

  beforeEach(() => {
    stateControl = new StateControl();
    embeddedEditorRef = {
      getStateControl: () => stateControl,
      notifyUndo: jest.fn(),
      notifyRedo: jest.fn(),
      requestContent: jest.fn(),
      requestPreview: jest.fn(),
      setContent: jest.fn(),
      notifyLocaleChange: jest.fn()
    };
    editorRef = {
      current: embeddedEditorRef
    };
  });

  describe("false", () => {
    test("after initialization", () => {
      const { result } = renderHook(() => useDirtyState(editorRef));

      expect(result.current).toBeFalsy();
    });

    test("redo without any command to be redone", () => {
      const { result } = renderHook(() => useDirtyState(editorRef));

      act(() => {
        stateControl.redo();
      });

      expect(result.current).toBeFalsy();
    });

    test("add command and save it", () => {
      const { result } = renderHook(() => useDirtyState(editorRef));

      act(() => {
        stateControl.updateCommandStack("1");
        stateControl.setSavedCommand();
      });

      expect(result.current).toBeFalsy();
    });

    test("add command and undo it", () => {
      const { result } = renderHook(() => useDirtyState(editorRef));

      act(() => {
        stateControl.updateCommandStack("1");
        stateControl.undo();
      });

      expect(result.current).toBeFalsy();
    });

    test("add command, save it, undo and redo", () => {
      const { result } = renderHook(() => useDirtyState(editorRef));

      act(() => {
        stateControl.updateCommandStack("1");
        stateControl.setSavedCommand();
        stateControl.undo();
        stateControl.redo();
      });

      expect(result.current).toBeFalsy();
    });
  });

  describe("true", () => {
    test("add command without saving", () => {
      const { result } = renderHook(() => useDirtyState(editorRef));

      act(() => {
        stateControl.updateCommandStack("1");
      });

      expect(result.current).toBeTruthy();
    });

    test("add command, undo and redo", () => {
      const { result } = renderHook(() => useDirtyState(editorRef));

      act(() => {
        stateControl.updateCommandStack("1");
        stateControl.undo();
        stateControl.redo();
      });

      expect(result.current).toBeTruthy();
    });

    test("add command, save it, undo and new command", () => {
      const { result } = renderHook(() => useDirtyState(editorRef));

      act(() => {
        stateControl.updateCommandStack("1");
        stateControl.setSavedCommand();
        stateControl.undo();
        stateControl.updateCommandStack("2");
      });

      expect(result.current).toBeTruthy();
    });
  });
});
