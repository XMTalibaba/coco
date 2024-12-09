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

import { i18n } from '@kbn/i18n';
import { IBucketAggConfig } from './bucket_agg_type';

export const autoInterval = 'auto';
export const isAutoInterval = (value: unknown) => value === autoInterval;

export const intervalOptions = [
  {
    display: i18n.translate('data.search.aggs.buckets.intervalOptions.autoDisplayName', {
      defaultMessage: '自动',
    }),
    val: autoInterval,
    enabled(agg: IBucketAggConfig) {
      // not only do we need a time field, but the selected field needs
      // to be the time field. (see #3028)
      return agg.fieldIsTimeField();
    },
  },
  {
    display: i18n.translate('data.search.aggs.buckets.intervalOptions.millisecondDisplayName', {
      defaultMessage: '毫秒',
    }),
    val: 'ms',
  },
  {
    display: i18n.translate('data.search.aggs.buckets.intervalOptions.secondDisplayName', {
      defaultMessage: '秒',
    }),
    val: 's',
  },
  {
    display: i18n.translate('data.search.aggs.buckets.intervalOptions.minuteDisplayName', {
      defaultMessage: '分钟',
    }),
    val: 'm',
  },
  {
    display: i18n.translate('data.search.aggs.buckets.intervalOptions.hourlyDisplayName', {
      defaultMessage: '时',
    }),
    val: 'h',
  },
  {
    display: i18n.translate('data.search.aggs.buckets.intervalOptions.dailyDisplayName', {
      defaultMessage: '日',
    }),
    val: 'd',
  },
  {
    display: i18n.translate('data.search.aggs.buckets.intervalOptions.weeklyDisplayName', {
      defaultMessage: '周',
    }),
    val: 'w',
  },
  {
    display: i18n.translate('data.search.aggs.buckets.intervalOptions.monthlyDisplayName', {
      defaultMessage: '月',
    }),
    val: 'M',
  },
  {
    display: i18n.translate('data.search.aggs.buckets.intervalOptions.yearlyDisplayName', {
      defaultMessage: '年',
    }),
    val: 'y',
  },
];
