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
import { render, fireEvent } from "@testing-library/react";
import { EditorToolbar } from "../../editor/EditorToolbar";
import { StateControl } from "@kogito-tooling/editor/dist/embedded";
import { usingTestingGlobalContext, usingTestingOnlineI18nContext } from "../testing_utils";
import { GithubService } from "../../common/GithubService";
import { EditorPage } from "../../editor/EditorPage";

jest.clearAllMocks();

const onFileNameChanged = jest.fn((file: string) => null);
const enterFullscreen = jest.fn(() => null);
const requestSave = jest.fn(() => null);
const close = jest.fn(() => null);
const requestCopyContentToClipboard = jest.fn(() => null);
const fullscreen = false;
const requestPreview = jest.fn(() => null);
const requestExportGist = jest.fn(() => null);
const requestSetGitHubToken = jest.fn(() => null);
const requestUpdateGist = jest.fn(() => null);

function mockFunctions() {
  const original = require.requireActual("../../common/Hooks");
  return {
    ...original,
    useFileUrl: jest.fn().mockImplementation(() => "gist.githubusercontent.com/?file=something")
  };
}
jest.mock("../../common/Hooks", () => mockFunctions());

afterAll(() => {
  jest.clearAllMocks();
})

describe("EditorToolbar", () => {
  let stateControl: StateControl;
  let requestDownload: () => null;

  beforeEach(() => {
    stateControl = new StateControl();
    requestDownload = jest.fn().mockImplementation(() => {
      stateControl.setSavedCommand();
    });
  });

  describe("is dirty indicator", () => {
    test("should show the isDirty indicator when isEdited is true", () => {
      const isEdited = true;

      const { queryByTestId, getByTestId } = render(
        usingTestingOnlineI18nContext(
          usingTestingGlobalContext(
            <EditorToolbar
              onFullScreen={enterFullscreen}
              onSave={requestSave}
              onDownload={requestDownload}
              onClose={close}
              onFileNameChanged={onFileNameChanged}
              onCopyContentToClipboard={requestCopyContentToClipboard}
              isPageFullscreen={fullscreen}
              onPreview={requestPreview}
              onSetGitHubToken={requestSetGitHubToken}
              onExportGist={requestExportGist}
              onUpdateGist={requestUpdateGist}
              isEdited={isEdited}
            />
          ).wrapper
        ).wrapper
      );

      expect(queryByTestId("is-dirty-indicator")).toBeVisible();
      expect(getByTestId("toolbar-title")).toMatchSnapshot();
    });

    test("shouldn't show the isDirty indicator when isEdited is false", () => {
      const isEdited = false;

      const { queryByTestId, getByTestId } = render(
        usingTestingOnlineI18nContext(
          usingTestingGlobalContext(
            <EditorToolbar
              onFullScreen={enterFullscreen}
              onSave={requestSave}
              onDownload={requestDownload}
              onClose={close}
              onFileNameChanged={onFileNameChanged}
              onCopyContentToClipboard={requestCopyContentToClipboard}
              isPageFullscreen={fullscreen}
              onPreview={requestPreview}
              onSetGitHubToken={requestSetGitHubToken}
              onExportGist={requestExportGist}
              onUpdateGist={requestUpdateGist}
              isEdited={isEdited}
            />
          ).wrapper
        ).wrapper
      );

      expect(queryByTestId("is-dirty-indicator")).toBeNull();
      expect(getByTestId("toolbar-title")).toMatchSnapshot();
    });
  });

  describe("file actions", () => {
    test("Update Gist button should be disable with invalid user", async () => {
      const githubService = new GithubService();
      jest.spyOn(githubService, "getLogin").mockImplementation(() => "user1");
      jest.spyOn(githubService, "extractUserLoginFromGistRawUrl").mockImplementation(() => "user2");

      const { getByTestId } = render(
        usingTestingOnlineI18nContext(
          usingTestingGlobalContext(
            <EditorToolbar
              onFullScreen={enterFullscreen}
              onSave={requestSave}
              onDownload={requestDownload}
              onClose={close}
              onFileNameChanged={onFileNameChanged}
              onCopyContentToClipboard={requestCopyContentToClipboard}
              isPageFullscreen={fullscreen}
              onPreview={requestPreview}
              onSetGitHubToken={requestSetGitHubToken}
              onExportGist={requestExportGist}
              onUpdateGist={requestUpdateGist}
              isEdited={false}
            />,
            { githubService }
          ).wrapper
        ).wrapper
      );

      fireEvent.click(getByTestId("file-actions"));
      expect(getByTestId("update-gist-button")).toBeVisible();
      expect(getByTestId("update-gist-button")).toBeDisabled();
      expect(getByTestId("file-actions")).toMatchSnapshot();
    });

    test("Update Gist button should be enable with valid user", () => {
      const githubService = new GithubService();
      jest.spyOn(githubService, "getLogin").mockImplementation(() => "user1");
      jest.spyOn(githubService, "extractUserLoginFromGistRawUrl").mockImplementation(() => "user1");

      const { getByTestId } = render(
        usingTestingOnlineI18nContext(
          usingTestingGlobalContext(
            <EditorToolbar
              onFullScreen={enterFullscreen}
              onSave={requestSave}
              onDownload={requestDownload}
              onClose={close}
              onFileNameChanged={onFileNameChanged}
              onCopyContentToClipboard={requestCopyContentToClipboard}
              isPageFullscreen={fullscreen}
              onPreview={requestPreview}
              onSetGitHubToken={requestSetGitHubToken}
              onExportGist={requestExportGist}
              onUpdateGist={requestUpdateGist}
              isEdited={false}
            />,
            { githubService }
          ).wrapper
        ).wrapper
      );

      fireEvent.click(getByTestId("file-actions"));
      expect(getByTestId("update-gist-button")).toBeVisible();
      expect(getByTestId("update-gist-button")).toBeEnabled();
      expect(getByTestId("file-actions")).toMatchSnapshot();
    });

    test("Set GitHub token button should open a GitHubTokenModal", async () => {
      const { getByTestId } = render(
        usingTestingOnlineI18nContext(
          usingTestingGlobalContext(<EditorPage onFileNameChanged={onFileNameChanged} />).wrapper
        ).wrapper
      );

      fireEvent.click(getByTestId("file-actions"));
      fireEvent.click(getByTestId("set-github-token"));
      expect(getByTestId("github-token-modal")).toBeVisible();
      expect(getByTestId("github-token-modal")).toMatchSnapshot();
    });
  });
});
