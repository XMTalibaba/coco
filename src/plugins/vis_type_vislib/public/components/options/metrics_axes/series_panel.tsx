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

import { EuiPanel, EuiTitle, EuiSpacer, EuiAccordion } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

import { Vis } from '../../../../../visualizations/public';
import { ValueAxis, SeriesParam } from '../../../types';
import { ChartOptions } from './chart_options';
import { SetParamByIndex, ChangeValueAxis } from '.';

export interface SeriesPanelProps {
  changeValueAxis: ChangeValueAxis;
  setParamByIndex: SetParamByIndex;
  seriesParams: SeriesParam[];
  valueAxes: ValueAxis[];
  vis: Vis;
}

function SeriesPanel({ seriesParams, ...chartProps }: SeriesPanelProps) {
  return (
    <EuiPanel paddingSize="s">
      <EuiTitle size="xs">
        <h3>
          <FormattedMessage
            id="visTypeVislib.controls.pointSeries.series.metricsTitle"
            defaultMessage="指标"
          />
        </h3>
      </EuiTitle>
      <EuiSpacer size="s" />

      {seriesParams.map((chart, index) => (
        <EuiAccordion
          id={`visEditorSeriesAccordion${chart.data.id}`}
          key={index}
          className="visEditorSidebar__section visEditorSidebar__collapsible"
          initialIsOpen={index === 0}
          buttonContent={chart.data.label}
          buttonContentClassName="visEditorSidebar__aggGroupAccordionButtonContent eui-textTruncate"
          aria-label={i18n.translate(
            'visTypeVislib.controls.pointSeries.seriesAccordionAriaLabel',
            {
              defaultMessage: '切换 {agg} 选项',
              values: { agg: chart.data.label },
            }
          )}
        >
          <>
            <EuiSpacer size="m" />

            <ChartOptions index={index} chart={chart} {...chartProps} />
          </>
        </EuiAccordion>
      ))}
    </EuiPanel>
  );
}

export { SeriesPanel };
