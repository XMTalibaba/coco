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

class WzSystemManage extends Component {
  constructor(props) {
    super(props);
    this.currentApi = JSON.parse(AppState.getCurrentAPI()).id;
    this.state = {
      extensions: []
    };

    this.overviewSections = {
      policyConfig: {id: 'configuration', text: '策略配置', type: 'manager'},
      agentConfiguration: {id: 'agent-configuration', text: 'Agent策略配置', type: ''},
      APPConfig: {id: 'configuration', text: 'APP配置', type: 'settings'},
      systemParam: {id: 'system-param', text: '参数配置', type: ''},
      emailConfig: {id: 'email-config', text: '邮箱配置', type: ''},
      dingdingConfig: {id: 'dingding-config', text: '钉钉配置', type: ''},
      licenseManage: {id: 'license-manage', text: '授权管理', type: ''},
      userManage: {id: 'roles', text: '用户管理', type: 'security'},
      systemState: {id: 'status', text: '系统状态', type: 'manager'},
      systemStatistical: {id: 'statistics', text: '系统统计', type: 'manager'},
      systemDug: {id: 'wazuh-dev', text: '系统调试', type: ''}
    };

    this.navItems = {
      admin: { // 超级管理员
        systemConfigurationItems: [
          this.overviewSections.policyConfig,
          this.overviewSections.agentConfiguration,
          this.overviewSections.APPConfig,
          // this.overviewSections.basicsConfig,
          this.overviewSections.systemParam,
          this.overviewSections.emailConfig,
          this.overviewSections.dingdingConfig,
          // this.overviewSections.logsConfig,
          // this.overviewSections.probeManage
        ],
        operations: [
          this.overviewSections.licenseManage,
          this.overviewSections.systemState,
          this.overviewSections.systemStatistical,
          this.overviewSections.systemDug,
        ],
        systemManageItems: [
          // this.overviewSections.systemOperational,
          // this.overviewSections.licenseManage,
          this.overviewSections.userManage,
          // this.overviewSections.multipleManage,
          // this.overviewSections.systemState,
          // this.overviewSections.systemStatistical,
          // this.overviewSections.systemDug,
        ]
      },
      adminuser: { // 用户管理员
        systemConfigurationItems: [],
        operations: [],
        systemManageItems: [
          this.overviewSections.userManage,
        ]
      },
      audit: { // 审计管理员
        systemConfigurationItems: [],
        operations: [],
        systemManageItems: []
      },
      system: { // 系统管理员
        systemConfigurationItems: [
          this.overviewSections.policyConfig,
          this.overviewSections.agentConfiguration,
          this.overviewSections.APPConfig,
          // this.overviewSections.basicsConfig,
          this.overviewSections.systemParam,
          this.overviewSections.emailConfig,
          this.overviewSections.dingdingConfig,
          // this.overviewSections.logsConfig,
          // this.overviewSections.probeManage
        ],
        operations: [
          // this.overviewSections.licenseManage,
          this.overviewSections.systemState,
          this.overviewSections.systemStatistical,
          this.overviewSections.systemDug,
        ],
        systemManageItems: [
          // this.overviewSections.systemOperational,
          // this.overviewSections.licenseManage,
          // this.overviewSections.userManage,
          // this.overviewSections.multipleManage,
          // this.overviewSections.systemState,
          // this.overviewSections.systemStatistical,
          // this.overviewSections.systemDug,
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

  clickMenuItem = (ev, section, type) => {
    console.log(window.location.href)
    this.removeSelectedAgent();
    const params = { tab: section };
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
      id: item.id + item.type,
      name: item.text,
      isSelected: this.props.currentTab === item.id,
      onClick: () => { },
      onMouseDown: (ev) => this.clickMenuItem(ev, item.id, item.type)
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
        permissionsRoute && permissionsRoute.systemConfigurationItems.length > 0 && (
          <EuiCollapsibleNavGroup
            title="系统配置"
            titleSize="xs"
            iconType="managementApp"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
              items={this.createItems(permissionsRoute.systemConfigurationItems)}
              style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      }
      {
        permissionsRoute && permissionsRoute.operations.length > 0 && (
          <EuiCollapsibleNavGroup
            title="系统运维"
            titleSize="xs"
            iconType="managementApp"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
              items={this.createItems(permissionsRoute.operations)}
              style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      }
      {
        permissionsRoute && permissionsRoute.systemManageItems.length > 0 && (
          <EuiSideNav
            items={this.createItems(permissionsRoute.systemManageItems)}
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
)(WzSystemManage);
