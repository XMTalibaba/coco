/*
 * Wazuh app - React component for build q queries.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component, Fragment, createRef, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiButtonEmpty,
  EuiCallOut,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { AppState } from '../../react-services/app-state';
import { PatternHandler } from '../../react-services/pattern-handler';
import { WazuhConfig } from '../../react-services/wazuh-config';
import { connect } from 'react-redux';
import WzReduxProvider from '../../redux/wz-redux-provider';
import store from '../../redux/store';
import HomeOverview from './wz-menu-homeOverview';
import AssetManage from './wz-menu-assetManage';
import RiskMonitoring from './wz-menu-riskMonitoring';
import HostProtection from './wz-menu-hostProtection';
import BackAnalysis from './wz-menu-backAnalysis';
import LogStatements from './wz-menu-logStatements';
import SystemManage from './wz-menu-systemManage';
import { getAngularModule, getHttp, getToasts } from '../../kibana-services';
import { GenericRequest } from '../../react-services/generic-request';
import { ApiCheck } from '../../react-services/wz-api-check';
import { WzGlobalBreadcrumbWrapper } from '../common/globalBreadcrumb/globalBreadcrumbWrapper';
import { getDataPlugin } from '../../kibana-services';
import { WzUserPermissions } from '../../react-services/wz-user-permissions';

const sections = {
  'logModules=': 'logStatements',
  'overview/?tab=clamav': 'hostProtection',
  'overview/?tab=general': 'homeOverview',
  'overview/?tab': 'riskMonitoring',
  'manager/?tab=groups': 'assetManage',
  'manager/?tab=logs': 'logStatements',
  'manager/?tab=reporting': 'logStatements',
  'manager/?tab=status': 'systemManage',
  'manager/?tab=statistics': 'systemManage',
  'manager/?tab=configuration': 'systemManage',
  'agents-preview': 'assetManage',
  'agents': 'assetManage',
  'settings?tab=configuration': 'systemManage',
  'settings': 'settings',
  'wazuh-dev': 'systemManage',
  'health-check': 'health-check',
  
  'device-manage': 'assetManage',
  'manage-tool': 'assetManage',
  'manage-ti': 'assetManage',
  'weak-password': 'riskMonitoring',
  'plan-tasks': 'hostProtection',
  'black-whitelist': 'hostProtection',
  'admin-loginlog': 'logStatements',
  'admin-operationlog': 'logStatements',
  'system-param': 'systemManage',
  'workbench': 'homeOverview',
  'security?tab': 'systemManage',
  'multi-dimensional-risk': 'hostProtection',
  'system-run-log': 'logStatements',
  'license-manage': 'systemManage',
  'email-config': 'systemManage',
  'dingding-config': 'systemManage',
  'security-reinforce': 'hostProtection',
  'agent-configuration': 'systemManage',
   'manager-msl': 'systemManage',
  'device-record': 'assetManage',
  'agent-log': 'logStatements',
  'threat-back': 'backAnalysis',
};

class WzMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      hover: '',
      clickTab: '',
      currentMenuTab: '',
      currentAPI: '',
      APIlist: [],
      theresPattern: false,
      currentPattern: '',
      patternList: [],
      currentSelectedPattern: '',
      rolesType: '' // 角色类型
    };
    this.store = store;
    this.genericReq = GenericRequest;
    this.wazuhConfig = new WazuhConfig();
    this.indexPatterns = getDataPlugin().indexPatterns;
    this.isLoading = false;
  }

  async componentDidMount() {
    const $injector = getAngularModule().$injector;
    this.router = $injector.get('$route');
    try {
      const result = await this.genericReq.request('GET', '/hosts/apis', {});
      const APIlist = (result || {}).data || [];
      if (APIlist.length) {
        const { id: apiId } = JSON.parse(AppState.getCurrentAPI());
        const filteredApi = APIlist.filter(api => api.id === apiId);
        const selectedApi = filteredApi[0];
        if (selectedApi) {
          const apiData = await ApiCheck.checkStored(selectedApi.id);
          //update cluster info
          const cluster_info = (((apiData || {}).data || {}).data || {})
            .cluster_info;
          if (cluster_info) {
            AppState.setClusterInfo(cluster_info);
          }
        }
      }
      let res = await getHttp().get('/api/v1/configuration/account');
      if (res.data.backend_roles.indexOf('admin') !== -1) { // 超级管理员
        this.setState({ rolesType: 'admin' });
      }
      else if (res.data.backend_roles.indexOf('adminuser') !== -1) { // 用户管理员
        this.setState({ rolesType: 'adminuser' });
      }
      else if (res.data.backend_roles.indexOf('system') !== -1) { // 系统管理员
        this.setState({ rolesType: 'system' });
      }
      else if (res.data.backend_roles.indexOf('audit') !== -1) { // 审计管理员
        this.setState({ rolesType: 'audit' });
      }
    } catch (err) { }

  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  getCurrentTab() {
    const currentWindowLocation = window.location.hash;
    let currentTab = 'homeOverview';
    Object.keys(sections).some((section) => {
      if (currentWindowLocation.includes(`${section}`)) {
        currentTab = sections[section];
        
        return true;
      }
    });
    return currentTab;
  }

  loadApiList = async () => {
    const result = await this.genericReq.request('GET', '/hosts/apis', {});
    const APIlist = (result || {}).data || [];
    if (APIlist.length) this.setState({ APIlist });
  };

  loadIndexPatternsList = async () => {
    try {
      const list = await PatternHandler.getPatternList('api');
      if (!list) return;

      // Abort if we have disabled the pattern selector
      if (!AppState.getPatternSelector()) return;

      let filtered = false;
      // If there is no current pattern, fetch it
      if (!AppState.getCurrentPattern()) {
        AppState.setCurrentPattern(list[0].id);
      } else {
        // Check if the current pattern cookie is valid
        filtered = list.find(item =>
          item.id.includes(AppState.getCurrentPattern())
        );
        if (!filtered) AppState.setCurrentPattern(list[0].id);
      }

      const data = filtered
        ? filtered
        : await this.indexPatterns.get(AppState.getCurrentPattern());
      this.setState({ theresPattern: true, currentPattern: data.title });

      // Getting the list of index patterns
      if (list) {
        this.setState({
          patternList: list,
          currentSelectedPattern: AppState.getCurrentPattern()
        });
      }
    } catch (error) {
      this.showToast('danger', '警告', error, 4000);
    }
  }


  async componentDidUpdate(prevProps) {
    if (this.state.APIlist && !this.state.APIlist.length) {
      this.loadApiList();
    }
    const { id: apiId } = JSON.parse(AppState.getCurrentAPI());
    const { currentAPI } = this.state;
    const currentTab = this.getCurrentTab();
    if (currentTab !== this.state.currentMenuTab) {
      this.setState({ currentMenuTab: currentTab, clickTab: currentTab });
    }

    if (
      prevProps.state.showMenu !== this.props.state.showMenu ||
      (this.props.state.showMenu === true && this.state.showMenu === false)
    ) {
      this.load();
    }
    if ((!currentAPI && apiId) || apiId !== currentAPI) {
      this.setState({ currentAPI: apiId });
    } else {
      if (
        currentAPI &&
        this.props.state.currentAPI &&
        currentAPI !== this.props.state.currentAPI
      ) {
        this.setState({ currentAPI: this.props.state.currentAPI });
      }
    }
  }

  async load() {
    try {
      this.setState({
        showMenu: true
      });
      const wz_wrap = document.getElementsByTagName('body')[0];
      if (wz_wrap.className.indexOf('euiBody--collapsibleNavIsDocked--majorsec') === -1) {
        wz_wrap.className += " euiBody--collapsibleNavIsDocked--majorsec";
      }
      const currentTab = this.getCurrentTab();
      if (currentTab !== this.state.currentMenuTab) {
        this.setState({ currentMenuTab: currentTab, hover: currentTab, clickTab: currentTab });
      }

      const list = await PatternHandler.getPatternList('api');
      if (!list) return;

      // Abort if we have disabled the pattern selector
      if (!AppState.getPatternSelector()) return;

      let filtered = false;
      // If there is no current pattern, fetch it
      if (!AppState.getCurrentPattern()) {
        AppState.setCurrentPattern(list[0].id);
      } else {
        // Check if the current pattern cookie is valid
        filtered = list.filter(item =>
          item.id.includes(AppState.getCurrentPattern())
        );
        if (!filtered.length) AppState.setCurrentPattern(list[0].id);
      }

      const data = filtered
        ? filtered
        : await this.indexPatterns.get(AppState.getCurrentPattern());
      this.setState({ theresPattern: true, currentPattern: data.title });

      // Getting the list of index patterns
      if (list) {
        this.setState({
          patternList: list,
          currentSelectedPattern: AppState.getCurrentPattern()
        });
      }
    } catch (error) {
      this.showToast('danger', '警告', error, 4000);
    }
    this.isLoading = false;
  }

  buildWazuhNotReadyYet() {
    const container = document.getElementsByClassName('wazuhNotReadyYet');
    return ReactDOM.createPortal(
      <EuiCallOut title={this.props.state.wazuhNotReadyYet} color="warning">
        <EuiFlexGroup
          responsive={false}
          direction="row"
          style={{ maxHeight: '40px', marginTop: '-45px' }}
        >
          <EuiFlexItem>
            <p></p>
          </EuiFlexItem>
          {typeof this.props.state.wazuhNotReadyYet === "string" && this.props.state.wazuhNotReadyYet.includes('Restarting') && (
            <EuiFlexItem grow={false}>
              <p>
                {' '}
                <EuiLoadingSpinner size="l" /> &nbsp; &nbsp;{' '}
              </p>
            </EuiFlexItem>
          )}
          {this.props.state.wazuhNotReadyYet ===
            'Wazuh无法恢复。' && (
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  grow={false}
                  onClick={() => location.reload()}
                  className="WzNotReadyButton"
                >
                  <span> 重装 </span>
                </EuiButtonEmpty>
              </EuiFlexItem>
            )}
        </EuiFlexGroup>
      </EuiCallOut>,
      container[0]
    );
  }

  onClickHomeOverviewButton() {
    this.setState({ clickTab: 'homeOverview' });
  }

  onClickAgentButton() {
    this.setState({ clickTab: 'assetManage' });
  }

  onClickOverviewButton() {
    this.setState({ clickTab: 'riskMonitoring' });
  }

  onClickHostProtectionButton() {
    this.setState({ clickTab: 'hostProtection' });
  }

  onClickBackAnalysisButton() {
    this.setState({ clickTab: 'backAnalysis' });
  }

  onClickLogStatementsButton() {
    this.setState({ clickTab: 'logStatements' });
  }
  onClickSuricataButton() {
    this.setState({ clickTab: 'suricata' });
  }
  onClickKibanaManageButton() {
    this.setState({ clickTab: 'kibanaManage' });
  }
  onClickMslManageButton() {
    this.setState({ clickTab: 'ManagerMsl' });
  }
  onClickNetFlowManageButton(){
    this.setState({ clickTab: 'netFlowManage' });
  }
  onClickSystemManageButton() {
    this.setState({ clickTab: 'systemManage' });
  }

  color = (status, hex = false) => {
    if (status.toLowerCase() === 'active') { return hex ? '#017D73' : 'success'; }
    else if (status.toLowerCase() === 'disconnected') { return hex ? '#BD271E' : 'danger'; }
    else if (status.toLowerCase() === 'never connected') { return hex ? '#98A2B3' : 'subdued'; }
  }

  render() {
    const { rolesType } = this.state;
    const wz_menu = (
      <div className="wz-menu-header">
        <EuiButtonEmpty
          onMouseEnter={() => { this.setState({ hover: "homeOverview" }) }}
          className={
            'wz-menu-button ' +
            (this.state.currentMenuTab === "homeOverview"
              ? 'wz-menu-active'
              : '')}
          color="text"
          onClick={this.onClickHomeOverviewButton.bind(this)}
        >
          <EuiIcon type="home" color="#fff" size="m" />
          <span className="wz-menu-button-title ">首页</span>
        </EuiButtonEmpty>
        {
          (rolesType === 'admin' || rolesType === 'system') && (
            <div>
              <EuiButtonEmpty
                onMouseEnter={() => { this.setState({ hover: "assetManage" }) }}
                className={
                  'wz-menu-button ' +
                  (this.state.currentMenuTab === "assetManage"
                    ? 'wz-menu-active'
                    : '')}
                color="text"
                onClick={this.onClickAgentButton.bind(this)}
              >
                <EuiIcon type="watchesApp" color="#fff" size="m" />
                <span className="wz-menu-button-title ">资产管理</span>
              </EuiButtonEmpty>

              <EuiButtonEmpty
                onMouseEnter={() => { this.setState({ hover: "riskMonitoring" }) }}
                className={
                  'wz-menu-button ' +
                  (this.state.currentMenuTab === "riskMonitoring"
                    ? 'wz-menu-active'
                    : '')
                }
                color="text"
                onClick={this.onClickOverviewButton.bind(this)}
              >
                <EuiIcon type="securitySignal" color="#fff" size="m" />
                <span className="wz-menu-button-title " >风险检测</span>
                <span className="flex"></span>
                <span className="flex"></span>
              </EuiButtonEmpty>

              <EuiButtonEmpty
                onMouseEnter={() => { this.setState({ hover: "hostProtection" }) }}
                className={
                  'wz-menu-button ' +
                  (this.state.currentMenuTab === "hostProtection"
                    ? 'wz-menu-active'
                    : '')
                }
                color="text"
                onClick={this.onClickHostProtectionButton.bind(this)}
              >
                <EuiIcon type="link" color="#fff" size="m" />
                <span className="wz-menu-button-title " >主机防护</span>
                <span className="flex"></span>
                <span className="flex"></span>
              </EuiButtonEmpty>

            </div>
          )
        }
        {
          (rolesType === 'admin' || rolesType === 'audit') && (
            <div>
              <EuiButtonEmpty
                onMouseEnter={() => { this.setState({ hover: "backAnalysis" }) }}
                className={
                  'wz-menu-button ' +
                  (this.state.currentMenuTab === "backAnalysis"
                    ? 'wz-menu-active'
                    : '')
                }
                color="text"
                onClick={this.onClickBackAnalysisButton.bind(this)}
              >
                <EuiIcon type="stats" color="#fff" size="m" />
                <span className="wz-menu-button-title " >溯源分析</span>
                <span className="flex"></span>
                <span className="flex"></span>
              </EuiButtonEmpty>
            </div>
          )
        }
        {
          (rolesType === 'admin' || rolesType === 'audit') && (
            <div>
              <EuiButtonEmpty
                onMouseEnter={() => { this.setState({ hover: "logStatements" }) }}
                className={
                  'wz-menu-button ' +
                  (this.state.currentMenuTab === "logStatements"
                    ? 'wz-menu-active'
                    : '')
                }
                color="text"
                onClick={this.onClickLogStatementsButton.bind(this)}
              >
                <EuiIcon type="visBarVertical" color="#fff" size="m" />
                <span className="wz-menu-button-title " >日志报表</span>
                <span className="flex"></span>
                <span className="flex"></span>
              </EuiButtonEmpty>
            </div>
          )
        }    
               {
          (rolesType === 'admin' || rolesType === 'audit') && (
            <div>
              <EuiButtonEmpty
                onMouseEnter={() => { this.setState({ hover: "kibanaManage" }) }}
                className={
                  'wz-menu-button ' +
                  (this.state.currentMenuTab === "kibanaManage"
                    ? 'wz-menu-active'
                    : '')
                }
                color="text"
                onClick={this.onClickKibanaManageButton.bind(this)}
              >
                <EuiIcon type="visBarVertical" color="#fff" size="m" />
                <span className="wz-menu-button-title " >日志分析</span>
                <span className="flex"></span>
                <span className="flex"></span>
              </EuiButtonEmpty>
            </div>
          )
        }
                  {
          (rolesType === 'admin' || rolesType === 'audit') && (
            <div>
              <EuiButtonEmpty
                onMouseEnter={() => { this.setState({ hover: "managerMsl" }) }}
                className={
                  'wz-menu-button ' +
                  (this.state.currentMenuTab === "managerMsl"
                    ? 'wz-menu-active'
                    : '')
                }
                color="text"
                onClick={this.onClickMslManageButton.bind(this)}
              >
                <EuiIcon type="visBarVertical" color="#fff" size="m" />
                <span className="wz-menu-button-title " >数据库查询</span>
                <span className="flex"></span>
                <span className="flex"></span>
              </EuiButtonEmpty>
            </div>
          )
        }
         {/* {
          (rolesType === 'admin' || rolesType === 'audit') && (
            <div>
              <EuiButtonEmpty
                onMouseEnter={() => { this.setState({ hover: "suricata" }) }}
                className={
                  'wz-menu-button ' +
                  (this.state.currentMenuTab === "suricataManage"
                    ? 'wz-menu-active'
                    : '')
                }
                color="text"
                onClick={this.onClickSuricataButton.bind(this)}
              >
                <EuiIcon type="visBarVertical" color="#fff" size="m" />
                <span className="wz-menu-button-title " >suricata日志</span>
                <span className="flex"></span>
                <span className="flex"></span>
              </EuiButtonEmpty>
            </div>
          )
        }
        {
          (rolesType === 'admin' || rolesType === 'audit') && (
            <div>
              <EuiButtonEmpty
                onMouseEnter={() => { this.setState({ hover: "netFlowManage" }) }}
                className={
                  'wz-menu-button ' +
                  (this.state.currentMenuTab === "netFlowManage"
                    ? 'wz-menu-active'
                    : '')
                }
                color="text"
                onClick={this.onClickNetFlowManageButton.bind(this)}
              >
                <EuiIcon type="visBarVertical" color="#fff" size="m" />
                <span className="wz-menu-button-title " >流量分析</span>
                <span className="flex"></span>
                <span className="flex"></span>
              </EuiButtonEmpty>
            </div>
          )
        } */}
        {
          (rolesType === 'admin' || rolesType === 'system' || rolesType === 'adminuser') && (
            <div>
              <EuiButtonEmpty
                onMouseEnter={() => { this.setState({ hover: "systemManage" }) }}
                className={
                  'wz-menu-button ' +
                  (this.state.currentMenuTab === "systemManage"
                    ? 'wz-menu-active'
                    : '')
                }
                color="text"
                onClick={this.onClickSystemManageButton.bind(this)}
              >
                <EuiIcon type="managementApp" color="#fff" size="m" />
                <span className="wz-menu-button-title " >系统管理</span>
                <span className="flex"></span>
                <span className="flex"></span>
              </EuiButtonEmpty>
            </div>
          )
        }
      </div>
    );
    const wz_nav = (
      <div>
        {this.state.clickTab === 'homeOverview' && (
          <HomeOverview></HomeOverview>
          )}
        {this.state.clickTab === 'assetManage' && (
          <AssetManage rolesType={rolesType}></AssetManage>
        )}
        {this.state.clickTab === 'riskMonitoring' && (
          <RiskMonitoring rolesType={rolesType}></RiskMonitoring>
        )}
        {this.state.clickTab === 'hostProtection' && (
          <HostProtection rolesType={rolesType}></HostProtection>
        )}
        {this.state.clickTab === 'backAnalysis' && (
          <BackAnalysis rolesType={rolesType}></BackAnalysis>
        )}
        {this.state.clickTab === 'logStatements' && (
          <LogStatements rolesType={rolesType}></LogStatements>
        )}
        {this.state.clickTab === 'systemManage' && (
          <SystemManage rolesType={rolesType}></SystemManage>
        )}
      </div>
    );
    // console.log(getHttp());
    // let res = getHttp().get('http://10.0.102.59:9000/api/tasks/list/');
    // let res = getHttp().getUrl('http://10.0.102.59:9000/api/tasks/list/', { urlParams: '111', endUrl: '/end'});
    // let res = getHttp().postUrl('http://10.0.102.59:9000/api/tasks/list/', { urlParams: '111', endUrl: '/end', body: JSON.stringify({ name: '333'})});
    // console.log(res)

    const logotype_url = getHttp().basePath.prepend('/plugins/wazuh/assets/logotype.svg');

    const container = document.getElementsByClassName('euiBreadcrumbs');
    return ReactDOM.createPortal(
      <WzReduxProvider>
        <Fragment>
          {/* <Fragment>{wz_menu}</Fragment>
          <Fragment>{wz_nav}</Fragment> */}
          <WzGlobalBreadcrumbWrapper></WzGlobalBreadcrumbWrapper>
          {this.props.state.wazuhNotReadyYet && this.buildWazuhNotReadyYet()}
        </Fragment>
      </WzReduxProvider>,
      container[0]
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.appStateReducers
  };
};

export default connect(
  mapStateToProps,
  null
)(WzMenu);
