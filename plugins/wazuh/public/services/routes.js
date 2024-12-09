/*
 * Wazuh app - File for routes definition
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

// Require routes
//import routes from 'ui/routes';
import 'angular-route';

// Functions to be executed before loading certain routes
import {
  settingsWizard,
  getSavedSearch,
  goToKibana,
  getIp,
  getWzConfig,
  apiCount
} from './resolves';

// HTML templates
import healthCheckTemplate from '../templates/health-check/health-check.html';
import agentsTemplate from '../templates/agents/dashboards.html';
import agentsPrevTemplate from '../templates/agents-prev/agents-prev.html';
import managementTemplate from '../templates/management/management.html';
import overviewTemplate from '../templates/visualize/dashboards.html';
import settingsTemplate from '../templates/settings/settings.html';
import securityTemplate from '../templates/security/security.html';
import blankScreenTemplate from '../templates/error-handler/blank-screen.html';
import toolsTemplate from '../templates/tools/tools.html';
import { WazuhConfig } from '../react-services/wazuh-config';
import { GenericRequest } from '../react-services/generic-request';
import { WzMisc } from '../factories/misc';
import { ApiCheck } from '../react-services/wz-api-check';
import { AppState } from '../react-services/app-state';
import { getAngularModule } from '../kibana-services';

import manageToolTemplate from '../templates/assetManage/manage-tool.html';

import planTasksTemplate from '../templates/assetManage/plan-tasks.html';
import blackWhitelistTemplate from '../templates/hostProtection/black-whitelist.html';
import adminLoginlogTemplate from '../templates/logStatements/admin-loginlog.html';
import adminOperationlogTemplate from '../templates/logStatements/admin-operationlog.html';
import systemParamTemplate from '../templates/systemManage/system-param.html';
import workbenchTemplate from '../templates/homeOverview/workbench.html';
import systemRunLogTemplate from '../templates/logStatements/system-run-log.html';
import licenseManageTemplate from '../templates/systemManage/license-manage.html';
import microStrategyTemplate from '../templates/hostProtection/micro-strategy.html';
import softwareAppTemplate from '../templates/assetManage/software-app.html';
import systemAccountTemplate from '../templates/assetManage/system-account.html';
import policyManageTemplate from '../templates/hostProtection/policy-manage.html';
import systemPortTemplate from '../templates/assetManage/system-port.html';
import systemStatusTemplate from '../templates/systemManage/system-status.html';
import userManageTemplate from '../templates/systemManage/user-manage.html';

import threatBackTemplate from '../templates/backAnalysis/threat-back.html';
import bruteForceTemplate from '../templates/securityDeduction/brute-force.html';
import SQLInjectionTemplate from '../templates/securityDeduction/SQL-injection.html';
import shellshockTemplate from '../templates/securityDeduction/shellshock.html';
import riskServiceTemplate from '../templates/securityDeduction/risk-service.html';
import blackmailVirusTemplate from '../templates/securityDeduction/blackmail-virus.html';
import patchDistributionTemplate from '../templates/assetManage/patch-distribution.html';
import checkupPolicyTemplate from '../templates/safetyCheckup/checkup-policy.html';
import departmentManageTemplate from '../templates/systemManage/department-manage.html';
import connectionRecordTemplate from '../templates/assetManage/connection-record.html';
import checkupListTemplate from '../templates/safetyCheckup/checkup-list.html';
import baselineCheckTemplate from '../templates/complianceBaseline/baseline-check.html';
import baselineTemplateTemplate from '../templates/complianceBaseline/baseline-template.html';
import baselinePolicyTemplate from '../templates/complianceBaseline/baseline-policy.html';
import vulnDetectionTemplate from '../templates/riskMonitoring/vuln-detection.html';
import killingStrategyTemplate from '../templates/virusKilling/killing-strategy.html';
import killLogTemplate from '../templates/virusKilling/kill-log.html';
import agentVersionTemplate from '../templates/assetManage/agent-version.html';
import managerAddrTemplate from '../templates/systemManage/manager-addr.html';
import managerMslTemplate from '../templates/systemManage/manager-msl.html';
import managerSearchTemplate from '../templates/systemManage/manager-search.html';
import managerEmailTemplate from '../templates/systemManage/manager-email.html';
const assignPreviousLocation = ($rootScope, $location) => {
  const path = $location.path();
  const params = $location.search();
  // Save current location if we aren't performing a health-check, to later be able to come back to the same tab
  if (!path.includes('/health-check')) {
    $rootScope.previousLocation = path;
    $rootScope.previousParams = params;
  }
};

function ip($q, $rootScope, $window, $location) {
  const wzMisc = new WzMisc();
  assignPreviousLocation($rootScope, $location);
  return getIp(
    $q,
    $window,
    $location,
    wzMisc
  );
}

function nestedResolve($q, errorHandler, $rootScope, $location, $window) {
  const wzMisc = new WzMisc();
  const healthCheckStatus = $window.sessionStorage.getItem('healthCheck');
  if (!healthCheckStatus) return;
  const wazuhConfig = new WazuhConfig();
  assignPreviousLocation($rootScope, $location);
  const location = $location.path();
  return getWzConfig($q, GenericRequest, wazuhConfig).then(() =>
    settingsWizard(
      $location,
      $q,
      $window,
      ApiCheck,
      AppState,
      GenericRequest,
      errorHandler,
      wzMisc,
      location && location.includes('/health-check')
    )
  );
}

function savedSearch(
  $location,
  $window,
  $rootScope,
  $route
) {
  const healthCheckStatus = $window.sessionStorage.getItem('healthCheck');
  if (!healthCheckStatus) return;
  assignPreviousLocation($rootScope, $location);
  return getSavedSearch(
    $location,
    $window,
    $route
  );
}

function wzConfig($q, $rootScope, $location) {
  assignPreviousLocation($rootScope, $location);
  const wazuhConfig = new WazuhConfig();
  return getWzConfig($q, GenericRequest, wazuhConfig);
}

function wzKibana($location, $window, $rootScope) {
  assignPreviousLocation($rootScope, $location);
  if ($location.$$path !== '/visualize/create') {
    // Sets ?_a=(columns:!(_source),filters:!())
    $location.search('_a', '(columns:!(_source),filters:!())');
    // Removes ?_g
    $location.search('_g', null);
  }
  return goToKibana($location, $window);
}

function clearRuleId(commonData) {
  commonData.removeRuleId();
  return Promise.resolve();
}

function enableWzMenu($rootScope, $location) {
  const location = $location.path();
  $rootScope.hideWzMenu = location.includes('/health-check');
  if(!$rootScope.hideWzMenu){
    AppState.setWzMenu();
  }
}

//Routes
const app = getAngularModule();

app.config(($routeProvider) => {
  $routeProvider
  .when('/health-check', {
    template: healthCheckTemplate,
    resolve: { apiCount, wzConfig, ip }
  })
  .when('/agents/:agent?/:tab?/:tabView?', {
    template: agentsTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/agents-preview/', { // 已做角色权限控制
    template: agentsPrevTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/manager/', {
    template: managementTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch, clearRuleId },
    reloadOnSearch: false,
  })
  .when('/manager/:tab?', { // 已做角色权限控制
    template: managementTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch, clearRuleId }
  })
  .when('/overview/', { // 已做角色权限控制
    template: overviewTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/settings', {
    template: settingsTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false
  })
  .when('/security', {
    template: securityTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch }
  })
  .when('/visualize/create?', {
    redirectTo: function () { },
    resolve: { wzConfig, wzKibana }
  })
  .when('/context/:pattern?/:type?/:id?', {
    redirectTo: function () { },
    resolve: { wzKibana }
  })
  .when('/doc/:pattern?/:index?/:type?/:id?', {
    redirectTo: function () { },
    resolve: { wzKibana }
  })
  .when('/wazuh-dev', {
    template: toolsTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch }
  })
  .when('/blank-screen', {
    template: blankScreenTemplate,
    resolve: { enableWzMenu, wzConfig }
  })
  // .when('/', {
  //   redirectTo: '/overview/'
  // })
  // .when('', {
  //   redirectTo: '/overview/'
  // })
  // .otherwise({
  //   redirectTo: '/overview'
  // });
  // 下方新增导航
  .when('/manage-tool/', { // 已做角色权限控制
    template: manageToolTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })

  .when('/plan-tasks/', { // 已做角色权限控制
    template: planTasksTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/black-whitelist/', { // 已做角色权限控制
    template: blackWhitelistTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/admin-loginlog/', { // 已做角色权限控制
    template: adminLoginlogTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/admin-operationlog/', { // 已做角色权限控制
    template: adminOperationlogTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/system-param/', { // 已做角色权限控制
    template: systemParamTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/workbench/', { // 已做角色权限控制
    template: workbenchTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/system-run-log/', { // 已做角色权限控制
    template: systemRunLogTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/license-manage/', { // 已做角色权限控制
    template: licenseManageTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/micro-strategy/', { // 已做角色权限控制
    template: microStrategyTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/software-app/', { // 已做角色权限控制
    template: softwareAppTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/system-account/', { // 已做角色权限控制
    template: systemAccountTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/policy-manage/', { // 已做角色权限控制
    template: policyManageTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/system-port/', { // 已做角色权限控制
    template: systemPortTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/system-status/', { // 已做角色权限控制
    template: systemStatusTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/user-manage/', { // 已做角色权限控制
    template: userManageTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })

  .when('/threat-back/', { // 已做角色权限控制
    template: threatBackTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/brute-force/', { // 已做角色权限控制
    template: bruteForceTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/SQL-injection/', { // 已做角色权限控制
    template: SQLInjectionTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/shellshock/', { // 已做角色权限控制
    template: shellshockTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/risk-service/', { // 已做角色权限控制
    template: riskServiceTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/blackmail-virus/', { // 已做角色权限控制
    template: blackmailVirusTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/patch-distribution/', { // 已做角色权限控制
    template: patchDistributionTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/connection-record/', { // 已做角色权限控制
    template: connectionRecordTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/department-manage/', { // 已做角色权限控制
    template: departmentManageTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/checkup-policy/', { // 已做角色权限控制
    template: checkupPolicyTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/checkup-list/', { // 已做角色权限控制
    template: checkupListTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/baseline-check/', { // 已做角色权限控制
    template: baselineCheckTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/baseline-template/', { // 已做角色权限控制
    template: baselineTemplateTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/baseline-policy/', { // 已做角色权限控制
    template: baselinePolicyTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/vuln-detection/', { // 已做角色权限控制
    template: vulnDetectionTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/killing-strategy/', { // 已做角色权限控制
    template: killingStrategyTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/kill-log/', { // 已做角色权限控制
    template: killLogTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/agent-version/', { // 已做角色权限控制
    template: agentVersionTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/manager-addr/', { // 已做角色权限控制
    template: managerAddrTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/manager-msl/', { // 已做角色权限控制
    template: managerMslTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/manager-search/', { // 已做角色权限控制
    template: managerSearchTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  .when('/manager-email/', { // 已做角色权限控制
    template: managerEmailTemplate,
    resolve: { enableWzMenu, nestedResolve, ip, savedSearch },
    reloadOnSearch: false,
  })
  // .when('/', {
  //   redirectTo: '/'
  // })
  // .when('', {
  //   redirectTo: '/'
  // })
  // .otherwise({
  //   redirectTo: '/workbench'
  // });
  .when('/', {
    redirectTo: '/'
  })
  .when('', {
    redirectTo: '/'
  })
  .otherwise({
    redirectTo: '/manager-msl/'
  });
});
