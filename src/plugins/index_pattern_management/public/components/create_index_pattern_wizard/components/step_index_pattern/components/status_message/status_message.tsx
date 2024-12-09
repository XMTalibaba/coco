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

import { EuiCallOut } from '@elastic/eui';
import { EuiIconType } from '@elastic/eui/src/components/icon/icon';

import { FormattedMessage } from '@kbn/i18n/react';
import { MatchedItem } from '../../../../types';

interface StatusMessageProps {
  matchedIndices: {
    allIndices: MatchedItem[];
    exactMatchedIndices: MatchedItem[];
    partialMatchedIndices: MatchedItem[];
  };
  isIncludingSystemIndices: boolean;
  query: string;
  showSystemIndices: boolean;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({
  matchedIndices: { allIndices = [], exactMatchedIndices = [], partialMatchedIndices = [] },
  isIncludingSystemIndices,
  query,
  showSystemIndices,
}) => {
  let statusIcon: EuiIconType | undefined;
  let statusMessage;
  let statusColor: 'primary' | 'success' | 'warning' | undefined;

  const allIndicesLength = allIndices.length;

  if (query.length === 0) {
    statusIcon = undefined;
    statusColor = 'primary';

    if (allIndicesLength >= 1) {
      statusMessage = (
        <span>
          <FormattedMessage
            id="indexPatternManagement.createIndexPattern.step.status.matchAnyLabel.matchAnyDetail"
            defaultMessage="您的索引模式可以匹配{sourceCount, plural, one {您的 # 个源} other {您的 # 个源中的任何一个} }."
            values={{ sourceCount: allIndicesLength }}
          />
        </span>
      );
    } else if (!isIncludingSystemIndices && showSystemIndices) {
      statusMessage = (
        <span>
          <FormattedMessage
            id="indexPatternManagement.createIndexPattern.step.status.noSystemIndicesWithPromptLabel"
            defaultMessage="没有 Elasticsearch 索引匹配您的模式。要查看匹配的系统索引，请切换上面的开关."
          />
        </span>
      );
    } else {
      statusMessage = (
        <span>
          <FormattedMessage
            id="indexPatternManagement.createIndexPattern.step.status.noSystemIndicesLabel"
            defaultMessage="没有 Elasticsearch 索引匹配您的模式."
          />
        </span>
      );
    }
  } else if (exactMatchedIndices.length) {
    statusIcon = 'check';
    statusColor = 'success';
    statusMessage = (
      <span>
        &nbsp;
        <FormattedMessage
          id="indexPatternManagement.createIndexPattern.step.status.successLabel.successDetail"
          defaultMessage="您的索引模式匹配 {sourceCount} 个{sourceCount, plural, one {源} other {源} }."
          values={{
            sourceCount: exactMatchedIndices.length,
          }}
        />
      </span>
    );
  } else if (partialMatchedIndices.length) {
    statusIcon = undefined;
    statusColor = 'primary';
    statusMessage = (
      <span>
        <FormattedMessage
          id="indexPatternManagement.createIndexPattern.step.status.partialMatchLabel.partialMatchDetail"
          defaultMessage="您的索引模式不匹配任何索引，但您的 {strongIndices}{matchedIndicesLength, plural, one {看起来} other {看起来} }类似."
          values={{
            matchedIndicesLength: partialMatchedIndices.length,
            strongIndices: (
              <strong>
                <FormattedMessage
                  id="indexPatternManagement.createIndexPattern.step.status.partialMatchLabel.strongIndicesLabel"
                  defaultMessage="{matchedIndicesLength, plural, one {索引} other {# 个索引} }"
                  values={{ matchedIndicesLength: partialMatchedIndices.length }}
                />
              </strong>
            ),
          }}
        />
      </span>
    );
  } else {
    statusIcon = undefined;
    statusColor = 'warning';
    statusMessage = (
      <span>
        <FormattedMessage
          id="indexPatternManagement.createIndexPattern.step.status.notMatchLabel.notMatchDetail"
          defaultMessage="输入的索引模式不匹配任何索引。您可以在下面匹配您的 {strongIndices}{indicesLength, plural, one {} other {中任何一个} }."
          values={{
            strongIndices: (
              <strong>
                <FormattedMessage
                  id="indexPatternManagement.createIndexPattern.step.status.notMatchLabel.allIndicesLabel"
                  defaultMessage="{indicesLength, plural, one {# 个索引} other {# 个索引} }"
                  values={{ indicesLength: allIndicesLength }}
                />
              </strong>
            ),
            indicesLength: allIndicesLength,
          }}
        />
      </span>
    );
  }

  return (
    <EuiCallOut
      size="s"
      color={statusColor}
      data-test-subj="createIndexPatternStatusMessage"
      iconType={statusIcon}
      title={statusMessage}
    />
  );
};
