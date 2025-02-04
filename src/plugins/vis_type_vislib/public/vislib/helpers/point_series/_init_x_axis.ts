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

import { uniq } from 'lodash';
import moment from 'moment';
import { Chart } from './point_series';
import { Table } from '../../types';

export function initXAxis(chart: Chart, table: Table) {
  const { format, title, params, accessor } = chart.aspects.x[0];

  chart.xAxisOrderedValues =
    accessor === -1 && 'defaultValue' in params
      ? [params.defaultValue]
      : uniq(table.rows.map((r) => r[accessor]));
  chart.xAxisFormat = format;
  const titleText = {
    timestamp: '时间',
    'data.vulnerability.cve': 'CVE',
  };
  let text = title;
  Object.keys(titleText).some((key) => {
    if (title.includes(`${key}`)) {
      text = titleText[key];

      return true;
    }
  });
  chart.xAxisLabel = text;

  if ('interval' in params) {
    const { interval } = params;
    if ('date' in params) {
      const { intervalESUnit, intervalESValue } = params;
      chart.ordered = {
        interval: moment.duration(interval),
        intervalESUnit,
        intervalESValue,
      };
    } else {
      chart.ordered = {
        interval: params.interval,
      };
    }
  }
}
