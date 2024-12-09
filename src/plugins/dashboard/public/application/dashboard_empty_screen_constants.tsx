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

/** READONLY VIEW CONSTANTS **/
export const emptyDashboardTitle: string = i18n.translate('dashboard.emptyDashboardTitle', {
  defaultMessage: '此仪表板是空的.',
});
export const emptyDashboardAdditionalPrivilege = i18n.translate(
  'dashboard.emptyDashboardAdditionalPrivilege',
  {
    defaultMessage: '您还需要其他权限，才能编辑此仪表板.',
  }
);
/** VIEW MODE CONSTANTS **/
export const fillDashboardTitle: string = i18n.translate('dashboard.fillDashboardTitle', {
  defaultMessage: '此仪表板是空的。让我们来填充它！',
});
export const howToStartWorkingOnNewDashboardDescription1: string = i18n.translate(
  'dashboard.howToStartWorkingOnNewDashboardDescription1',
  {
    defaultMessage: '点击',
  }
);
export const howToStartWorkingOnNewDashboardDescription2: string = i18n.translate(
  'dashboard.howToStartWorkingOnNewDashboardDescription2',
  {
    defaultMessage: '上面菜单栏以开始添加面板。',
  }
);
export const howToStartWorkingOnNewDashboardEditLinkText: string = i18n.translate(
  'dashboard.howToStartWorkingOnNewDashboardEditLinkText',
  {
    defaultMessage: '编辑',
  }
);
export const howToStartWorkingOnNewDashboardEditLinkAriaLabel: string = i18n.translate(
  'dashboard.howToStartWorkingOnNewDashboardEditLinkAriaLabel',
  {
    defaultMessage: '编辑仪表板',
  }
);
/** EDIT MODE CONSTANTS **/
export const addExistingVisualizationLinkText: string = i18n.translate(
  'dashboard.addExistingVisualizationLinkText',
  {
    defaultMessage: '将现有',
  }
);
export const addExistingVisualizationLinkAriaLabel: string = i18n.translate(
  'dashboard.addVisualizationLinkAriaLabel',
  {
    defaultMessage: '添加现有可视化',
  }
);
export const addNewVisualizationDescription: string = i18n.translate(
  'dashboard.addNewVisualizationText',
  {
    defaultMessage: '或新对象添加到此仪表板',
  }
);
export const createNewVisualizationButton: string = i18n.translate(
  'dashboard.createNewVisualizationButton',
  {
    defaultMessage: '新建',
  }
);
export const createNewVisualizationButtonAriaLabel: string = i18n.translate(
  'dashboard.createNewVisualizationButtonAriaLabel',
  {
    defaultMessage: '新建可视化按钮',
  }
);
