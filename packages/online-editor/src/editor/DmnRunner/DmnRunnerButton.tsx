/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
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

import { Button, Tooltip } from "@patternfly/react-core";
import { ConnectedIcon, DisconnectedIcon } from "@patternfly/react-icons";
import * as React from "react";
import { useCallback, useMemo, useRef } from "react";
import { DmnRunnerStatus } from "./DmnRunnerStatus";
import { useDmnRunner } from "./DmnRunnerContext";

export function DmnRunnerButton() {
  const dmnRunner = useDmnRunner();

  const onDmnRunner = useCallback(() => {
    if (dmnRunner.status !== DmnRunnerStatus.RUNNING) {
      dmnRunner.setModalOpen(true);
    } else {
      if (dmnRunner.isDrawerExpanded) {
        dmnRunner.setDrawerExpanded(false);
      } else {
        dmnRunner.setDrawerExpanded(true);
      }
    }
  }, [dmnRunner.status, dmnRunner.isDrawerExpanded]);

  const shouldBlinkDmnRunnerConnectedIcon = useMemo(() => {
    return dmnRunner.status === DmnRunnerStatus.RUNNING && !dmnRunner.isDrawerExpanded;
  }, [dmnRunner.status, dmnRunner.isDrawerExpanded]);

  const isChrome = useMemo(() => {
    return !!window.chrome;
  }, []);

  return (
    <>
      {isChrome && (
        <Button
          variant={"plain"}
          component={"a"}
          href={
            "https://docs.google.com/forms/d/e/1FAIpQLScxNLViA-_4OKCQKhxqt8CK5la0JZkNjTs67-YWCrOg5aFt0w/viewform?gxids=7628"
          }
          style={{ marginRight: "5px" }}
        >
          Feedback
        </Button>
      )}
      <Tooltip
        key={"is-chrome"}
        flipBehavior={["left"]}
        trigger={!isChrome ? "mouseenter focus" : ""}
        content={<p>This is only available in Chrome at the moment</p>}
      >
        <Button
          data-testid="run-button"
          variant={"tertiary"}
          onClick={onDmnRunner}
          aria-label={"Run"}
          className={"kogito--editor__toolbar"}
          isAriaDisabled={!isChrome}
          icon={
            dmnRunner.status === DmnRunnerStatus.RUNNING ? (
              <Tooltip
                key={"connected"}
                content={"The DMN Runner is connected"}
                flipBehavior={["left"]}
                distance={20}
                children={<ConnectedIcon className={shouldBlinkDmnRunnerConnectedIcon ? "blink-opacity" : ""} />}
                trigger={isChrome ? "mouseenter focus" : ""}
              />
            ) : (
              <Tooltip
                key={"disconnected"}
                content={"The DMN Runner is not connected"}
                flipBehavior={["left"]}
                distance={20}
                children={<DisconnectedIcon />}
                trigger={isChrome ? "mouseenter focus" : ""}
              />
            )
          }
        >
          DMN Runner
        </Button>
      </Tooltip>
    </>
  );
}
