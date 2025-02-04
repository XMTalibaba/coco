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

import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';

import { i18n } from '@kbn/i18n';
import { I18nProvider } from '@kbn/i18n/react';
import { StartServicesAccessor } from 'src/core/public';

import { AdvancedSettings } from './advanced_settings';
import { ManagementAppMountParams } from '../../../management/public';
import { ComponentRegistry } from '../types';

import './index.scss';

const title = i18n.translate('advancedSettings.advancedSettingsLabel', {
  defaultMessage: '高级设置',
});
const crumb = [{ text: title }];

const readOnlyBadge = {
  text: i18n.translate('advancedSettings.badge.readOnly.text', {
    defaultMessage: '只读',
  }),
  tooltip: i18n.translate('advancedSettings.badge.readOnly.tooltip', {
    defaultMessage: '无法保存高级设置',
  }),
  iconType: 'glasses',
};

export async function mountManagementSection(
  getStartServices: StartServicesAccessor,
  params: ManagementAppMountParams,
  componentRegistry: ComponentRegistry['start']
) {
  params.setBreadcrumbs(crumb);
  const [{ uiSettings, notifications, docLinks, application, chrome }] = await getStartServices();

  const canSave = application.capabilities.advancedSettings.save as boolean;

  if (!canSave) {
    chrome.setBadge(readOnlyBadge);
  }

  ReactDOM.render(
    <I18nProvider>
      <Router history={params.history}>
        <Switch>
          <Route path={['/:query', '/']}>
            <AdvancedSettings
              enableSaving={canSave}
              toasts={notifications.toasts}
              dockLinks={docLinks.links}
              uiSettings={uiSettings}
              componentRegistry={componentRegistry}
            />
          </Route>
        </Switch>
      </Router>
    </I18nProvider>,
    params.element
  );
  return () => {
    ReactDOM.unmountComponentAtNode(params.element);
  };
}
