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

import { EuiForm, EuiFormRow, EuiFieldText, EuiButtonEmpty, EuiSpacer } from '@elastic/eui';

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

interface AdvancedOptionsProps {
  isVisible: boolean;
  indexPatternId: string;
  toggleAdvancedOptions: (e: React.FormEvent<HTMLButtonElement>) => void;
  onChangeIndexPatternId: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  isVisible,
  indexPatternId,
  toggleAdvancedOptions,
  onChangeIndexPatternId,
}) => (
  <div>
    <EuiButtonEmpty
      iconType={isVisible ? 'arrowDown' : 'arrowRight'}
      onClick={toggleAdvancedOptions}
    >
      {isVisible ? (
        <FormattedMessage
          id="indexPatternManagement.createIndexPattern.stepTime.options.hideButton"
          defaultMessage="隐藏高级设置"
        />
      ) : (
        <FormattedMessage
          id="indexPatternManagement.createIndexPattern.stepTime.options.showButton"
          defaultMessage="显示高级设置"
        />
      )}
    </EuiButtonEmpty>
    <EuiSpacer size="xs" />
    {isVisible ? (
      <EuiForm>
        <EuiFormRow
          label={
            <FormattedMessage
              id="indexPatternManagement.createIndexPattern.stepTime.options.patternHeader"
              defaultMessage="定制索引模式ID"
            />
          }
          helpText={
            <FormattedMessage
              id="indexPatternManagement.createIndexPattern.stepTime.options.patternLabel"
              defaultMessage="将为每个索引模式提供唯一的标识符。如果不想使用此唯一 ID，请输入定制 ID."
            />
          }
        >
          <EuiFieldText
            name="indexPatternId"
            data-test-subj="createIndexPatternIdInput"
            value={indexPatternId}
            onChange={onChangeIndexPatternId}
            placeholder={i18n.translate(
              'indexPatternManagement.createIndexPattern.stepTime.options.patternPlaceholder',
              {
                defaultMessage: 'custom-index-pattern-id',
              }
            )}
          />
        </EuiFormRow>
      </EuiForm>
    ) : null}
  </div>
);
