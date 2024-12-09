/*
 * Wazuh app - React component for registering agents.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { EuiFlexGroup, EuiFlexItem, EuiFlexGrid, EuiButtonEmpty, EuiSideNav, EuiIcon, EuiCollapsibleNavGroup } from '@elastic/eui';
import { connect } from 'react-redux';
import store from '../../redux/store';
import { updateCurrentTab, updateCurrentAgentData } from '../../redux/actions/appStateActions';
import { AppState } from '../../react-services/app-state';
import { AppNavigate } from '../../react-services/app-navigate';
import { getAngularModule } from '../../kibana-services';
import { hasAgentSupportModule } from '../../react-services/wz-agents';
import { WAZUH_MODULES_ID } from '../../../common/constants';
import { getDataPlugin } from '../../kibana-services';
import { WzUserPermissions } from '../../react-services/wz-user-permissions';

class WzLogStatements extends Component {
  constructor(props) {
    super(props);
    this.currentApi = JSON.parse(AppState.getCurrentAPI()).id;
    this.state = {
      extensions: []
    };

    this.overviewSections = {
      adminLoginlog: {id: 'admin-loginlog', text: 'admin-loginlog', type: ''},
      adminOperationlog: {id: 'admin-operationlog', text: 'log', type: ''},
      // systemRunLogs: {id: 'logs', text: '系统运行日志', type: 'manager'},
      systemRunLogs: {id: 'system-run-log', text: '系统运行日志', type: ''},
      reportManage: {id: 'reporting', text: '报表管理', type: 'manager'},

      testBaseline: {id: 'sca', text: '基线检测', type: 'overview', logModules: 'securityLog'},
      keyFile: {id: 'fim', text: '关键文件', type: 'overview', logModules: 'securityLog'},
      strategiesTest: {id: 'sca', text: '策略检测', type: 'overview', logModules: 'securityLog'},
      testNetwork: {id: 'systemCommands', text: '网络检测', type: 'overview', logModules: 'networkMonitoring'},
      virusProtection: {id: 'clamav', text: '防病毒', type: 'overview', logModules: 'securityLog'},
      fileNotamper: {id: 'fim', text: '文件防篡改', type: 'overview', logModules: 'securityLog'},
      agentLog: {id:'agent-log', text: '代理日志', type: ''},
    };

    this.navItems = {
      admin: { // 超级管理员
        auditLogItems: [
          this.overviewSections.adminLoginlog,
          this.overviewSections.adminOperationlog,
          this.overviewSections.systemRunLogs,
        ],
        securityLog: [
          // this.overviewSections.assetManage,
          this.overviewSections.testBaseline,
          // this.overviewSections.weakPassword,
          this.overviewSections.accountChange,
          this.overviewSections.accountUnusual,
          this.overviewSections.accountLogin,
          this.overviewSections.keyFile,
          // this.overviewSections.websiteBackdoor,
          // this.overviewSections.strategiesTest,
          this.overviewSections.testNetwork,
          // this.overviewSections.protectionStrategy,
          this.overviewSections.virusProtection,
          // this.overviewSections.micro,
          // this.overviewSections.fileNotamper,
          // this.overviewSections.webPretective,
          // this.overviewSections.threatBack,
        ],
        logStatemengtsItems: [
          this.overviewSections.reportManage,
          // this.overviewSections.agentLog
        ]
      },
      adminuser: { // 用户管理员
        auditLogItems: [],
        securityLog: [],
        logStatemengtsItems: []
      },
      audit: { // 审计管理员
        auditLogItems: [
          this.overviewSections.adminLoginlog,
          this.overviewSections.adminOperationlog,
          this.overviewSections.systemRunLogs,
        ],
        securityLog: [
          // this.overviewSections.assetManage,
          this.overviewSections.testBaseline,
          // this.overviewSections.weakPassword,
          this.overviewSections.accountChange,
          this.overviewSections.accountUnusual,
          this.overviewSections.accountLogin,
          this.overviewSections.keyFile,
          // this.overviewSections.websiteBackdoor,
          // this.overviewSections.strategiesTest,
          this.overviewSections.testNetwork,
          // this.overviewSections.protectionStrategy,
          this.overviewSections.virusProtection,
          // this.overviewSections.micro,
          // this.overviewSections.fileNotamper,
          // this.overviewSections.webPretective,
          // this.overviewSections.threatBack,
        ],
        logStatemengtsItems: [
          this.overviewSections.reportManage,
          // this.overviewSections.agentLog
        ]
      },
      system: { // 系统管理员
        auditLogItems: [],
        securityLog: [],
        logStatemengtsItems: []
      }
    }
  }

  async componentDidMount() {
    const extensions = await AppState.getExtensions(this.currentApi);
    this.setState({ extensions });
    const $injector = getAngularModule().$injector;
    this.router = $injector.get('$route');
  }

  clickMenuItem = (ev, section, type, logModules) => {
    console.log(window.location.href)
    this.removeSelectedAgent();
    const params = { tab: section };
    if (logModules) {
      params.logModules = logModules;
    }
    if (type) {
      AppNavigate.navigateToModule(ev, type, params)
    }
    else {
      AppNavigate.navigateToModule(ev, section, {})
    }
  };

  createItems = items => {
    return items.map(item => this.createItem(item));
  };

  createItem = (item, data = {}) => {
    // NOTE: Duplicate `name` values will cause `id` collisions.
    return {
      ...data,
      id: item.id + item.text,
      name: item.text,
      isSelected: this.props.currentTab === item.id,
      onClick: () => { },
      onMouseDown: (ev) => this.clickMenuItem(ev, item.id, item.type, item.logModules)
    };
  };

  removeSelectedAgent() {
    this.props.updateCurrentAgentData({});
    // this.router.reload();
    const { filterManager } = getDataPlugin().query;
    const currentAppliedFilters = filterManager.getFilters();
    const agentFilters = currentAppliedFilters.filter(x => {
      return x.meta.key === 'agent.id';
    });
    agentFilters.map(x => {
      filterManager.removeFilter(x);
    });
  }

  render() {
    const container = document.getElementsByTagName('body');
    let permissionsRoute = this.navItems[this.props.rolesType];
    return ReactDOM.createPortal(<div className="wz-menu-nav">
      {
        permissionsRoute && permissionsRoute.auditLogItems.length > 0 && (
          <EuiCollapsibleNavGroup
            title="审计日志"
            titleSize="xs"
            iconType="visBarVertical"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
            items={this.createItems(permissionsRoute.auditLogItems)}
            style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      }
      {
        permissionsRoute && permissionsRoute.securityLog.length > 0 && (
          <EuiCollapsibleNavGroup
            title="安全日志"
            titleSize="xs"
            iconType="visBarVertical"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
            items={this.createItems(permissionsRoute.securityLog)}
            style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      }
      {
        permissionsRoute && permissionsRoute.logStatemengtsItems.length > 0 && (
          <EuiSideNav
            items={this.createItems(permissionsRoute.logStatemengtsItems)}
            style={{ padding: '4px 12px' }}
          />
        )
      } 
    </div>, container[0])
  }
}

const mapStateToProps = state => {
  return {
    state: state.rulesetReducers,
    currentAgentData: state.appStateReducers.currentAgentData,
    currentTab: state.appStateReducers.currentTab
  };
};

const mapDispatchToProps = dispatch => ({
  updateCurrentAgentData: (agentData) => dispatch(updateCurrentAgentData(agentData))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WzLogStatements);
