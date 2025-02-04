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
import { FeatureCatalogueCategory, HomePublicPluginSetup } from '../../home/public';

export function registerFeature(home: HomePublicPluginSetup) {
  home.featureCatalogue.register({
    id: 'discover',
    title: i18n.translate('discover.discoverTitle', {
      defaultMessage: '日志管理',
    }),
    subtitle: i18n.translate('discover.discoverSubtitle', {
      defaultMessage: '搜索和查找.',
    }),
    description: i18n.translate('discover.discoverDescription', {
      defaultMessage: '通过查询和筛选原始文档来以交互方式浏览您的数据.',
    }),
    icon: 'discoverApp',
    path: '/app/discover#/',
    showOnHomePage: false,
    category: FeatureCatalogueCategory.DATA,
    solutionId: 'kibana',
    order: 200,
  });
}
