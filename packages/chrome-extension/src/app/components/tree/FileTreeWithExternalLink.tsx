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
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { extractOpenFileExtension } from "../../utils";
import { ExternalEditorManager } from "../../../ExternalEditorManager";
import { OpenExternalEditorButton } from "./OpenExternalEditorButton";
import { useGlobals } from "../common/GlobalContext";
import { Router } from "@kogito-tooling/core-api";

interface ExternalLinkInfo {
  id: string;
  url: string;
  container: HTMLElement;
}

export function FileTreeWithExternalLink() {
  const { externalEditorManager, router, dependencies, logger } = useGlobals();

  const [links, setLinksToFiles] = useState<HTMLAnchorElement[]>([]);

  useEffect(() => {
    removeDisplayBlockClass(dependencies.treeView.fileSpanElements());
    const newLinks = filterLinks(dependencies.treeView.linksToFiles(), router);
    if (newLinks.length === 0) {
      return;
    }
    setLinksToFiles(newLinks);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      removeDisplayBlockClass(dependencies.treeView.fileSpanElements());
      const addedNodes = mutations.reduce((l, r) => [...l, ...Array.from(r.addedNodes)], []);
      if (addedNodes.length <= 0) {
        return;
      }

      const newLinks = filterLinks(dependencies.treeView.linksToFiles(), router);
      if (newLinks.length === 0) {
        return;
      }

      logger.log("Found new links...");
      setLinksToFiles(newLinks);
    });

    observer.observe(dependencies.treeView.repositoryContainer()!, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, [links]);

  return (
    <>
      {links.map(link =>
        ReactDOM.createPortal(
          <OpenExternalEditorButton
            id={externalLinkId(link)}
            href={createTargetUrl(link.pathname, externalEditorManager)}
          />,
          link.parentElement!.parentElement!,
          externalLinkId(link)
        )
      )}
    </>
  );
}

function filterLinks(links: HTMLAnchorElement[], router: Router): HTMLAnchorElement[] {
  return links.filter(
    fileLink =>
      router.getLanguageData(extractOpenFileExtension(fileLink.href) as any) &&
      !document.getElementById(externalLinkId(fileLink))
  );
}

function externalLinkId(fileLink: HTMLAnchorElement): string {
  return "external_editor_" + fileLink.id;
}

function removeDisplayBlockClass(spans: HTMLSpanElement[]) {
  spans.forEach(span => span.classList.remove("d-block"));
}

export function createTargetUrl(pathname: string, externalEditorManager?: ExternalEditorManager): string {
  const split = pathname.split("/");
  split.splice(0, 1);
  split.splice(2, 1);
  const linkToOpen = split.join("/");
  return externalEditorManager!.getLink(linkToOpen);
}
