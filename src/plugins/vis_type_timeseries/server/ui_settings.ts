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

import { MAX_BUCKETS_SETTING } from '../common/constants';

export const uiSettings: Record<string, UiSettingsParams> = {
  [MAX_BUCKETS_SETTING]: {
    name: i18n.translate('visTypeTimeseries.advancedSettings.maxBucketsTitle', {
      defaultMessage: '最大存储桶数',
    }),
    value: 2000,
    description: i18n.translate('visTypeTimeseries.advancedSettings.maxBucketsText', {
      defaultMessage: '单个数据源可以返回的最大存储桶数目',
    }),
    schema: schema.number(),
  },
};
