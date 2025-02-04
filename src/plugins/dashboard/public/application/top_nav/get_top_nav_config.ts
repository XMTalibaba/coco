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
import { AppMountParameters } from 'kibana/public';
import { ViewMode } from '../../embeddable_plugin';
import { TopNavIds } from './top_nav_ids';
import { NavAction } from '../../types';

/**
 * @param actions - A mapping of TopNavIds to an action function that should run when the
 * corresponding top nav is clicked.
 * @param hideWriteControls if true, does not include any controls that allow editing or creating objects.
 * @return an array of objects for a top nav configuration, based on the mode.
 */
export function getTopNavConfig(
  dashboardMode: ViewMode,
  actions: { [key: string]: NavAction },
  hideWriteControls: boolean,
  onAppLeave?: AppMountParameters['onAppLeave']
) {
  switch (dashboardMode) {
    case ViewMode.VIEW:
      return hideWriteControls
        ? [
            getFullScreenConfig(actions[TopNavIds.FULL_SCREEN]),
            // getShareConfig(actions[TopNavIds.SHARE]),
          ]
        : [
            getFullScreenConfig(actions[TopNavIds.FULL_SCREEN]),
            // getShareConfig(actions[TopNavIds.SHARE]),
            getCloneConfig(actions[TopNavIds.CLONE]),
            getEditConfig(actions[TopNavIds.ENTER_EDIT_MODE]),
          ];
    case ViewMode.EDIT:
      return [
        getOptionsConfig(actions[TopNavIds.OPTIONS]),
        // getShareConfig(actions[TopNavIds.SHARE]),
        getAddConfig(actions[TopNavIds.ADD_EXISTING]),
        getViewConfig(actions[TopNavIds.EXIT_EDIT_MODE]),
        getSaveConfig(actions[TopNavIds.SAVE]),
        getCreateNewConfig(actions[TopNavIds.VISUALIZE]),
      ];
    default:
      return [];
  }
}

function getFullScreenConfig(action: NavAction) {
  return {
    id: 'full-screen',
    label: i18n.translate('dashboard.topNave.fullScreenButtonAriaLabel', {
      defaultMessage: '全屏',
    }),
    description: i18n.translate('dashboard.topNave.fullScreenConfigDescription', {
      defaultMessage: '全屏模式',
    }),
    testId: 'dashboardFullScreenMode',
    run: action,
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getEditConfig(action: NavAction) {
  return {
    emphasize: true,
    id: 'edit',
    iconType: 'pencil',
    label: i18n.translate('dashboard.topNave.editButtonAriaLabel', {
      defaultMessage: '编辑',
    }),
    description: i18n.translate('dashboard.topNave.editConfigDescription', {
      defaultMessage: '切换到编辑模式',
    }),
    testId: 'dashboardEditMode',
    // We want to hide the "edit" button on small screens, since those have a responsive
    // layout, which is not tied to the grid anymore, so we cannot edit the grid on that screens.
    className: 'eui-hideFor--s eui-hideFor--xs',
    run: action,
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getSaveConfig(action: NavAction) {
  return {
    id: 'save',
    label: i18n.translate('dashboard.topNave.saveButtonAriaLabel', {
      defaultMessage: '保存',
    }),
    description: i18n.translate('dashboard.topNave.saveConfigDescription', {
      defaultMessage: '保存您的仪表板',
    }),
    testId: 'dashboardSaveMenuItem',
    run: action,
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getViewConfig(action: NavAction) {
  return {
    id: 'cancel',
    label: i18n.translate('dashboard.topNave.cancelButtonAriaLabel', {
      defaultMessage: '取消',
    }),
    description: i18n.translate('dashboard.topNave.viewConfigDescription', {
      defaultMessage: '取消编辑并切换到仅查看模式',
    }),
    testId: 'dashboardViewOnlyMode',
    run: action,
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getCloneConfig(action: NavAction) {
  return {
    id: 'clone',
    label: i18n.translate('dashboard.topNave.cloneButtonAriaLabel', {
      defaultMessage: '克隆',
    }),
    description: i18n.translate('dashboard.topNave.cloneConfigDescription', {
      defaultMessage: '创建仪表板的副本',
    }),
    testId: 'dashboardClone',
    run: action,
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getAddConfig(action: NavAction) {
  return {
    id: 'add',
    label: i18n.translate('dashboard.topNave.addButtonAriaLabel', {
      defaultMessage: '添加',
    }),
    description: i18n.translate('dashboard.topNave.addConfigDescription', {
      defaultMessage: '将面板添加到仪表板',
    }),
    testId: 'dashboardAddPanelButton',
    run: action,
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getCreateNewConfig(action: NavAction) {
  return {
    emphasize: true,
    iconType: 'plusInCircleFilled',
    id: 'addNew',
    label: i18n.translate('dashboard.topNave.addNewButtonAriaLabel', {
      defaultMessage: '新建',
    }),
    description: i18n.translate('dashboard.topNave.addNewConfigDescription', {
      defaultMessage: '在此仪表板上创建新的面板',
    }),
    testId: 'dashboardAddNewPanelButton',
    run: action,
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getShareConfig(action: NavAction | undefined) {
  return {
    id: 'share',
    label: i18n.translate('dashboard.topNave.shareButtonAriaLabel', {
      defaultMessage: '分享',
    }),
    description: i18n.translate('dashboard.topNave.shareConfigDescription', {
      defaultMessage: '分享仪表板',
    }),
    testId: 'shareTopNavButton',
    run: action,
    // disable the Share button if no action specified
    disableButton: !action,
  };
}

/**
 * @returns {kbnTopNavConfig}
 */
function getOptionsConfig(action: NavAction) {
  return {
    id: 'options',
    label: i18n.translate('dashboard.topNave.optionsButtonAriaLabel', {
      defaultMessage: '选项',
    }),
    description: i18n.translate('dashboard.topNave.optionsConfigDescription', {
      defaultMessage: '选项',
    }),
    testId: 'dashboardOptionsButton',
    run: action,
  };
}
