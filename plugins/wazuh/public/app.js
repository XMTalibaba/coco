/*
 * Wazuh app - File for app requirements and set up
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import { checkPluginVersion } from './utils';

import 'angular-sanitize';

// Require CSS
import './styles';
// Require lib to dashboards PDFs
require('./utils/dom-to-image.js');

// EUI React components wrapper
import './components';

// angular-charts.js
import 'angular-chart.js';

// pin-wz-menu.js
import { changeWazuhNavLogo } from './utils/wz-logo-menu';

// Font Awesome, Kibana UI framework and others
import './utils/fontawesome/scss/font-awesome.scss';

// Dev tools
import './utils/codemirror';

import './utils/jquery-ui';

// Material
import 'angular-material/angular-material.css';
import 'angular-aria/angular-aria';
import 'angular-animate/angular-animate';
import 'angular-material/angular-material';

// Set up Wazuh app
import './setup';

//App imports
import './kibana-integrations';
import './services';
import './controllers';
import './factories';

// Imports to update currentPlatform when app starts
import { checkCurrentSecurityPlatform } from './controllers/management/components/management/configuration/utils/wz-fetch';
import store from './redux/store';
import { updateCurrentPlatform } from './redux/actions/appStateActions';
import { WzAuthentication } from './react-services/wz-authentication';

import { getAngularModule } from './kibana-services';
const app = getAngularModule();

app.config([
  '$compileProvider',
  function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data|blob):/);
  },
]);

app.config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.useApplyAsync(true);
  },
]);

app.run([
  '$injector',
  function (_$injector) {
    changeWazuhNavLogo();
    app.$injector = _$injector;

    // Set currentSecurity platform in Redux when app starts.
    checkCurrentSecurityPlatform().then((item) => {
      store.dispatch(updateCurrentPlatform(item))
    }).catch(() => {})

    // Init the process of refreshing the user's token when app start.
    checkPluginVersion().finally(WzAuthentication.refresh);
  },
]);

/**
 * Set trigger for logout
 */
app.run(function ($rootElement) {
  $rootElement.append(`
    <div>
      <div class="wazuhNotReadyYet"></div>
      <div ng-view class="mainView"></div>
      <react-component name="WzMenuWrapper" props=""></react-component>
      <react-component name="WzAgentSelectorWrapper" props=""></react-component>
      <react-component name="ToastNotificationsModal" props=""></react-component>
    </div>`);

  // Bind deleteExistentToken on Log out component.
  $(document).on('ready', function () {
    $('.euiHeaderSectionItem__button').on('mouseleave', function () {
      console.log('onmouseleave')
      // opendistro
      $('span:contains(Log out)').on('click', function () {
        WzAuthentication.deleteExistentToken();
      });
      // x-pack
      $('a:contains(Log out)').on('click', function () {
        WzAuthentication.deleteExistentToken();
      });
    });
  });
});
