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
import { Button, List, ListItem, Modal, ModalVariant } from "@patternfly/react-core";
import { useCallback } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
}

export function ResetEditorModal(props: Props) {
  return (
    <Modal
      className={"kogito-tooling-reset-editor-modal"}
      variant={ModalVariant.small}
      title={"Reset your editor"}
      isOpen={props.isOpen}
      onClose={() => props.close()}
      actions={[
        <Button key={"close"} variant={"primary"} onClick={() => props.close()}>
          Close
        </Button>
      ]}
    >
      <div>
        <h3>Your locale has changed!</h3>
        <p>In order to update your editor with the new locale it's necessary to reset it.</p>
        <p>To do that you can:</p>
        <List>
          <ListItem>Re-open your editor by going back to the initial page and opening a new editor.</ListItem>
          <ListItem>Close the application and open it again.</ListItem>
        </List>
      </div>
    </Modal>
  );
}
