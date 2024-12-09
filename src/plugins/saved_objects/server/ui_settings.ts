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
import { PER_PAGE_SETTING, LISTING_LIMIT_SETTING } from '../common';

export const uiSettings: Record<string, UiSettingsParams> = {
  [PER_PAGE_SETTING]: {
    name: i18n.translate('savedObjects.advancedSettings.perPageTitle', {
      defaultMessage: '每页对象数',
    }),
    value: 20,
    type: 'number',
    description: i18n.translate('savedObjects.advancedSettings.perPageText', {
      defaultMessage: '加载对话框中每页要显示的对象数目',
    }),
    schema: schema.number(),
  },
  [LISTING_LIMIT_SETTING]: {
    name: i18n.translate('savedObjects.advancedSettings.listingLimitTitle', {
      defaultMessage: '对象列表限制',
    }),
    type: 'number',
    value: 1000,
    description: i18n.translate('savedObjects.advancedSettings.listingLimitText', {
      defaultMessage: '要为列表页面提取的对象数目',
    }),
    schema: schema.number(),
  },
};
