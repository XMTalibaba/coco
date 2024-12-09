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
import { schema } from '@kbn/config-schema';

import { UiSettingsParams } from 'kibana/server';
import { DIMMING_OPACITY_SETTING, HEATMAP_MAX_BUCKETS_SETTING } from '../common';

export const uiSettings: Record<string, UiSettingsParams> = {
  [DIMMING_OPACITY_SETTING]: {
    name: i18n.translate('visTypeVislib.advancedSettings.visualization.dimmingOpacityTitle', {
      defaultMessage: '变暗透明度',
    }),
    value: 0.5,
    type: 'number',
    description: i18n.translate('visTypeVislib.advancedSettings.visualization.dimmingOpacityText', {
      defaultMessage:
        '突出显示图表的其他元素时变暗图表项的透明度。此数字越低，突出显示的元素越突出。必须是介于 0 和 1 之间的数字.',
    }),
    category: ['visualization'],
    schema: schema.number(),
  },
  [HEATMAP_MAX_BUCKETS_SETTING]: {
    name: i18n.translate('visTypeVislib.advancedSettings.visualization.heatmap.maxBucketsTitle', {
      defaultMessage: '热图最大存储桶数',
    }),
    value: 50,
    type: 'number',
    description: i18n.translate(
      'visTypeVislib.advancedSettings.visualization.heatmap.maxBucketsText',
      {
        defaultMessage:
          '单个数据源可以返回的最大存储桶数目。较高的数目可能对浏览器呈现性能有负面影响',
      }
    ),
    category: ['visualization'],
    schema: schema.number(),
  },
};
