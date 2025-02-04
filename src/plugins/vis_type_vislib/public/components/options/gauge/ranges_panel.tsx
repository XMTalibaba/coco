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
import { EuiPanel, EuiSpacer, EuiTitle } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

import {
  ColorRanges,
  ColorSchemaOptions,
  ColorSchemaParams,
  SetColorRangeValue,
  SwitchOption,
  ColorSchemas,
} from '../../../../../charts/public';
import { GaugeOptionsInternalProps } from '../gauge';
import { Gauge } from '../../../gauge';

function RangesPanel({
  setGaugeValue,
  setTouched,
  setValidity,
  setValue,
  stateParams,
  uiState,
  vis,
}: GaugeOptionsInternalProps) {
  const setColorSchemaOptions = useCallback(
    <T extends keyof ColorSchemaParams>(paramName: T, value: ColorSchemaParams[T]) => {
      setGaugeValue(paramName, value as Gauge[T]);
      // set outline if color schema is changed to greys
      // if outline wasn't set explicitly yet
      if (
        paramName === 'colorSchema' &&
        (value as string) === ColorSchemas.Greys &&
        typeof stateParams.gauge.outline === 'undefined'
      ) {
        setGaugeValue('outline', true);
      }
    },
    [setGaugeValue, stateParams]
  );

  return (
    <EuiPanel paddingSize="s">
      <EuiTitle size="xs">
        <h3>
          <FormattedMessage
            id="visTypeVislib.controls.gaugeOptions.rangesTitle"
            defaultMessage="范围"
          />
        </h3>
      </EuiTitle>
      <EuiSpacer size="s" />

      <ColorRanges
        data-test-subj="gaugeColorRange"
        colorsRange={stateParams.gauge.colorsRange}
        setValue={setGaugeValue as SetColorRangeValue}
        setTouched={setTouched}
        setValidity={setValidity}
      />

      <SwitchOption
        disabled={stateParams.gauge.colorsRange.length < 2}
        label={i18n.translate('visTypeVislib.controls.gaugeOptions.autoExtendRangeLabel', {
          defaultMessage: '自动扩展范围',
        })}
        tooltip={i18n.translate('visTypeVislib.controls.gaugeOptions.extendRangeTooltip', {
          defaultMessage: '将数据范围扩展到数据中的最大值.',
        })}
        paramName="extendRange"
        value={stateParams.gauge.extendRange}
        setValue={setGaugeValue}
      />

      <SwitchOption
        data-test-subj="gaugePercentageMode"
        label={i18n.translate('visTypeVislib.controls.gaugeOptions.percentageModeLabel', {
          defaultMessage: '百分比模式',
        })}
        paramName="percentageMode"
        value={stateParams.gauge.percentageMode}
        setValue={setGaugeValue}
      />

      <ColorSchemaOptions
        disabled={stateParams.gauge.colorsRange.length < 2}
        colorSchema={stateParams.gauge.colorSchema}
        colorSchemas={vis.type.editorConfig.collections.colorSchemas}
        invertColors={stateParams.gauge.invertColors}
        uiState={uiState}
        setValue={setColorSchemaOptions}
      />

      <SwitchOption
        label={i18n.translate('visTypeVislib.controls.gaugeOptions.showOutline', {
          defaultMessage: '显示轮廓',
        })}
        paramName="outline"
        value={stateParams.gauge.outline}
        setValue={setGaugeValue}
      />

      <SwitchOption
        label={i18n.translate('visTypeVislib.controls.gaugeOptions.showLegendLabel', {
          defaultMessage: '显示图例',
        })}
        paramName="addLegend"
        value={stateParams.addLegend}
        setValue={setValue}
      />

      <SwitchOption
        label={i18n.translate('visTypeVislib.controls.gaugeOptions.showScaleLabel', {
          defaultMessage: '显示比例',
        })}
        paramName="show"
        value={stateParams.gauge.scale.show}
        setValue={(paramName, value) =>
          setGaugeValue('scale', { ...stateParams.gauge.scale, [paramName]: value })
        }
      />
    </EuiPanel>
  );
}

export { RangesPanel };
