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

class WzRiskMonitoring extends Component {
  constructor(props) {
    super(props);
    this.currentApi = JSON.parse(AppState.getCurrentAPI()).id;
    this.state = {
      extensions: []
    };

    this.overviewSections = {
      weakPassword: {id:'weak-password', text: '弱口令', type: ''},
      // accountChange: {id: 'groups', text: '账户变更', type: 'manager'},
      keyFile: {id: WAZUH_MODULES_ID.INTEGRITY_MONITORING, text: '关键文件', type: 'overview'},
      logToClear: {id:'logToClear', text: '日志清除行为', type: 'overview'},
      systemConfiguration: {id: WAZUH_MODULES_ID.SECURITY_CONFIGURATION_ASSESSMENT, text: '系统配置', type: 'overview'},
      fileNotamper: {id: WAZUH_MODULES_ID.INTEGRITY_MONITORING, text: '文件防篡改', type: 'overview'},
      testBaseline: {id: WAZUH_MODULES_ID.SECURITY_CONFIGURATION_ASSESSMENT, text: '基线检测', type: 'overview'},
      // testNetwork: {id: WAZUH_MODULES_ID.MITRE_ATTACK, text: '网络检测', type: 'overview'},
      // testNetwork: {id: 'systemCommands', text: '网络检测', type: 'overview', modulesTab: 'networkMonitoring'}, // 默认系统命令tab
      testBug: {id: WAZUH_MODULES_ID.VULNERABILITIES, text: '漏洞检测', type: 'overview'},
      // illegalOutreach: {id: 'illegal', text: '非法外联', type: 'overview'},
      systemCommands: {id: 'systemCommands', text: '系统命令', type: 'overview'},
      pm: {id: 'pm', text: 'rootkit', type: 'overview'},
      webAttack: {id: 'webAttack', text: 'web攻击', type: 'overview'},
      bruteForce: {id: 'bruteForce', text: '暴力破解', type: 'overview'},
      reboundShell: {id: 'reboundShell', text: '反弹shell', type: 'overview'},
      localAskRight: {id: 'localAskRight', text: '本地提权', type: 'overview'},
      abnormalFile: {id: 'abnormalFile', text: '恶意软件', type: 'overview'},
      dataTheft: {id: 'dataTheft', text: '数据窃取', type: 'overview'},
      blackmailVirus: {id: 'blackmailVirus', text: '勒索病毒', type: 'overview'},
      riskPort: {id: 'riskPort', text: '高危端口', type: 'overview'},
    };

    this.navItems = {
      admin: { // 超级管理员
        testAccountItems: [
          this.overviewSections.weakPassword,
          this.overviewSections.accountChange,
          this.overviewSections.accountUnusual,
          this.overviewSections.accountLogin
        ],
        testFileItems: [
          this.overviewSections.keyFile,
          // this.overviewSections.websiteBackdoor,
          this.overviewSections.logToClear
        ],
        testNetworkItems: [
          this.overviewSections.systemCommands,
          this.overviewSections.pm,
          this.overviewSections.webAttack,
          this.overviewSections.bruteForce,
          this.overviewSections.reboundShell,
          this.overviewSections.localAskRight,
          this.overviewSections.abnormalFile,
          this.overviewSections.dataTheft,
          this.overviewSections.blackmailVirus,
          this.overviewSections.riskPort
        ],
        detectionItems: [
          // this.overviewSections.fileNotamper,
          this.overviewSections.testBaseline,
          // this.overviewSections.testNetwork,
          this.overviewSections.testBug,
          // this.overviewSections.illegalOutreach,
        ]
      },
      adminuser: { // 用户管理员
        testAccountItems: [],
        testFileItems: [],
        testNetworkItems: [],
        detectionItems: []
      },
      audit: { // 审计管理员
        testAccountItems: [],
        testFileItems: [],
        testNetworkItems: [],
        detectionItems: []
      },
      system: { // 系统管理员
        testAccountItems: [
          this.overviewSections.weakPassword,
          this.overviewSections.accountChange,
          this.overviewSections.accountUnusual,
          this.overviewSections.accountLogin
        ],
        testFileItems: [
          this.overviewSections.keyFile,
          // this.overviewSections.websiteBackdoor,
          this.overviewSections.logToClear
        ],
        testNetworkItems: [
          this.overviewSections.systemCommands,
          this.overviewSections.pm,
          this.overviewSections.webAttack,
          this.overviewSections.bruteForce,
          this.overviewSections.reboundShell,
          this.overviewSections.localAskRight,
          this.overviewSections.abnormalFile,
          this.overviewSections.dataTheft,
          this.overviewSections.blackmailVirus,
          this.overviewSections.riskPort
        ],
        detectionItems: [
          // this.overviewSections.fileNotamper,
          this.overviewSections.testBaseline,
          // this.overviewSections.testNetwork,
          this.overviewSections.testBug,
          // this.overviewSections.illegalOutreach,
        ]
      }
    }
  }

  async componentDidMount() {
    const extensions = await AppState.getExtensions(this.currentApi);
    this.setState({ extensions });
    const $injector = getAngularModule().$injector;
    this.router = $injector.get('$route');
  }

  clickMenuItem = (ev, section, type, modulesTab) => {
    console.log(window.location.href)
    this.removeSelectedAgent();
    let params = { tab: section };
    if (section === "sca") { // SCA initial tab is inventory
      params["tabView"] = "inventory"
    }
    if (modulesTab) {
      params.modulesTab = modulesTab;
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
      onMouseDown: (ev) => this.clickMenuItem(ev, item.id, item.type, item.modulesTab)
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
        permissionsRoute && permissionsRoute.testAccountItems.length > 0 && (
          <EuiCollapsibleNavGroup
            title="账户检测"
            titleSize="xs"
            iconType="securitySignal"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
              items={this.createItems(permissionsRoute.testAccountItems)}
              style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      }
      {
        permissionsRoute && permissionsRoute.testFileItems.length > 0 && (
          <EuiCollapsibleNavGroup
            title="文件检测"
            titleSize="xs"
            iconType="securitySignal"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
              items={this.createItems(permissionsRoute.testFileItems)}
              style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      }
      {
        permissionsRoute && permissionsRoute.testNetworkItems.length > 0 && (
          <EuiCollapsibleNavGroup
            title="网络检测"
            titleSize="xs"
            iconType="securitySignal"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
              items={this.createItems(permissionsRoute.testNetworkItems)}
              style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      }
      {
        permissionsRoute && permissionsRoute.detectionItems.length > 0 && (
          <EuiSideNav
            items={this.createItems(permissionsRoute.detectionItems)}
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
)(WzRiskMonitoring);
