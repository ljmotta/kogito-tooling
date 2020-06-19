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
import { fireEvent, render } from "@testing-library/react";
import { EditorToolbar } from "../../../webview/editor/EditorToolbar";
import { usingTestingGlobalContext } from "../../testing_utils";
import { StateControl } from "@kogito-tooling/embedded-editor";
import { act } from "react-dom/test-utils";

const onClose = jest.fn(() => null);

describe("EditorToolbar", () => {
  let stateControl: StateControl;
  let onSave: () => null;

  beforeEach(() => {
    stateControl = new StateControl();
    onSave = jest.fn().mockImplementation(() => {
      stateControl.setSavedCommand();
    });
  });

  describe("is dirty indicator", () => {
    test("should show the isDirty indicator when the isEdited is true", () => {
      const isEdited = true;
      const { queryByTestId, getByTestId } = render(
        usingTestingGlobalContext(<EditorToolbar onClose={onClose} onSave={onSave} isEdited={isEdited} />).wrapper
      );

      expect(queryByTestId("is-dirty-indicator")).toBeVisible();
      expect(getByTestId("toolbar-title")).toMatchSnapshot();
    });

    test("shouldn't show the isDirty indicator when the isEdited is false", () => {
      const isEdited = false;
      const { queryByTestId, getByTestId } = render(
        usingTestingGlobalContext(<EditorToolbar onClose={onClose} onSave={onSave} isEdited={isEdited} />).wrapper
      );

      expect(queryByTestId("is-dirty-indicator")).toBeNull();
      expect(getByTestId("toolbar-title")).toMatchSnapshot();
    });
  });
});
