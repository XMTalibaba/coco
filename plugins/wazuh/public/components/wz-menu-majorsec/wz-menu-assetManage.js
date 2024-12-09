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
import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { EuiFlexGroup, EuiFlexItem, EuiFlexGrid, EuiButtonEmpty, EuiSideNav, EuiIcon, EuiHorizontalRule, EuiPanel, EuiButton, EuiSpacer, EuiCollapsibleNavGroup } from '@elastic/eui';
import { WzRequest } from '../../react-services/wz-request';
import { connect } from 'react-redux';
import { updateCurrentAgentData } from '../../redux/actions/appStateActions';
import { AppState } from '../../react-services/app-state';
import { AppNavigate } from '../../react-services/app-navigate';
import { hasAgentSupportModule } from '../../react-services/wz-agents';
import { AgentInfo } from './../common/welcome/agents-info';
import { getAngularModule } from '../../kibana-services';
import { WAZUH_MODULES_ID } from '../../../common/constants';
import store from '../../redux/store';
import { WzUserPermissions } from '../../react-services/wz-user-permissions';

class WzAssetManage extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };

    this.agent = false;

    this.agentSections = {
      hostAssets: {
        id: 'hostAssets',
        text: '主机资产'
      },
      hostManage: {
        id: 'agents-preview',
        text: '主机管理'
      },
      hostGroup: {
        id: 'groups',
        text: '主机分组',
        type: 'manager'
      },
      deviceManage: {
        id: 'device-manage',
        text: '设备识别管控'
      },
      // deviceRecord: {
      //   id: 'device-record',
      //   text: '外设上下线记录'
      // },
      manageTool: {
        id: 'manage-tool',
        text: '管理工具'
      },
    
    };

    this.navItems = {
      admin: { // 超级管理员
        hostAssetsItems: [
          this.agentSections.hostManage,
          this.agentSections.hostGroup,
        ],
        peripheralAssetsItems: [
          this.agentSections.deviceManage,
          // this.agentSections.deviceRecord,
        ],
        applicationAssetsItems: [
          // this.agentSections.application,
          // this.agentSections.applicationAssetsDatabase,
          // this.agentSections.applicationAssetsMiddleware,
        ],
        assetsManageItems: [
          this.agentSections.manageTool,

        ]
      },
      adminuser: { // 用户管理员
        hostAssetsItems: [],
        peripheralAssetsItems: [],
        applicationAssetsItems: [],
        assetsManageItems: []
      },
      audit: { // 审计管理员
        hostAssetsItems: [],
        peripheralAssetsItems: [],
        applicationAssetsItems: [],
        assetsManageItems: []
      },
      system: { // 系统管理员
        hostAssetsItems: [
          this.agentSections.hostManage,
          this.agentSections.hostGroup,
        ],
        peripheralAssetsItems: [
          this.agentSections.deviceManage,
          // this.agentSections.deviceRecord,
        ],
        applicationAssetsItems: [
          // this.agentSections.application,
          // this.agentSections.applicationAssetsDatabase,
          // this.agentSections.applicationAssetsMiddleware,
        ],
        assetsManageItems: [
          this.agentSections.manageTool,

        ]
      }
    }
  }

  async componentDidMount() {
    const $injector = getAngularModule().$injector;
    this.router = $injector.get('$route');
  }


  async getAgentData(agentId) {
    try {
      const result = await WzRequest.apiReq('GET', '/agents/' + agentId, {});
      return result;
    } catch (error) {
      return Promise.reject(error);
    }
  }


  clickMenuItem = (ev, section, type, modulesTab) => {
    const params = { tab: section };
    if (modulesTab) {
      params.modulesTab = modulesTab;
    }
    if (type) {
      AppNavigate.navigateToModule(ev, type, params)
    }
    else {
      AppNavigate.navigateToModule(ev, section, {})
    }
    // window.location.href = `#/${section}`;
    // this.router.reload();
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
      onClick: (ev) => this.clickMenuItem(ev, item.id, item.type, item.modulesTab)
    };
  };

  render() {
    const container = document.getElementsByTagName('body');
    let permissionsRoute = this.navItems[this.props.rolesType];
    return ReactDOM.createPortal(<div className="wz-menu-nav">
      {
        permissionsRoute && permissionsRoute.hostAssetsItems.length > 0 && (
          <EuiCollapsibleNavGroup
            title="主机资产"
            titleSize="xs"
            iconType="watchesApp"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
              items={this.createItems(permissionsRoute.hostAssetsItems)}
              style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      }
      {
        permissionsRoute && permissionsRoute.peripheralAssetsItems.length > 0 && (
          <EuiCollapsibleNavGroup
            title="外设资产"
            titleSize="xs"
            iconType="watchesApp"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
              items={this.createItems(permissionsRoute.peripheralAssetsItems)}
              style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      }
      {
        permissionsRoute && permissionsRoute.applicationAssetsItems.length > 0 && (
          <EuiCollapsibleNavGroup
            title="应用资产"
            titleSize="xs"
            iconType="watchesApp"
            isCollapsible={true}
            initialIsOpen={false}
          >
            <EuiSideNav
              items={this.createItems(permissionsRoute.applicationAssetsItems)}
              style={{ padding: '4px 12px' }}
            />
          </EuiCollapsibleNavGroup>
        )
      }
      {
        permissionsRoute && permissionsRoute.assetsManageItems.length > 0 && (
          <EuiSideNav
            items={this.createItems(permissionsRoute.assetsManageItems)}
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
)(WzAssetManage);
