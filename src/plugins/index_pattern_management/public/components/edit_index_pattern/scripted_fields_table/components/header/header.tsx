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
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiText, EuiTitle } from '@elastic/eui';

import { FormattedMessage } from '@kbn/i18n/react';
import { ScopedHistory } from 'kibana/public';

import { reactRouterNavigate } from '../../../../../../../kibana_react/public';

interface HeaderProps extends RouteComponentProps {
  indexPatternId: string;
  history: ScopedHistory;
}

export const Header = withRouter(({ indexPatternId, history }: HeaderProps) => (
  <EuiFlexGroup alignItems="center">
    <EuiFlexItem>
      <EuiTitle size="s">
        <h3>
          <FormattedMessage
            id="indexPatternManagement.editIndexPattern.scriptedHeader"
            defaultMessage="脚本字段"
          />
        </h3>
      </EuiTitle>
      <EuiText>
        <p>
          <FormattedMessage
            id="indexPatternManagement.editIndexPattern.scriptedLabel"
            defaultMessage="可以在可视化中使用脚本字段，并在您的文档中显示它们。但是，您不能搜索脚本字段."
          />
        </p>
      </EuiText>
    </EuiFlexItem>

    <EuiFlexItem grow={false}>
      <EuiButton
        data-test-subj="addScriptedFieldLink"
        {...reactRouterNavigate(history, `patterns/${indexPatternId}/create-field/`)}
      >
        <FormattedMessage
          id="indexPatternManagement.editIndexPattern.scripted.addFieldButton"
          defaultMessage="添加脚本字段"
        />
      </EuiButton>
    </EuiFlexItem>
  </EuiFlexGroup>
));
