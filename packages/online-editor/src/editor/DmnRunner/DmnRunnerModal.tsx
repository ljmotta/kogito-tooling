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
import {
  Wizard,
  WizardContext,
  WizardContextConsumer,
  WizardFooter,
} from "@patternfly/react-core/dist/js/components/Wizard";
import { getOperatingSystem, OperatingSystem } from "../../common/utils";
import { SelectOs } from "../../common/SelectOs";
import { AnimatedTripleDotLabel } from "../../common/AnimatedTripleDotLabel";
import { DmnRunnerStatus } from "./DmnRunnerStatus";
import { useDmnRunner } from "./DmnRunnerContext";
import { DMN_RUNNER_DEFAULT_PORT } from "./DmnRunnerContextProvider";
import { Alert, AlertVariant } from "@patternfly/react-core/dist/js/components/Alert";
import { List, ListItem } from "@patternfly/react-core/dist/js/components/List";
import { Text, TextContent, TextVariants } from "@patternfly/react-core/dist/js/components/Text";
import { Label } from "@patternfly/react-core/dist/js/components/Label";
import { ExpandableSection } from "@patternfly/react-core/dist/js/components/ExpandableSection";
import { Form, FormGroup } from "@patternfly/react-core/dist/js/components/Form";
import { TextInput } from "@patternfly/react-core/dist/js/components/TextInput";
import { Modal, ModalVariant } from "@patternfly/react-core/dist/js/components/Modal";
import { Button } from "@patternfly/react-core/dist/js/components/Button";
import { SelectDirection } from "@patternfly/react-core/dist/js/components/Select";
import { ExclamationCircleIcon } from "@patternfly/react-icons/dist/js/icons/exclamation-circle-icon";
import { useOnlineI18n } from "../../common/i18n";
import { I18nWrapped } from "@kogito-tooling/i18n/dist/react-components";

enum ModalPage {
  INITIAL,
  WIZARD,
  USE,
}

