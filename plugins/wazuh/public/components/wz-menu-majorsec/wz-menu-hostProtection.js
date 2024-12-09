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

class WzHostProtection extends Component {
  constructor(props) {
    super(props);
    this.currentApi = JSON.parse(AppState.getCurrentAPI()).id;
    this.state = {
      extensions: []
    };

    this.overviewSections = {
      planTasks: {id: 'plan-tasks', text: '计划任务', type: ''},
      blackWhitelist: {id: 'black-whitelist', text: '黑白名单管理', type: ''},
      securityReinforce: {id: 'security-reinforce', text: '安全加固策略', type: ''},
      // fileNotamper: {id: WAZUH_MODULES_ID.INTEGRITY_MONITORING, text: '文件防篡改', type: 'overview'},
      virusProtection: {id: WAZUH_MODULES_ID.CLAMAV, text: '防病毒', type: 'overview'},
      // fileIsolation: {id: 'file-isolation', text: '文件隔离', type: ''},
    };

    this.navItems = {
      admin: { // 超级管理员
        protectionStrategyItems: [
          // this.overviewSections.securityPolicy,
          // this.overviewSections.planTasks,
          this.overviewSections.blackWhitelist,
          this.overviewSections.securityReinforce,
          // this.overviewSections.separateFiles
        ],
        microItems: [
          // this.overviewSections.microRels,
          // this.overviewSections.firewallRules,
          // this.overviewSections.microTasks,
        ],
        virusProtectionItems: [
          this.overviewSections.virusProtection,
          // this.overviewSections.viralStrategy,
          // this.overviewSections.fileIsolation,
        ],
        protectionItems: [
          // this.overviewSections.securityProtection,
          // this.overviewSections.multiDimensionalRisk,
        ]
      },
      adminuser: { // 用户管理员
        protectionStrategyItems: [],
        microItems: [],
        virusProtectionItems: [],
        protectionItems: []
      },
      audit: { // 审计管理员
        protectionStrategyItems: [],
        microItems: [],
        virusProtectionItems: [],
        protectionItems: []
      },
      system: { // 系统管理员
        protectionStrategyItems: [
          // this.overviewSections.securityPolicy,
          // this.overviewSections.planTasks,
          this.overviewSections.blackWhitelist,
          this.overviewSections.securityReinforce,
          // this.overviewSections.separateFiles
        ],
        microItems: [
          // this.overviewSections.microRels,
          // this.overviewSections.firewallRules,
          // this.overviewSections.microTasks,
        ],
        virusProtectionItems: [
          this.overviewSections.virusProtection,
          // this.overviewSections.fileIsolation,
          // this.overviewSections.viralStrategy,
        ],
        protectionItems: [
          // this.overviewSections.securityProtection,
          // this.overviewSections.multiDimensionalRisk,
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
      id: item.id,
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
        permissionsRoute && permissionsRoute.protectionStrategyItems.length > 0 && (
          <EuiCollapsibleNavGroup
            title="防护策略"
            titleSize="xs"
            iconType="link"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
              items={this.createItems(permissionsRoute.protectionStrategyItems)}
              style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      }
      {/* {
        permissionsRoute && permissionsRoute.microItems.length > 0 && (
          <EuiCollapsibleNavGroup
            title="微隔离"
            titleSize="xs"
            iconType="link"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
              items={this.createItems(permissionsRoute.microItems)}
              style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      } */}
      {
        permissionsRoute && permissionsRoute.virusProtectionItems.length > 0 && (
          <EuiCollapsibleNavGroup
            title="防病毒"
            titleSize="xs"
            iconType="link"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
              items={this.createItems(permissionsRoute.virusProtectionItems)}
              style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      }
      {
        permissionsRoute && permissionsRoute.protectionItems.length > 0 && (
          <EuiSideNav
            items={this.createItems(permissionsRoute.protectionItems)}
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
)(WzHostProtection);
