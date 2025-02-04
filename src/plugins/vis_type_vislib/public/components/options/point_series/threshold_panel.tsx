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
import React, { useCallback } from 'react';
import { EuiPanel, EuiTitle, EuiColorPicker, EuiFormRow, EuiSpacer } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

import { ValidationVisOptionsProps } from '../../common';
import {
  SelectOption,
  SwitchOption,
  RequiredNumberInputOption,
} from '../../../../../charts/public';
import { BasicVislibParams } from '../../../types';

function ThresholdPanel({
  stateParams,
  setValue,
  setMultipleValidity,
  vis,
}: ValidationVisOptionsProps<BasicVislibParams>) {
  const setThresholdLine = useCallback(
    <T extends keyof BasicVislibParams['thresholdLine']>(
      paramName: T,
      value: BasicVislibParams['thresholdLine'][T]
    ) => setValue('thresholdLine', { ...stateParams.thresholdLine, [paramName]: value }),
    [stateParams.thresholdLine, setValue]
  );

  const setThresholdLineColor = useCallback(
    (value: BasicVislibParams['thresholdLine']['color']) => setThresholdLine('color', value),
    [setThresholdLine]
  );

  const setThresholdLineValidity = useCallback(
    (paramName: keyof BasicVislibParams['thresholdLine'], isValid: boolean) =>
      setMultipleValidity(`thresholdLine__${paramName}`, isValid),
    [setMultipleValidity]
  );

  return (
    <EuiPanel paddingSize="s">
      <EuiTitle size="xs">
        <h3>
          <FormattedMessage
            id="visTypeVislib.editors.pointSeries.thresholdLineSettingsTitle"
            defaultMessage="阈值线条"
          />
        </h3>
      </EuiTitle>
      <EuiSpacer size="m" />

      <SwitchOption
        label={i18n.translate('visTypeVislib.editors.pointSeries.thresholdLine.showLabel', {
          defaultMessage: '显示阈值线条',
        })}
        paramName="show"
        value={stateParams.thresholdLine.show}
        setValue={setThresholdLine}
      />

      {stateParams.thresholdLine.show && (
        <>
          <RequiredNumberInputOption
            label={i18n.translate('visTypeVislib.editors.pointSeries.thresholdLine.valueLabel', {
              defaultMessage: '阙值',
            })}
            paramName="value"
            value={stateParams.thresholdLine.value}
            setValue={setThresholdLine}
            setValidity={setThresholdLineValidity}
          />

          <RequiredNumberInputOption
            label={i18n.translate('visTypeVislib.editors.pointSeries.thresholdLine.widthLabel', {
              defaultMessage: '线条宽度',
            })}
            paramName="width"
            min={1}
            step={1}
            value={stateParams.thresholdLine.width}
            setValue={setThresholdLine}
            setValidity={setThresholdLineValidity}
          />

          <SelectOption
            label={i18n.translate('visTypeVislib.editors.pointSeries.thresholdLine.styleLabel', {
              defaultMessage: '线条样式',
            })}
            options={vis.type.editorConfig.collections.thresholdLineStyles}
            paramName="style"
            value={stateParams.thresholdLine.style}
            setValue={setThresholdLine}
          />

          <EuiFormRow
            label={i18n.translate('visTypeVislib.editors.pointSeries.thresholdLine.colorLabel', {
              defaultMessage: '线条颜色',
            })}
            fullWidth
            compressed
          >
            <EuiColorPicker
              compressed
              color={stateParams.thresholdLine.color}
              fullWidth
              onChange={setThresholdLineColor}
            />
          </EuiFormRow>
        </>
      )}
    </EuiPanel>
  );
}

export { ThresholdPanel };
