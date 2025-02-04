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

import {
  EuiForm,
  EuiFormRow,
  EuiSpacer,
  EuiLink,
  EuiSelect,
  EuiText,
  EuiLoadingSpinner,
} from '@elastic/eui';

import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

interface TimeFieldProps {
  isVisible: boolean;
  fetchTimeFields: () => void;
  timeFieldOptions: Array<{ text: string; value?: string }>;
  isLoading: boolean;
  selectedTimeField?: string;
  onTimeFieldChanged: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const TimeField: React.FC<TimeFieldProps> = ({
  isVisible,
  fetchTimeFields,
  timeFieldOptions,
  isLoading,
  selectedTimeField,
  onTimeFieldChanged,
}) => (
  <EuiForm>
    {isVisible ? (
      <>
        <EuiText>
          <p>
            <FormattedMessage
              id="indexPatternManagement.createIndexPattern.stepTime.timeDescription"
              defaultMessage="选择用于全局时间筛选的主要时间字段."
            />
          </p>
        </EuiText>
        <EuiSpacer />
        <EuiFormRow
          label={
            <FormattedMessage
              id="indexPatternManagement.createIndexPattern.stepTime.fieldLabel"
              defaultMessage="Time 字段"
            />
          }
          labelAppend={
            isLoading ? (
              <EuiLoadingSpinner size="s" />
            ) : (
              <EuiText size="xs">
                <EuiLink onClick={fetchTimeFields}>
                  <FormattedMessage
                    id="indexPatternManagement.createIndexPattern.stepTime.refreshButton"
                    defaultMessage="刷新"
                  />
                </EuiLink>
              </EuiText>
            )
          }
        >
          {isLoading ? (
            <EuiSelect
              name="timeField"
              data-test-subj="createIndexPatternTimeFieldSelect"
              options={[
                {
                  text: i18n.translate(
                    'indexPatternManagement.createIndexPattern.stepTime.field.loadingDropDown',
                    {
                      defaultMessage: '等待…',
                    }
                  ),
                  value: '',
                },
              ]}
              disabled={true}
            />
          ) : (
            <EuiSelect
              name="timeField"
              data-test-subj="createIndexPatternTimeFieldSelect"
              options={timeFieldOptions}
              isLoading={isLoading}
              disabled={isLoading}
              value={selectedTimeField}
              onChange={onTimeFieldChanged}
            />
          )}
        </EuiFormRow>
      </>
    ) : (
      <EuiText>
        <p>
          <FormattedMessage
            id="indexPatternManagement.createIndexPattern.stepTime.field.noTimeFieldsLabel"
            defaultMessage="匹配此索引模式的索引不包含任何时间字段."
          />
        </p>
      </EuiText>
    )}
  </EuiForm>
);
