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
import { AppCategory } from '../types';

/** @internal */
export const DEFAULT_APP_CATEGORIES: Record<string, AppCategory> = Object.freeze({
  kibana: {
    id: 'kibana',
    label: i18n.translate('core.ui.kibanaNavList.label', {
      defaultMessage: '日志系统',
    }),
    euiIconType: 'logoKibana',
    order: 1000,
  },
  enterpriseSearch: {
    id: 'enterpriseSearch',
    label: i18n.translate('core.ui.enterpriseSearchNavList.label', {
      defaultMessage: '企业搜索',
    }),
    order: 2000,
    euiIconType: 'logoEnterpriseSearch',
  },
  observability: {
    id: 'observability',
    label: i18n.translate('core.ui.observabilityNavList.label', {
      defaultMessage: '可观测性',
    }),
    euiIconType: 'logoObservability',
    order: 3000,
  },
  security: {
    id: 'securitySolution',
    label: i18n.translate('core.ui.securityNavList.label', {
      defaultMessage: '安全',
    }),
    order: 4000,
    euiIconType: 'logoSecurity',
  },
  management: {
    id: 'management',
    label: i18n.translate('core.ui.managementNavList.label', {
      defaultMessage: '管理',
    }),
    order: 5000,
    euiIconType: 'managementApp',
  },
});
