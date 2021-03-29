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

import * as React from "react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../common/GlobalContext";
import { DmnRunnerContext } from "./DmnRunnerContext";
import JSONSchemaBridge from "../../common/Bridge";
import { DmnRunnerService } from "./DmnRunnerService";
import { DmnRunnerModal } from "./DmnRunnerModal";
import { EmbeddedEditorRef } from "@kogito-tooling/editor/dist/embedded";
import { DmnRunnerStatus } from "./DmnRunnerStatus";
import { diff } from "deep-object-diff";
import { getCookie, setCookie } from "../../common/utils";

const DMN_RUNNER_POLLING_TIME = 1000;
export const THROTTLING_TIME = 200;
const DMN_RUNNER_PORT_COOKIE_NAME = "dmn-runner-port";
export const DMN_RUNNER_DEFAULT_PORT = "8080";

interface Props {
  children: React.ReactNode;
  editor?: EmbeddedEditorRef;
  isEditorReady: boolean;
}

export function DmnRunnerContextProvider(props: Props) {
  const [isDrawerExpanded, setDrawerExpanded] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState();
  const globalContext = useContext(GlobalContext);
  const [status, setStatus] = useState(DmnRunnerStatus.UNAVAILABLE);
  const [jsonSchemaBridge, setJsonSchemaBridge] = useState<JSONSchemaBridge>();
  const [port, setPort] = useState(() => {
    const savedPort = getCookie(DMN_RUNNER_PORT_COOKIE_NAME);
    if (savedPort) {
      return savedPort;
    }
    return DMN_RUNNER_DEFAULT_PORT;
  });
  const service = useMemo(() => new DmnRunnerService(port), [port]);

  const updateJsonSchemaBridge = useCallback(() => {
    return props.editor
      ?.getContent()
      .then(content => service.getJsonSchemaBridge(content ?? ""))
      .then(newJsonSchemaBridge => {
        const propertiesDifference = diff(
          jsonSchemaBridge?.schema.definitions.InputSet.properties ?? {},
          newJsonSchemaBridge?.schema.definitions.InputSet.properties ?? {}
        );
        Object.keys(propertiesDifference).forEach(property => {
          // Remove an formData property that has been changed;
          delete formData?.[property];
        });
        setJsonSchemaBridge(newJsonSchemaBridge);
      });
  }, [props.editor, service, formData]);

  useEffect(() => {
    if (globalContext.file.fileExtension === "dmn") {
      setStatus(DmnRunnerStatus.AVAILABLE);
    }
  }, [globalContext.file.fileExtension]);

  // Pooling to detect either if DMN Runner is running or has stopped
  useEffect(() => {
    if (status === DmnRunnerStatus.UNAVAILABLE) {
      return;
    }

    let detectDmnRunner: number | undefined;
    if (status !== DmnRunnerStatus.RUNNING) {
      detectDmnRunner = window.setInterval(() => {
        service.checkServer().then(() => {
          setStatus(DmnRunnerStatus.RUNNING);
          if (isModalOpen) {
            setDrawerExpanded(true);
          }
          window.clearInterval(detectDmnRunner);
        });
      }, DMN_RUNNER_POLLING_TIME);

      return () => window.clearInterval(detectDmnRunner);
    }

    let detectCrashesOrStops: number | undefined;
    if (status === DmnRunnerStatus.RUNNING) {
      detectCrashesOrStops = window.setInterval(() => {
        service.checkServer().catch(() => {
          setStatus(DmnRunnerStatus.STOPPED);
          setModalOpen(true);
          setDrawerExpanded(false);
          window.clearInterval(detectCrashesOrStops);
        });
      }, DMN_RUNNER_POLLING_TIME);

      // After the detection of the DMN Runner, set the schema for the first time
      if (props.isEditorReady) {
        updateJsonSchemaBridge();
      }

      return () => window.clearInterval(detectCrashesOrStops);
    }
  }, [props.editor, props.isEditorReady, isModalOpen, status, service]);

  // Subscribe to any change on the DMN Editor and update the JsonSchemaBridge
  useEffect(() => {
    if (!props.editor || status === DmnRunnerStatus.UNAVAILABLE) {
      return;
    }

    let timeout: number | undefined;
    const subscription = props.editor.getStateControl().subscribe(() => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = window.setTimeout(() => {
        updateJsonSchemaBridge();
      }, 200);
    });
    return () => props.editor?.getStateControl().unsubscribe(subscription);
  }, [props.editor, status, updateJsonSchemaBridge]);

  const saveNewPort = useCallback((newPort: string) => {
    setPort(newPort);
    setCookie(DMN_RUNNER_PORT_COOKIE_NAME, newPort);
  }, []);

  return (
    <DmnRunnerContext.Provider
      value={{
        status,
        setStatus,
        jsonSchemaBridge,
        isDrawerExpanded,
        setDrawerExpanded,
        isModalOpen,
        setModalOpen,
        formData,
        setFormData,
        port,
        saveNewPort,
        service
      }}
    >
      {props.children}
      <DmnRunnerModal />
    </DmnRunnerContext.Provider>
  );
}