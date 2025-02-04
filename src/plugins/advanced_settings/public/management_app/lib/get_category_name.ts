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

const upperFirst = (str = '') => str.replace(/^./, (strng) => strng.toUpperCase());

const names: Record<string, string> = {
  general: i18n.translate('advancedSettings.categoryNames.generalLabel', {
    defaultMessage: '常规',
  }),
  timelion: i18n.translate('advancedSettings.categoryNames.timelionLabel', {
    defaultMessage: 'Timelion',
  }),
  notifications: i18n.translate('advancedSettings.categoryNames.notificationsLabel', {
    defaultMessage: '通知',
  }),
  visualizations: i18n.translate('advancedSettings.categoryNames.visualizationsLabel', {
    defaultMessage: '可视化',
  }),
  discover: i18n.translate('advancedSettings.categoryNames.discoverLabel', {
    defaultMessage: '日志发现',
  }),
  dashboard: i18n.translate('advancedSettings.categoryNames.dashboardLabel', {
    defaultMessage: '常规',
  }),
  reporting: i18n.translate('advancedSettings.categoryNames.reportingLabel', {
    defaultMessage: 'Reporting',
  }),
  search: i18n.translate('advancedSettings.categoryNames.searchLabel', {
    defaultMessage: '搜索',
  }),
  securitySolution: i18n.translate('advancedSettings.categoryNames.securitySolutionLabel', {
    defaultMessage: '安全解决方案',
  }),
};

export function getCategoryName(category?: string) {
  return category ? names[category] || upperFirst(category) : '';
}
