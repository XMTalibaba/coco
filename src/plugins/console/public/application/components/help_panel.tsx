/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { FormattedMessage } from '@kbn/i18n/react';
import {
  EuiText,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiTitle,
  EuiSpacer,
} from '@elastic/eui';
import { EditorExample } from './editor_example';

interface Props {
  onClose: () => void;
}

export function HelpPanel(props: Props) {
  return (
    <EuiFlyout onClose={props.onClose} data-test-subj="helpFlyout" size="s">
      <EuiFlyoutHeader hasBorder>
        <EuiTitle size="m">
          <h2>
            <FormattedMessage id="console.helpPage.pageTitle" defaultMessage="帮助" />
          </h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiText>
          <h3>
            <FormattedMessage
              defaultMessage="请求格式"
              id="console.helpPage.requestFormatTitle"
            />
          </h3>
          <p>
            <FormattedMessage
              id="console.helpPage.requestFormatDescription"
              defaultMessage="您可以在空白编辑器中键入一个或多个请求。Console 理解紧凑格式的请求："
            />
          </p>
          <EditorExample panel="help" />
          <h3>
            <FormattedMessage
              id="console.helpPage.keyboardCommandsTitle"
              defaultMessage="键盘命令"
            />
          </h3>
          <EuiSpacer />
          <dl>
            <dt>Ctrl/Cmd + I</dt>
            <dd>
              <FormattedMessage
                id="console.helpPage.keyboardCommands.autoIndentDescription"
                defaultMessage="自动缩进当前请求"
              />
            </dd>
            <dt>Ctrl/Cmd + /</dt>
            <dd>
              <FormattedMessage
                id="console.helpPage.keyboardCommands.openDocumentationDescription"
                defaultMessage="打开请求文档"
              />
            </dd>
            <dt>Ctrl + Space</dt>
            <dd>
              <FormattedMessage
                id="console.helpPage.keyboardCommands.openAutoCompleteDescription"
                defaultMessage="打开自动完成（即使未键入）"
              />
            </dd>
            <dt>Ctrl/Cmd + Enter</dt>
            <dd>
              <FormattedMessage
                id="console.helpPage.keyboardCommands.submitRequestDescription"
                defaultMessage="提交请求"
              />
            </dd>
            <dt>Ctrl/Cmd + Up/Down</dt>
            <dd>
              <FormattedMessage
                id="console.helpPage.keyboardCommands.jumpToPreviousNextRequestDescription"
                defaultMessage="跳转至前一/后一请求开头或结尾。"
              />
            </dd>
            <dt>Ctrl/Cmd + Alt + L</dt>
            <dd>
              <FormattedMessage
                id="console.helpPage.keyboardCommands.collapseExpandCurrentScopeDescription"
                defaultMessage="折叠/展开当前范围。"
              />
            </dd>
            <dt>Ctrl/Cmd + Option + 0</dt>
            <dd>
              <FormattedMessage
                id="console.helpPage.keyboardCommands.collapseAllScopesDescription"
                defaultMessage="折叠当前范围除外的所有范围。通过加按 Shift 键来展开。"
              />
            </dd>
            <dt>Down arrow</dt>
            <dd>
              <FormattedMessage
                id="console.helpPage.keyboardCommands.switchFocusToAutoCompleteMenuDescription"
                defaultMessage="将焦点切换到自动完成菜单。使用箭头进一步选择词"
              />
            </dd>
            <dt>Enter/Tab</dt>
            <dd>
              <FormattedMessage
                id="console.helpPage.keyboardCommands.selectCurrentlySelectedInAutoCompleteMenuDescription"
                defaultMessage="选择自动完成菜单中当前选定的词或最顶部的词"
              />
            </dd>
            <dt>Esc</dt>
            <dd>
              <FormattedMessage
                id="console.helpPage.keyboardCommands.closeAutoCompleteMenuDescription"
                defaultMessage="关闭自动完成菜单"
              />
            </dd>
          </dl>
        </EuiText>
      </EuiFlyoutBody>
    </EuiFlyout>
  );
}