export function DmnRunnerModal() {
  const { i18n } = useOnlineI18n();
  const [operatingSystem, setOperatingSystem] = useState(getOperatingSystem() ?? OperatingSystem.LINUX);
  const [modalPage, setModalPage] = useState<ModalPage>(ModalPage.INITIAL);
  const dmnRunner = useDmnRunner();

  const downloadDmnRunnerUrl = useMemo(() => {
    switch (operatingSystem) {
      case OperatingSystem.MACOS:
        return "$_{WEBPACK_REPLACE__dmnRunnerMacOsDownloadUrl}";
      case OperatingSystem.WINDOWS:
        return "$_{WEBPACK_REPLACE__dmnRunnerWindowsDownloadUrl}";
      case OperatingSystem.LINUX:
      default:
        return "$_{WEBPACK_REPLACE__dmnRunnerLinuxDownloadUrl}";
    }
  }, [operatingSystem]);

  const macOsWizardSteps = useMemo(
    () => [
      {
        name: i18n.terms.install,
        component: (
          <>
            {dmnRunner.outdated && (
              <>
                <Alert
                  variant={AlertVariant.warning}
                  isInline={true}
                  title={i18n.dmnRunner.modal.wizard.outdatedAlert.title}
                >
                  {i18n.dmnRunner.modal.wizard.outdatedAlert.message}
                </Alert>
                <br />
              </>
            )}
            <List>
              <ListItem>
                <TextContent>
                  <Text component={TextVariants.p}>
                    <Text component={TextVariants.a} href={downloadDmnRunnerUrl}>
                      {i18n.terms.download}
                    </Text>{" "}
                    {i18n.dmnRunner.modal.wizard.macos.install.download}
                  </Text>
                </TextContent>
              </ListItem>
              <ListItem>
                <TextContent>
                  <Text component={TextVariants.p}>
                    <I18nWrapped components={{ file: <Label>dmn_runner_macos_{dmnRunner.version}.dmg</Label> }}>
                      {i18n.dmnRunner.modal.wizard.macos.install.openFile}
                    </I18nWrapped>
                  </Text>
                </TextContent>
              </ListItem>
              <ListItem>
                <TextContent>
                  <Text>
                    <I18nWrapped
                      components={{ file: <Label>Kogito DMN Runner.app</Label>, folder: <Label>Applications</Label> }}
                    >
                      {i18n.dmnRunner.modal.wizard.macos.install.dragFileToApplicationsFolder}
                    </I18nWrapped>
                  </Text>
                </TextContent>
              </ListItem>
            </List>
          </>
        ),
      },
      {
        name: i18n.terms.start,
        component: (
          <>
            {dmnRunner.status === DmnRunnerStatus.STOPPED ? (
              <>
                <Alert
                  variant={AlertVariant.warning}
                  isInline={true}
                  title={i18n.dmnRunner.modal.wizard.stoppedAlert.title}
                >
                  {i18n.dmnRunner.modal.wizard.stoppedAlert.message}
                </Alert>
                <br />
                <List>
                  <ListItem>
                    <TextContent>
                      <Text component={TextVariants.p}>
                        {i18n.dmnRunner.modal.wizard.macos.start.stopped.startInstruction}
                      </Text>
                    </TextContent>
                  </ListItem>
                  <ListItem>
                    <TextContent>
                      <Text component={TextVariants.p}>
                        <I18nWrapped components={{ file: <Label>Kogito DMN Runner.app</Label> }}>
                          {i18n.dmnRunner.modal.wizard.macos.start.stopped.launchDmnRunner}
                        </I18nWrapped>
                      </Text>
                    </TextContent>
                  </ListItem>
                </List>
              </>
            ) : (
              <>
                <TextContent>
                  <Text component={TextVariants.p}>{i18n.dmnRunner.modal.wizard.macos.start.firstTime.title}</Text>
                </TextContent>
                <br />
                <List>
                  <ListItem>
                    <TextContent>
                      <Text component={TextVariants.p}>
                        <I18nWrapped components={{ folder: <Label>Applications</Label> }}>
                          {i18n.dmnRunner.modal.wizard.macos.start.firstTime.openApplicationsFolder}
                        </I18nWrapped>
                      </Text>
                    </TextContent>
                  </ListItem>
                  <ListItem>
                    <TextContent>
                      <Text component={TextVariants.p}>
                        <I18nWrapped components={{ file: <Label>Kogito DMN Runner.app</Label> }}>
                          {i18n.dmnRunner.modal.wizard.macos.start.firstTime.openAndCancel}
                        </I18nWrapped>
                      </Text>
                    </TextContent>
                  </ListItem>
                  <ListItem>
                    <TextContent>
                      <Text component={TextVariants.p}>
                        <I18nWrapped components={{ file: <Label>Kogito DMN Runner.app</Label>, again: <b>again</b> }}>
                          {i18n.dmnRunner.modal.wizard.macos.start.firstTime.openInstruction}
                        </I18nWrapped>
                      </Text>
                    </TextContent>
                  </ListItem>
                </List>

                <br />

                <TextContent>
                  <Text component={TextVariants.p}>{i18n.dmnRunner.modal.wizard.macos.start.alreadyRanBefore}</Text>
                </TextContent>
                <br />
                <List>
                  <ListItem>
                    <TextContent>
                      <Text component={TextVariants.p}>
                        <I18nWrapped components={{ file: <Label>Kogito DMN Runner.app</Label> }}>
                          {i18n.dmnRunner.modal.wizard.macos.start.launchDmnRunner}
                        </I18nWrapped>
                      </Text>
                    </TextContent>
                  </ListItem>
                </List>
                <br />
                <br />
                <hr />
                <br />
                <ExpandableSection
                  toggleTextExpanded={i18n.dmnRunner.modal.wizard.macos.start.advanced.title}
                  toggleTextCollapsed={i18n.dmnRunner.modal.wizard.macos.start.advanced.title}
                >
                  <DmnRunnerPortForm />
                  <br />
                  <TextContent>
                    <Text component={TextVariants.p}>
                      {i18n.dmnRunner.modal.wizard.macos.start.advanced.runFollowingCommand}
                    </Text>
                  </TextContent>
                  <br />
                  <TextContent>
                    <Text component={TextVariants.p} className={"kogito--code"}>
                      /Applications/Kogito\ DMN\ Runner.app/Contents/MacOs/kogito -p {dmnRunner.port}
                    </Text>
                  </TextContent>
                  <br />
                </ExpandableSection>
              </>
            )}
          </>
        ),
      },
    ],
    [
      dmnRunner.version,
      dmnRunner.status,
      dmnRunner.port,
      dmnRunner.saveNewPort,
      dmnRunner.outdated,
      downloadDmnRunnerUrl,
      i18n
    ]
  );

  const windowsWizardSteps = useMemo(
    () => [
      {
        name: i18n.terms.install,
        component: (
          <>
            {dmnRunner.outdated && (
              <>
                <Alert
                  variant={AlertVariant.warning}
                  isInline={true}
                  title={i18n.dmnRunner.modal.wizard.outdatedAlert.title}
                >
                  {i18n.dmnRunner.modal.wizard.outdatedAlert.message}
                </Alert>
                <br />
              </>
            )}
            <List>
              <ListItem>
                <TextContent>
                  <Text component={TextVariants.p}>
                    <Text component={TextVariants.a} href={downloadDmnRunnerUrl}>
                      {i18n.terms.download}
                    </Text>
                    {i18n.dmnRunner.modal.wizard.windows.install.keepDownload}
                  </Text>
                </TextContent>
              </ListItem>
              <ListItem>
                <TextContent>
                  <I18nWrapped components={{ file: <Label>dmn_runner_windows_{dmnRunner.version}.exe</Label> }}>
                    {i18n.dmnRunner.modal.wizard.windows.install.moveTheFile}
                  </I18nWrapped>
                </TextContent>
              </ListItem>
            </List>
          </>
        ),
      },
      {
        name: i18n.terms.start,
        component: (
          <>
            {dmnRunner.status === DmnRunnerStatus.STOPPED ? (
              <>
                <Alert
                  variant={AlertVariant.warning}
                  isInline={true}
                  title={i18n.dmnRunner.modal.wizard.stoppedAlert.title}
                >
                  {i18n.dmnRunner.modal.wizard.stoppedAlert.message}
                </Alert>
                <br />
                <List>
                  <ListItem>
                    <TextContent>
                      <Text component={TextVariants.p}>
                        {i18n.dmnRunner.modal.wizard.windows.start.stopped.startInstruction}
                      </Text>
                    </TextContent>
                  </ListItem>
                  <ListItem>
                    <TextContent>
                      <Text component={TextVariants.p}>
                        <I18nWrapped components={{ file: <Label>dmn_runner_windows_{dmnRunner.version}.exe</Label> }}>
                          {i18n.dmnRunner.modal.wizard.windows.start.stopped.launchDmnRunner}
                        </I18nWrapped>
                      </Text>
                    </TextContent>
                  </ListItem>
                </List>
              </>
            ) : (
              <>
                <TextContent>
                  <Text component={TextVariants.p}>{i18n.dmnRunner.modal.wizard.windows.start.firstTime.title}</Text>
                </TextContent>
                <br />
                <List>
                  <ListItem>
                    <TextContent>
                      <Text component={TextVariants.p}>
                        <I18nWrapped components={{ file: <Label>dmn_runner_windows_{dmnRunner.version}.exe</Label> }}>
                          {i18n.dmnRunner.modal.wizard.windows.start.firstTime.openFolder}
                        </I18nWrapped>
                      </Text>
                    </TextContent>
                  </ListItem>
                  <ListItem>
                    <TextContent>
                      <Text component={TextVariants.p}>
                        {i18n.dmnRunner.modal.wizard.windows.start.firstTime.runAnyway}
                      </Text>
                    </TextContent>
                  </ListItem>
                </List>

                <br />

                <TextContent>
                  <Text component={TextVariants.p}>{i18n.dmnRunner.modal.wizard.windows.start.alreadyRanBefore}</Text>
                </TextContent>
                <br />
                <List>
                  <ListItem>
                    <TextContent>
                      <Text component={TextVariants.p}>
                        <I18nWrapped components={{ file: <Label>dmn_runner_windows_{dmnRunner.version}.exe</Label> }}>
                          {i18n.dmnRunner.modal.wizard.windows.start.launchDmnRunner}
                        </I18nWrapped>
                      </Text>
                    </TextContent>
                  </ListItem>
                </List>
                <br />
                <br />
                <hr />
                <br />
                <ExpandableSection
                  toggleTextExpanded={i18n.dmnRunner.modal.wizard.windows.start.advanced.title}
                  toggleTextCollapsed={i18n.dmnRunner.modal.wizard.windows.start.advanced.title}
                >
                  <DmnRunnerPortForm />
                  <br />
                  <TextContent>
                    <Text component={TextVariants.p}>
                      {i18n.dmnRunner.modal.wizard.windows.start.advanced.runFollowingCommand}
                    </Text>
                  </TextContent>
                  <br />
                  <TextContent>
                    <Text component={TextVariants.p} className={"kogito--code"}>
                      "dmn_runner_windows_{dmnRunner.version}.exe" -p {dmnRunner.port}
                    </Text>
                  </TextContent>
                  <br />
                </ExpandableSection>
              </>
            )}
          </>
        ),
      },
    ],
    [
      dmnRunner.version,
      dmnRunner.status,
      dmnRunner.port,
      dmnRunner.saveNewPort,
      dmnRunner.outdated,
      downloadDmnRunnerUrl,
      i18n
    ]
  );

  const linuxWizardSteps = useMemo(
    () => [
      {
        name: i18n.terms.install,
        component: (
          <>
            {dmnRunner.outdated && (
              <>
                <Alert
                  variant={AlertVariant.warning}
                  isInline={true}
                  title={i18n.dmnRunner.modal.wizard.outdatedAlert.title}
                >
                  {i18n.dmnRunner.modal.wizard.outdatedAlert.message}
                </Alert>
                <br />
              </>
            )}
            <List>
              <ListItem>
                <TextContent>
                  <Text component={TextVariants.p}>
                    <Text component={TextVariants.a} href={downloadDmnRunnerUrl}>
                      {i18n.terms.download}
                    </Text>{" "}
                    {i18n.dmnRunner.modal.wizard.linux.install.download}
                  </Text>
                </TextContent>
              </ListItem>
              <ListItem>
                <TextContent>
                  <Text component={TextVariants.p}>
                    <I18nWrapped components={{ file: <Label>dmn_runner_linux_{dmnRunner.version}.tar.gz</Label> }}>
                      {i18n.dmnRunner.modal.wizard.linux.install.extractContent}
                    </I18nWrapped>
                  </Text>
                </TextContent>
              </ListItem>
            </List>
            <br />
            <TextContent>
              <Text component={TextVariants.p}>
                <I18nWrapped components={{ file: <Label>dmn_runner</Label> }}>
                  {i18n.dmnRunner.modal.wizard.linux.install.binaryExplanation}
                </I18nWrapped>
              </Text>
            </TextContent>
          </>
        ),
      },
      {
        name: i18n.terms.start,
        component: (
          <>
            {dmnRunner.status === DmnRunnerStatus.STOPPED && (
              <div>
                <Alert
                  variant={AlertVariant.warning}
                  isInline={true}
                  title={i18n.dmnRunner.modal.wizard.stoppedAlert.title}
                >
                  {i18n.dmnRunner.modal.wizard.stoppedAlert.message}
                </Alert>
                <br />
              </div>
            )}
            <List>
              <ListItem>
                <TextContent>
                  <Text component={TextVariants.p}>{i18n.dmnRunner.modal.wizard.linux.start.openTerminal}</Text>
                </TextContent>
              </ListItem>
              <ListItem>
                <TextContent>
                  <Text component={TextVariants.p}>
                    <I18nWrapped components={{ file: <Label>dmn_runner</Label> }}>
                      {i18n.dmnRunner.modal.wizard.linux.start.goToFolder}
                    </I18nWrapped>
                  </Text>
                </TextContent>
              </ListItem>
              <ListItem>
                <TextContent>
                  <Text component={TextVariants.p}>
                    {i18n.dmnRunner.modal.wizard.linux.start.runCommand}
                    <Text component={TextVariants.p} className={"kogito--code"}>
                      ./dmn_runner
                    </Text>
                  </Text>
                </TextContent>
              </ListItem>
              <br />
              <hr />
              <br />
              <ExpandableSection
                toggleTextExpanded={i18n.dmnRunner.modal.wizard.linux.start.advanced.title}
                toggleTextCollapsed={i18n.dmnRunner.modal.wizard.linux.start.advanced.title}
              >
                <DmnRunnerPortForm />
                <br />
                <TextContent>
                  <Text component={TextVariants.p}>
                    <I18nWrapped components={{ file: <Label>dmn_runner</Label> }}>
                      {i18n.dmnRunner.modal.wizard.linux.start.advanced.runFollowingCommand}
                    </I18nWrapped>
                  </Text>
                </TextContent>
                <br />
                <TextContent>
                  <Text component={TextVariants.p} className={"kogito--code"}>
                    ./dmn_runner -p {dmnRunner.port}
                  </Text>
                </TextContent>
                <br />
              </ExpandableSection>
            </List>
          </>
        ),
      },
    ],
    [
      dmnRunner.version,
      dmnRunner.status,
      dmnRunner.port,
      dmnRunner.saveNewPort,
      dmnRunner.outdated,
      downloadDmnRunnerUrl,
      i18n
    ]
  );

  const wizardSteps = useMemo(() => {
    switch (operatingSystem) {
      case OperatingSystem.MACOS:
        return macOsWizardSteps;
      case OperatingSystem.WINDOWS:
        return windowsWizardSteps;
      case OperatingSystem.LINUX:
      default:
        return linuxWizardSteps;
    }
  }, [operatingSystem, macOsWizardSteps, windowsWizardSteps, linuxWizardSteps]);

  useEffect(() => {
    if (dmnRunner.status === DmnRunnerStatus.NOT_RUNNING) {
      setModalPage(ModalPage.INITIAL);
    } else if (dmnRunner.status === DmnRunnerStatus.STOPPED) {
      setModalPage(ModalPage.WIZARD);
    } else if (dmnRunner.status === DmnRunnerStatus.RUNNING) {
      setModalPage(ModalPage.USE);
    }

    if (dmnRunner.outdated) {
      setModalPage(ModalPage.WIZARD);
    }
  }, [dmnRunner.status, dmnRunner.outdated]);

  const onClose = useCallback(() => {
    dmnRunner.setModalOpen(false);
    if (dmnRunner.status === DmnRunnerStatus.STOPPED || dmnRunner.outdated) {
      dmnRunner.setStatus(DmnRunnerStatus.NOT_RUNNING);
    }
  }, [dmnRunner.status, dmnRunner.outdated]);

  const modalTitle = useMemo(() => {
    switch (modalPage) {
      case ModalPage.INITIAL:
      case ModalPage.USE:
        return "";
      case ModalPage.WIZARD:
        return i18n.dmnRunner.modal.wizard.title;
    }
  }, [modalPage, i18n]);

  const modalVariant = useMemo(() => {
    switch (modalPage) {
      case ModalPage.INITIAL:
      case ModalPage.USE:
        return ModalVariant.medium;
      case ModalPage.WIZARD:
        return ModalVariant.large;
    }
  }, [modalPage]);

  return (
    <Modal
      isOpen={dmnRunner.isModalOpen}
      onClose={onClose}
      variant={modalVariant}
      aria-label={"Steps to enable the DMN Runner"}
      title={modalTitle}
      description={modalPage === ModalPage.WIZARD && <p>{i18n.dmnRunner.modal.wizard.description}</p>}
      footer={
        <>
          {modalPage === ModalPage.INITIAL && <></>}
          {modalPage === ModalPage.WIZARD && (
            <div className={"kogito--editor__dmn-runner-modal-footer"}>
              <Alert
                variant={"default"}
                isInline={true}
                className={"kogito--editor__dmn-runner-modal-footer-alert"}
                title={
                  <AnimatedTripleDotLabel label={i18n.dmnRunner.modal.wizard.footerWaitingToConnect} interval={750} />
                }
              />
            </div>
          )}
          {modalPage === ModalPage.USE && <></>}
        </>
      }
    >
      {modalPage === ModalPage.INITIAL && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            marginLeft: "20px",
          }}
        >
          <div style={{ margin: "20px" }}>
            <TextContent>
              <Text component={TextVariants.h1}>{i18n.names.dmnRunner}</Text>
            </TextContent>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <div style={{ margin: "10px" }}>
              <TextContent>
                <Text component={TextVariants.p}>{i18n.dmnRunner.modal.initial.runDmnModels}</Text>
              </TextContent>
            </div>
            <br />
            <div>
              <img src={"./images/dmn-runner2.gif"} alt={"DMN Runner usage"} width={"100%"} />
            </div>
            <br />
            <div>
              <TextContent>
                <Text component={TextVariants.p}>{i18n.dmnRunner.modal.initial.dmnRunnerExplanation}</Text>
              </TextContent>
            </div>
            <br />
            <div>
              <TextContent>
                <Text component={TextVariants.p}>
                  <I18nWrapped components={{ icon: <ExclamationCircleIcon /> }}>
                    {i18n.dmnRunner.modal.initial.notificationPanelExplanation}
                  </I18nWrapped>
                </Text>
              </TextContent>
            </div>
            <br />
            <div style={{ margin: "10px" }}>
              <Button onClick={() => setModalPage(ModalPage.WIZARD)}>{i18n.terms.setup}</Button>
            </div>
          </div>
        </div>
      )}
      {modalPage === ModalPage.WIZARD && (
        <div>
          <Form isHorizontal={true}>
            <FormGroup fieldId={"select-os"} label={i18n.terms.os.full}>
              <SelectOs selected={operatingSystem} onSelect={setOperatingSystem} direction={SelectDirection.down} />
            </FormGroup>
          </Form>
          <br />
          <Wizard
            steps={wizardSteps}
            height={400}
            footer={<DmnRunnerWizardFooter onClose={onClose} steps={wizardSteps} setModalPage={setModalPage} />}
          />
        </div>
      )}
      {modalPage === ModalPage.USE && (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div style={{ margin: "20px" }}>
            <TextContent>
              <Text component={TextVariants.h1}>{i18n.dmnRunner.modal.use.title}</Text>
            </TextContent>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <TextContent style={{ margin: "10px" }}>
              <Text component={TextVariants.h3} style={{ textAlign: "center" }}>
                {i18n.dmnRunner.modal.use.connected}
              </Text>
              <Text component={TextVariants.p} style={{ textAlign: "center" }}>
                {i18n.dmnRunner.modal.use.fillTheForm}
              </Text>
            </TextContent>
            <br />
            <Button variant="primary" type="submit" onClick={onClose} style={{ margin: "10px" }}>
              {i18n.dmnRunner.modal.use.backToEditor}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

interface WizardImperativeControlProps {
  onClose: () => void;
  steps: Array<{ component: JSX.Element; name: string }>;
  setModalPage: React.Dispatch<ModalPage>;
}

function DmnRunnerWizardFooter(props: WizardImperativeControlProps) {
  const wizardContext = useContext(WizardContext);
  const { status } = useDmnRunner();
  const { i18n } = useOnlineI18n();

  useEffect(() => {
    if (status === DmnRunnerStatus.STOPPED) {
      wizardContext.goToStepByName(props.steps[1].name);
    }
  }, [status, props.setModalPage]);

  return (
    <WizardFooter>
      <WizardContextConsumer>
        {({ activeStep, goToStepByName, goToStepById, onNext, onBack }) => {
          if (activeStep.name !== i18n.terms.start) {
            return (
              <>
                <Button variant="primary" type="submit" onClick={onNext}>
                  {i18n.terms.next}
                </Button>
              </>
            );
          } else {
            return (
              <>
                <Button variant="primary" type="submit" onClick={onBack}>
                  {i18n.terms.back}
                </Button>
              </>
            );
          }
        }}
      </WizardContextConsumer>
    </WizardFooter>
  );
}

function DmnRunnerPortForm() {
  const dmnRunner = useDmnRunner();
  const { i18n } = useOnlineI18n();

  return (
    <>
      <Text component={TextVariants.p}>
        <I18nWrapped components={{ port: <Text className={"kogito--code"}>{DMN_RUNNER_DEFAULT_PORT}</Text> }}>
          {i18n.dmnRunner.modal.wizard.advancedSettings.title}
        </I18nWrapped>
      </Text>
      <br />
      <Form isHorizontal={true}>
        <FormGroup
          fieldId={"dmn-runner-port"}
          label={i18n.dmnRunner.modal.wizard.advancedSettings.label}
          validated={
            dmnRunner.port === "" || parseInt(dmnRunner.port, 10) < 0 || parseInt(dmnRunner.port, 10) > 65353
              ? "error"
              : "success"
          }
          helperTextInvalid={i18n.dmnRunner.modal.wizard.advancedSettings.helperTextInvalid}
        >
          <TextInput value={dmnRunner.port} type={"number"} onChange={(value) => dmnRunner.saveNewPort(value)} />
        </FormGroup>
      </Form>
    </>
  );
}
