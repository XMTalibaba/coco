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
import React, { useMemo } from 'react';
import { EuiPanel, EuiTitle, EuiSpacer } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { uniq } from 'lodash';

import { ValidationVisOptionsProps } from '../../common';
import { BasicOptions, SwitchOption } from '../../../../../charts/public';
import { GridPanel } from './grid_panel';
import { ThresholdPanel } from './threshold_panel';
import { BasicVislibParams } from '../../../types';
import { ChartTypes } from '../../../utils/collections';

function PointSeriesOptions(props: ValidationVisOptionsProps<BasicVislibParams>) {
  const { stateParams, setValue, vis } = props;

  const currentChartTypes = useMemo(() => uniq(stateParams.seriesParams.map(({ type }) => type)), [
    stateParams.seriesParams,
  ]);

  return (
    <>
      <EuiPanel paddingSize="s">
        <EuiTitle size="xs">
          <h3>
            <FormattedMessage
              id="visTypeVislib.editors.pointSeries.settingsTitle"
              defaultMessage="设置"
            />
          </h3>
        </EuiTitle>
        <EuiSpacer size="m" />

        <BasicOptions {...props} />

        {vis.data.aggs!.aggs.some(
          (agg) => agg.schema === 'segment' && agg.type.name === 'date_histogram'
        ) ? (
          <SwitchOption
            label={i18n.translate('visTypeVislib.editors.pointSeries.currentTimeMarkerLabel', {
              defaultMessage: '当前时间标记',
            })}
            paramName="addTimeMarker"
            value={stateParams.addTimeMarker}
            setValue={setValue}
          />
        ) : (
          <SwitchOption
            label={i18n.translate('visTypeVislib.editors.pointSeries.orderBucketsBySumLabel', {
              defaultMessage: '按总计值排序存储桶',
            })}
            paramName="orderBucketsBySum"
            value={stateParams.orderBucketsBySum}
            setValue={setValue}
          />
        )}

        {currentChartTypes.includes(ChartTypes.HISTOGRAM) && (
          <SwitchOption
            data-test-subj="showValuesOnChart"
            label={i18n.translate('visTypeVislib.editors.pointSeries.showLabels', {
              defaultMessage: '在图表上显示值',
            })}
            paramName="show"
            value={stateParams.labels.show}
            setValue={(paramName, value) =>
              setValue('labels', { ...stateParams.labels, [paramName]: value })
            }
          />
        )}
      </EuiPanel>

      <EuiSpacer size="s" />

      <GridPanel {...props} />

      <EuiSpacer size="s" />

      {stateParams.thresholdLine && <ThresholdPanel {...props} />}
    </>
  );
}

export { PointSeriesOptions };
