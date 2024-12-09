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
import { ManagementSectionId } from '../types';

const ingestTitle = i18n.translate('management.sections.ingestTitle', {
  defaultMessage: '采集',
});

const ingestTip = i18n.translate('management.sections.ingestTip', {
  defaultMessage: '管理如何转换数据并将其加载到集群中',
});

const dataTitle = i18n.translate('management.sections.dataTitle', {
  defaultMessage: '数据',
});

const dataTip = i18n.translate('management.sections.dataTip', {
  defaultMessage: '管理您的集群数据和备份',
});

const insightsAndAlertingTitle = i18n.translate('management.sections.insightsAndAlertingTitle', {
  defaultMessage: '告警和发现',
});

const insightsAndAlertingTip = i18n.translate('management.sections.insightsAndAlertingTip', {
  defaultMessage: '管理如何检测数据变化',
});

const sectionTitle = i18n.translate('management.sections.section.title', {
  defaultMessage: '安全',
});

const sectionTip = i18n.translate('management.sections.section.tip', {
  defaultMessage: '控制对功能和数据的访问',
});

const kibanaTitle = i18n.translate('management.sections.kibanaTitle', {
  defaultMessage: '索引控制台',
});

const kibanaTip = i18n.translate('management.sections.kibanaTip', {
  defaultMessage: '管理索引',
});

const stackTitle = i18n.translate('management.sections.stackTitle', {
  defaultMessage: '索引配置',
});

const stackTip = i18n.translate('management.sections.stackTip', {
  defaultMessage: '管理索引配置',
});

export const IngestSection = {
  id: ManagementSectionId.Ingest,
  title: ingestTitle,
  tip: ingestTip,
  order: 0,
};

export const DataSection = {
  id: ManagementSectionId.Data,
  title: dataTitle,
  tip: dataTip,
  order: 1,
};

export const InsightsAndAlertingSection = {
  id: ManagementSectionId.InsightsAndAlerting,
  title: insightsAndAlertingTitle,
  tip: insightsAndAlertingTip,
  order: 2,
};

export const SecuritySection = {
  id: 'security',
  title: sectionTitle,
  tip: sectionTip,
  order: 3,
};

export const KibanaSection = {
  id: ManagementSectionId.Kibana,
  title: kibanaTitle,
  tip: kibanaTip,
  order: 4,
};

export const StackSection = {
  id: ManagementSectionId.Stack,
  title: stackTitle,
  tip: stackTip,
  order: 4,
};

export const managementSections = [
  IngestSection,
  DataSection,
  InsightsAndAlertingSection,
  SecuritySection,
  KibanaSection,
  StackSection,
];
