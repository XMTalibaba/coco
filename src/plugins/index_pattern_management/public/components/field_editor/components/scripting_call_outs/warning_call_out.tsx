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

import React, { Fragment } from 'react';

import { EuiCallOut, EuiIcon, EuiLink, EuiSpacer } from '@elastic/eui';

import { FormattedMessage } from '@kbn/i18n/react';

import { useKibana } from '../../../../../../../plugins/kibana_react/public';
import { IndexPatternManagmentContext } from '../../../../types';

export interface ScriptingWarningCallOutProps {
  isVisible: boolean;
}

export const ScriptingWarningCallOut = ({ isVisible = false }: ScriptingWarningCallOutProps) => {
  const docLinksScriptedFields = useKibana<IndexPatternManagmentContext>().services.docLinks?.links
    .scriptedFields;
  return isVisible ? (
    <Fragment>
      <EuiCallOut
        title={
          <FormattedMessage
            id="indexPatternManagement.warningCallOutHeader"
            defaultMessage="谨慎操作"
          />
        }
        color="warning"
        iconType="alert"
      >
        <p>
          <FormattedMessage
            id="indexPatternManagement.warningCallOutLabel.callOutDetail"
            defaultMessage="请先熟悉{scripFields}以及{scriptsInAggregation}，然后再使用脚本字段."
            values={{
              scripFields: (
                <EuiLink target="_blank" href={docLinksScriptedFields.scriptFields}>
                  <FormattedMessage
                    id="indexPatternManagement.warningCallOutLabel.scripFieldsLink"
                    defaultMessage="脚本字段"
                  />
                  &nbsp;
                  <EuiIcon type="link" />
                </EuiLink>
              ),
              scriptsInAggregation: (
                <EuiLink target="_blank" href={docLinksScriptedFields.scriptAggs}>
                  <FormattedMessage
                    id="indexPatternManagement.warningCallOutLabel.scriptsInAggregationLink"
                    defaultMessage="聚合中的脚本"
                  />
                  &nbsp;
                  <EuiIcon type="link" />
                </EuiLink>
              ),
            }}
          />
        </p>
        <p>
          <FormattedMessage
            id="indexPatternManagement.warningCallOut.descriptionLabel"
            defaultMessage="脚本字段可用于显示并聚合计算值。因此，它们会很慢，如果操作不当，会导致 Kibana 不可用。此处没有安全网。如果拼写错误，则在任何地方都会引发异常！"
          />
        </p>
      </EuiCallOut>
      <EuiSpacer size="m" />
    </Fragment>
  ) : null;
};

ScriptingWarningCallOut.displayName = 'ScriptingWarningCallOut';
