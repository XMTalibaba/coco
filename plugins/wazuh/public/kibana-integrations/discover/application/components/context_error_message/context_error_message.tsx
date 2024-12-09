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
import { EuiCallOut, EuiText } from '@elastic/eui';
import { FormattedMessage, I18nProvider } from '@kbn/i18n/react';
// @ts-ignore
import { FAILURE_REASONS, LOADING_STATUS } from '../../angular/context/query';

export interface ContextErrorMessageProps {
  /**
   * the status of the loading action
   */
  status: string;
  /**
   * the reason of the error
   */
  reason?: string;
}

export function ContextErrorMessage({ status, reason }: ContextErrorMessageProps) {
  if (status !== LOADING_STATUS.FAILED) {
    return null;
  }
  return (
    <I18nProvider>
      <EuiCallOut
        title={
          <FormattedMessage
            id="discover.context.failedToLoadAnchorDocumentDescription"
            defaultMessage="加载锚点文件失败"
          />
        }
        color="danger"
        iconType="alert"
        data-test-subj="contextErrorMessageTitle"
      >
        <EuiText data-test-subj="contextErrorMessageBody">
          {reason === FAILURE_REASONS.UNKNOWN && (
            <FormattedMessage
              id="discover.context.reloadPageDescription.reloadOrVisitTextMessage"
              defaultMessage="请重新加载或回到文件列表中选择一个有效的锚点文件。"
            />
          )}
        </EuiText>
      </EuiCallOut>
    </I18nProvider>
  );
}
