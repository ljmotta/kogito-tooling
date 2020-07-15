/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
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

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownPosition,
  TextInput,
  Title,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
  PageHeader,
  Brand,
  DropdownToggle,
} from "@patternfly/react-core";
import { CloseIcon, ExpandIcon, EllipsisVIcon } from "@patternfly/react-icons";
import * as React from "react";
import { useCallback, useContext, useMemo, useState } from "react";
import { GlobalContext } from "../common/GlobalContext";
import { useLocation } from "react-router";

interface Props {
  onFileNameChanged: (fileName: string) => void;
  onFullScreen: () => void;
  onSave: () => void;
  onDownload: () => void;
  onPreview: () => void;
  onExportGist: () => void;
  onClose: () => void;
  onCopyContentToClipboard: () => void;
  isPageFullscreen: boolean;
  isEdited: boolean;
}

export function EditorToolbar(props: Props) {
  const context = useContext(GlobalContext);
  const location = useLocation();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(context.file.fileName);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isKebabOpen, setKebabOpen] = useState(false);

  const logoProps = useMemo(() => {
    return { onClick: props.onClose };
  }, [props.onClose]);

  const editorType = useMemo(() => {
    return context.routes.editor.args(location.pathname).type;
  }, [location]);

  const saveNewName = useCallback(() => {
    props.onFileNameChanged(name);
    setEditingName(false);
  }, [props.onFileNameChanged, name]);

  const cancelNewName = useCallback(() => {
    setEditingName(false);
    setName(context.file.fileName);
  }, [context.file.fileName]);

  const editName = useCallback(() => {
    if (!context.readonly) {
      setEditingName(true);
    }
  }, [context.readonly]);

  const onNameInputKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.keyCode === 13 /* Enter */) {
        saveNewName();
      } else if (e.keyCode === 27 /* ESC */) {
        cancelNewName();
      }
    },
    [saveNewName, cancelNewName]
  );

  const kebabItems = (dropdownId: string) =>
    useMemo(
      () => [
        <DropdownItem
          key={`dropdown-${dropdownId}-save`}
          component={"button"}
          onClick={props.onDownload}
          className={"pf-u-display-none-on-lg"}
        >
          Save
        </DropdownItem>,
        <React.Fragment key={`dropdown-${dropdownId}-fragment`}>
          {context.external && !context.readonly && (
            <DropdownItem
              key={`dropdown-${dropdownId}-send-changes-to-github`}
              component={"button"}
              onClick={props.onSave}
            >
              Send changes to GitHub
            </DropdownItem>
          )}
        </React.Fragment>,
        <DropdownItem
          key={`dropdown-${dropdownId}-copy-source`}
          component={"button"}
          onClick={props.onCopyContentToClipboard}
        >
          Copy source
        </DropdownItem>,
        <DropdownItem key={`dropdown-${dropdownId}-download-svg`} component="button" onClick={props.onPreview}>
          Download SVG
        </DropdownItem>,
        <DropdownItem key={`dropdown-${dropdownId}-export-gist`} component="button" onClick={props.onExportGist}>
          Gist it!
        </DropdownItem>
      ],
      [
        context.external,
        context.readonly,
        props.onSave,
        props.onDownload,
        props.onCopyContentToClipboard,
        props.onExportGist
      ]
    );

  const filenameInput = (
    <>
      {!editingName && (
        <div data-testid="toolbar-title">
          <Title
            className={"kogito--editor__toolbar-title"}
            headingLevel={"h3"}
            size={"xl"}
            onClick={editName}
            title={"Rename"}
          >
            {context.file.fileName + "." + editorType}
          </Title>
          {props.isEdited && (
            <span className={"kogito--editor__toolbar-edited"} data-testid="is-dirty-indicator">
              {" - Edited"}
            </span>
          )}
        </div>
      )}
      {editingName && (
        <div className={"kogito--editor__toolbar-name-container"}>
          <Title headingLevel={"h3"} size={"xl"}>
            {name + "." + editorType}
          </Title>
          <TextInput
            autoFocus={true}
            value={name}
            type={"text"}
            aria-label={"fileName"}
            className={"pf-c-title pf-m-xl"}
            onChange={setName}
            onKeyUp={onNameInputKeyUp}
            onBlur={saveNewName}
          />
        </div>
      )}
    </>
  );

  const headerToolbar = (
    // TODO: The toolbar should be switched out for DataToolbar and possibly the Overflow menu
    <Toolbar>
      <ToolbarGroup>
        <ToolbarItem>
          <Button
            data-testid="save-button"
            variant={"tertiary"}
            onClick={props.onDownload}
            className={"pf-u-display-none pf-u-display-flex-on-lg"}
          >
            Save
          </Button>
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarGroup>
        <ToolbarItem className={"pf-u-display-none pf-u-display-flex-on-lg"}>
          <Dropdown
            onSelect={() => setMenuOpen(false)}
            toggle={
              <DropdownToggle
                id={"toggle-id-lg"}
                className={"kogito--editor__toolbar-toggle-icon-button"}
                onToggle={isOpen => setMenuOpen(isOpen)}
              >
                File actions
              </DropdownToggle>
            }
            isOpen={isMenuOpen}
            isPlain={true}
            dropdownItems={kebabItems("lg")}
            position={DropdownPosition.right}
          />
        </ToolbarItem>
      </ToolbarGroup>
      <ToolbarGroup>
        <ToolbarItem className={"pf-u-display-none-on-lg"}>
          <Dropdown
            onSelect={() => setKebabOpen(false)}
            toggle={
              <DropdownToggle
                className={"kogito--editor__toolbar-toggle-icon-button"}
                id={"toggle-id-sm"}
                toggleIndicator={null}
                onToggle={isOpen => setKebabOpen(isOpen)}
              >,
                <EllipsisVIcon />
              </DropdownToggle>
            }
            isOpen={isKebabOpen}
            isPlain={true}
            dropdownItems={kebabItems("sm")}
            position={DropdownPosition.right}
          />
        </ToolbarItem>
        <ToolbarItem className={"pf-u-display-none pf-u-display-flex-on-lg"}>
          <Button
            className={"kogito--editor__toolbar-icon-button"}
            variant={"plain"}
            onClick={props.onFullScreen}
            aria-label={"Full screen"}
          >
            <ExpandIcon />
          </Button>
        </ToolbarItem>
        {!context.external && (
          <ToolbarItem>
            <Button
              className={"kogito--editor__toolbar-icon-button"}
              variant={"plain"}
              onClick={props.onClose}
              aria-label={"Close"}
              data-testid="close-editor-button"
            >
              <CloseIcon />
            </Button>
          </ToolbarItem>
        )}
      </ToolbarGroup>
    </Toolbar>
  );

  return !props.isPageFullscreen ? (
    <PageHeader
      logo={<Brand src={`images/${editorType}_kogito_logo.svg`} alt={`${editorType} kogito logo`} />}
      logoProps={logoProps}
      headerTools={headerToolbar}
      topNav={filenameInput}
      className={"kogito--editor__toolbar"}
    />
  ) : null;
}
