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
import React, { useMemo, useEffect, useCallback } from 'react';

import { EuiPanel, EuiTitle, EuiSpacer } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

import { VisOptionsProps } from 'src/plugins/vis_default_editor/public';
import { SelectOption, SwitchOption } from '../../../../../charts/public';
import { BasicVislibParams, ValueAxis } from '../../../types';

function GridPanel({ stateParams, setValue, hasHistogramAgg }: VisOptionsProps<BasicVislibParams>) {
  const setGrid = useCallback(
    <T extends keyof BasicVislibParams['grid']>(
      paramName: T,
      value: BasicVislibParams['grid'][T]
    ) => setValue('grid', { ...stateParams.grid, [paramName]: value }),
    [stateParams.grid, setValue]
  );

  const options = useMemo(
    () => [
      ...stateParams.valueAxes.map(({ id, name }: ValueAxis) => ({
        text: name,
        value: id,
      })),
      {
        text: i18n.translate('visTypeVislib.controls.pointSeries.gridAxis.dontShowLabel', {
          defaultMessage: "不显示",
        }),
        value: '',
      },
    ],
    [stateParams.valueAxes]
  );

  useEffect(() => {
    if (hasHistogramAgg) {
      setGrid('categoryLines', false);
    }
  }, [hasHistogramAgg, setGrid]);

  return (
    <EuiPanel paddingSize="s">
      <EuiTitle size="xs">
        <h3>
          <FormattedMessage
            id="visTypeVislib.controls.pointSeries.gridAxis.gridText"
            defaultMessage="网格"
          />
        </h3>
      </EuiTitle>

      <EuiSpacer size="m" />

      <SwitchOption
        disabled={hasHistogramAgg}
        label={i18n.translate('visTypeVislib.controls.pointSeries.gridAxis.xAxisLinesLabel', {
          defaultMessage: '显示 X 轴线',
        })}
        paramName="categoryLines"
        tooltip={
          hasHistogramAgg
            ? i18n.translate(
                'visTypeVislib.controls.pointSeries.gridAxis.yAxisLinesDisabledTooltip',
                {
                  defaultMessage: "直方图的 X 轴线无法显示.",
                }
              )
            : undefined
        }
        value={stateParams.grid.categoryLines}
        setValue={setGrid}
        data-test-subj="showCategoryLines"
      />

      <SelectOption
        id="gridAxis"
        label={i18n.translate('visTypeVislib.controls.pointSeries.gridAxis.yAxisLinesLabel', {
          defaultMessage: 'Y 轴线',
        })}
        options={options}
        paramName="valueAxis"
        value={stateParams.grid.valueAxis || ''}
        setValue={setGrid}
      />
    </EuiPanel>
  );
}

export { GridPanel };
