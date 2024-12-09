/*
 * Wazuh app - React component building the welcome screen of an agent.
 * version, OS, registration date, last keep alive.
 *
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
import {
  EuiCard,
  EuiIcon,
  EuiPanel,
  EuiFlexItem,
  EuiFlexGroup,
  EuiSpacer,
  EuiText,
  EuiFlexGrid,
  EuiButtonEmpty,
  EuiTitle,
  EuiHealth,
  EuiHorizontalRule,
  EuiPage,
  EuiButton,
  EuiPopover,
  EuiSelect,
  EuiLoadingChart,
  EuiToolTip,
  EuiButtonIcon,
  EuiEmptyPrompt,
  EuiPageBody,
  EuiOverlayMask,
  EuiConfirmModal
} from '@elastic/eui';
import { FimEventsTable, ScaScan, MitreTopTactics, RequirementVis } from './components';
import { AgentInfo } from './agents-info';
import { WAZUH_MODULES } from '../../../../common/wazuh-modules';
import store from '../../../redux/store';
import { updateGlobalBreadcrumb } from '../../../redux/actions/globalBreadcrumbActions';
import { ActionAgents } from '../../../react-services/action-agents';
import WzReduxProvider from '../../../redux/wz-redux-provider';
import MenuAgent from './components/menu-agent';
import './welcome.scss';
import { WzDatePicker } from '../../../components/wz-date-picker/wz-date-picker';
import KibanaVis from '../../../kibana-integrations/kibana-vis';
import { VisFactoryHandler } from '../../../react-services/vis-factory-handler';
import { AppState } from '../../../react-services/app-state';
import { FilterHandler } from '../../../utils/filter-handler';
import { TabVisualizations } from '../../../factories/tab-visualizations';
import { updateCurrentAgentData } from '../../../redux/actions/appStateActions';
import WzTextWithTooltipIfTruncated from '../wz-text-with-tooltip-if-truncated';
import { getAngularModule, getToasts } from '../../../kibana-services';
import { hasAgentSupportModule } from '../../../react-services/wz-agents';
import { WzRequest } from '../../../react-services/wz-request';
import { WzStat } from '../../wz-stat';
import { SyscollectorInventory } from '../../agents/syscollector/inventory';

export class AgentsWelcome extends Component {
  _isMount = false;
  constructor(props) {
    super(props);

    this.offset = 275;

    this.state = {
      extensions: this.props.extensions,
      lastScans: [],
      isLoading: true,
      sortField: 'start_scan',
      sortDirection: 'desc',
      actionAgents: true, // Hide actions agents
      selectedRequirement: 'pci',
      menuAgent: {},
      maxModules: 7,
      widthWindow: window.innerWidth,
      agentData: {},
      isBrokenNetworkModalVisible: false,
      isConnnectNetworkModalVisible: false,
      isCluster: false
    };
  }

  updateWidth = () => {

    let menuSize = (window.innerWidth - this.offset);
    let maxModules = 7;
    if(menuSize > 1250) {
      maxModules = 8;
    } else {
      if(menuSize > 1100 ) {
        maxModules = 7;
      } else {
        if(menuSize > 900) {
          maxModules = 6;
        } else {
          maxModules = 5;
          if(menuSize < 750) {
            maxModules = null;
          }
        }
      }
    }

    this.setState({maxModules: maxModules, widthWindow: window.innerWidth});
  };

  setGlobalBreadcrumb() {
    const breadcrumb = [
      { text: '' },
      { text: '资产管理' },
      {
        text: '主机管理',
        href: "#/agents-preview"
      },
      {
        text: `${this.props.agent.name}`,
        className: 'wz-global-breadcrumb-btn euiBreadcrumb--truncate',
        truncate: false,
      }
    ];
    store.dispatch(updateGlobalBreadcrumb(breadcrumb));
  }


  async componentDidMount() {
    this._isMount = true;

    const clusterStatus = await WzRequest.apiReq('GET', `/cluster/status`, {});
    const clusterData = ((clusterStatus || {}).data || {}).data || {};
    const isCluster = clusterData.enabled === 'yes' && clusterData.running === 'yes';
    this.setState({
      isCluster
    });

    store.dispatch(updateCurrentAgentData(this.props.agent));
    this.updateMenuAgents();
    this.updateWidth();
    this.setGlobalBreadcrumb();
    this.getAgentData();
    const tabVisualizations = new TabVisualizations();
    tabVisualizations.removeAll();
    tabVisualizations.setTab('welcome');
    tabVisualizations.assign({
      welcome: 8
    });
    const filterHandler = new FilterHandler(AppState.getCurrentPattern());
    await VisFactoryHandler.buildAgentsVisualizations(
      filterHandler,
      'welcome',
      null,
      this.props.agent.id
    );
    const $injector = getAngularModule().$injector;
    this.router = $injector.get('$route');
    window.addEventListener('resize', this.updateWidth); //eslint-disable-line
  }

  async getAgentData() {
    const { isCluster } = this.state;
    const { agent } = this.props;
    const url = {
      isCluster: `/cluster/${agent.node_name}/agents/${agent.id}/usage?pretty=true`,
      noCluster: `/agents/${agent.id}/usage?pretty=true`
    }
    const rawItems = await WzRequest.apiReq('GET', `${isCluster ? url.isCluster : url.noCluster}`, {});
    const data = ((rawItems || {}).data || {}).data;
    const agentData = {
      node_name: agent.node_name,
      tag: agent.tag,
      cpu: data.cpu,
      disk: data.disk,
      mem: data.mem,
      net: data.net,
      netbor: data.netbor,
    }
    this.setState({
      agentData
    });
  }

  buildStats(items) {
    const checkField = field => {
      return field !== undefined || field ? field : '-';
    };
    const stats = items.map(item => {
      return (
        <EuiFlexItem key={item.description} style={item.style || null}>
          <WzStat
            title={(
              <WzTextWithTooltipIfTruncated position='bottom' elementStyle={{ maxWidth: "250px", fontSize: 12 }}>
                {checkField(item.title)}
              </WzTextWithTooltipIfTruncated>
            )}
            description={item.description}
            titleSize="xs"
          />
        </EuiFlexItem>
      );
    });
    return stats;
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  setBrokenNetworkModal(flag) {
    this.setState({isBrokenNetworkModalVisible: flag});
  }

  setConnnectNetworkModal(flag) {
    this.setState({isConnnectNetworkModalVisible: flag});
  }

  async toBrokenNetwork() {
    try {
      const { agent } = this.props;
      let params = {
        command: 'netbreak.sh',
        custom: true
      }
      const rawItems = await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${agent.id}`, params);
      const { total_affected_items } = ((rawItems || {}).data || {}).data;
      if (total_affected_items === 1) {
        // this.getAgentData();
        this.showToast(
          'success',
          '成功',
          '一键断网成功，网络状态延时更新',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '一键断网失败: ' + error,
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '一键断网失败: ' + error,
        3000
      );
    }
    this.setBrokenNetworkModal(false)
  }

  async toConnnectNetwork() {
    try {
      const { agent } = this.props;
      let params = {
        command: 'netrelease.sh',
        custom: true
      }
      const rawItems = await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${agent.id}`, params);
      const { total_affected_items } = ((rawItems || {}).data || {}).data;
      if (total_affected_items === 1) {
        // this.getAgentData();
        this.showToast(
          'success',
          '成功',
          '恢复连接成功，网络状态延时更新',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '恢复连接失败: ' + error,
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '恢复连接失败: ' + error,
        3000
      );
    }
    this.setConnnectNetworkModal(false)
  }

  updateMenuAgents() {
    const defaultMenuAgents = {
      // general: { 
      //   id: 'general', 
      //   text: '安全事件', 
      //   isPin: true, 
      // },
      fim: { 
        id: 'fim', 
        text: '关键文件', 
        isPin: true, 
      },
      sca: { 
        id: 'sca', 
        text: '基线检测', 
        isPin: true, 
      },
      pm: {
        id: "pm",
        text: "策略监控",
        isPin: true
      },
      mitre: { 
        id: 'mitre', 
        text: '网络检测', 
        isPin: true, 
      },
      vuls: { 
        id: 'vuls', 
        text: '漏洞检测', 
        isPin: true,
      },
      // audit: { 
      //   id: 'audit', 
      //   text: '系统审核', 
      //   isPin: true,
      // },
     
      
    }

    let menuAgent = JSON.parse(window.localStorage.getItem('menuAgent'));

    // Check if pinned modules to agent menu are enabled in Settings/Modules, if not then modify localstorage removing the disabled modules
    if(menuAgent){
      const needUpdateMenuAgent = Object.keys(menuAgent).map(moduleName => menuAgent[moduleName]).reduce((accum, item) => {
        if(typeof this.props.extensions[item.id] !== 'undefined' && this.props.extensions[item.id] === false){
          delete menuAgent[item.id];
          accum = true;
        }
        return accum;
      }, false);
      if(needUpdateMenuAgent){
        // Update the pinned modules matching to enabled modules in Setings/Modules
        window.localStorage.setItem('menuAgent', JSON.stringify(menuAgent))
      }
    }else{
      menuAgent = defaultMenuAgents;
      window.localStorage.setItem('menuAgent', JSON.stringify(defaultMenuAgents));
    }
    this.setState({ menuAgent: menuAgent});
  }

  renderModules() {
    const menuAgent = [...Object.keys(this.state.menuAgent).map((item) => { return this.state.menuAgent[item] })];

    return (
      <Fragment>
        {
          menuAgent.map((menuAgent, i) => {
            if(i < this.state.maxModules && hasAgentSupportModule(this.props.agent, menuAgent.id)) {
            return (
            <EuiFlexItem key={i} grow={false} style={{ marginLeft: 0, marginTop: 7 }}>
              <EuiButtonEmpty
                onClick={() => {
                  window.location.href = `#/overview/?tab=${menuAgent.id}&tabView=${menuAgent.text === '系统配置' ? 'inventory' : 'panels'}`;
                  this.router.reload();
                }} style={{ cursor: 'pointer' }}>
                <span>{menuAgent.text}&nbsp;</span>
              </EuiButtonEmpty>
            </EuiFlexItem>
            )}
          }
          )}
        {/* <EuiFlexItem grow={false} style={{ marginTop: 7 }}>
          <EuiPopover
            button={
              <EuiButtonEmpty
                iconSide="right"
                iconType="arrowDown"
                onClick={() => this.setState({ switchModule: !this.state.switchModule })}>
                更多...
              </EuiButtonEmpty>
            }
            isOpen={this.state.switchModule}
            closePopover={() => this.setState({ switchModule: false })}
            repositionOnScroll={false}
            anchorPosition="downCenter">
            <div>
              <WzReduxProvider>
                <div style={{ maxWidth: 730 }}>
                  <MenuAgent
                    isAgent={this.props.agent}
                    updateMenuAgents={() => this.updateMenuAgents()}
                    closePopover={() => {
                      this.setState({ switchModule: false })
                    }
                    }
                    switchTab={(module) => this.props.switchTab(module)}></MenuAgent>
                </div>
              </WzReduxProvider>
            </div>
          </EuiPopover>
        </EuiFlexItem> */}
      </Fragment>
    )
  }

  renderTitle() {
    const { agentData } = this.state;

      return (
        <EuiFlexGroup>
          <EuiFlexItem className="wz-module-header-agent-title">
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>
                <span style={{ display: 'inline-flex' }}>
                  <EuiTitle size="s">
                    <h1>
                      <WzTextWithTooltipIfTruncated position='top' elementStyle={{ maxWidth: "150px"}}>
                        {this.props.agent.name}
                      </WzTextWithTooltipIfTruncated>
                    </h1>
                  </EuiTitle>
                </span>
              </EuiFlexItem>
              {/* {
                (this.state.maxModules !== null && 
                this.renderModules()) ||
                <EuiFlexItem style={{ marginTop: 7 }}>
                  <EuiPopover
                    button={
                      <EuiButtonEmpty
                        iconSide="right"
                        iconType="arrowDown"
                        onClick={() => this.setState({ switchModule: !this.state.switchModule })}>
                        模块
                      </EuiButtonEmpty>
                    }
                    isOpen={this.state.switchModule}
                    closePopover={() => this.setState({ switchModule: false })}
                    repositionOnScroll={false}
                    anchorPosition="downCenter">
                    <div>
                      <WzReduxProvider>
                        <div style={{ maxWidth: 730 }}>
                          <MenuAgent
                            isAgent={this.props.agent}
                            updateMenuAgents={() => this.updateMenuAgents()}
                            closePopover={() => {
                              this.setState({ switchModule: false })
                            }
                            }
                            switchTab={(module) => this.props.switchTab(module)}></MenuAgent>
                        </div>
                      </WzReduxProvider>
                    </div>
                  </EuiPopover>
                </EuiFlexItem>
              } */}
              <EuiFlexItem></EuiFlexItem>
              <EuiFlexItem grow={false} style={{ marginTop: 7 }}>
                { agentData.netbor && agentData.netbor === 'netrelease' && (
                  // <EuiButtonEmpty
                  //   iconType="unlink"
                  //   onClick={() => this.setBrokenNetworkModal(true)}>
                  //   一键断网
                  // </EuiButtonEmpty>
                  <EuiButton
                    size="s"
                    onClick={() => this.setBrokenNetworkModal(true)}
                  >
                    一键断网
                  </EuiButton>
                )}
                { agentData.netbor && agentData.netbor === 'netbreak' && (
                  // <EuiButtonEmpty
                  //   iconType="link"
                  //   onClick={() => this.setConnnectNetworkModal(true)}>
                  //   恢复网络连接
                  // </EuiButtonEmpty>
                  <EuiButton
                    size="s"
                    onClick={() => this.setConnnectNetworkModal(true)}
                  >
                    恢复网络连接
                  </EuiButton>
                )}
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ marginTop: 7 }}>
                <EuiButtonEmpty
                  iconType="cross"
                  onClick={() => {
                    const currentUrl = window.location.href.split("#/")[0].split("/app/")[0];
                    const newUrl = currentUrl+ `/app/wazuh#/agents-preview`;
                    window.location.href = newUrl;
                  }}>
                  返回主机管理
                </EuiButtonEmpty>
              </EuiFlexItem>
              {/* <EuiFlexItem grow={false} style={{ marginTop: 7 }}>
                <EuiButtonEmpty
                  iconType="inspect"
                  onClick={() => this.props.switchTab('syscollector')}>
                  详细信息
                </EuiButtonEmpty>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ marginTop: 7 }}>
                <EuiButtonEmpty
                  iconType="gear"
                  onClick={() => this.props.switchTab('configuration')}>
                  配置
                </EuiButtonEmpty>
              </EuiFlexItem> */}
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
      );

  }

  buildTabCard(tab, icon) {
    return (
      <EuiFlexItem>
        <EuiCard
          size="xs"
          layout="horizontal"
          icon={<EuiIcon size="xl" type={icon} color="primary" />}
          className="homSynopsis__card"
          title={WAZUH_MODULES[tab].title}
          onClick={() => this.props.switchTab(tab)}
          description={WAZUH_MODULES[tab].description}
        />
      </EuiFlexItem>
    );
  }
  onClickRestartAgent = () => {
    const { agent } = this.props;
    ActionAgents.restartAgent(agent.id);
  };

  onClickUpgradeAgent = () => {
    const { agent } = this.props;
    ActionAgents.upgradeAgent(agent.id);
  };

  renderUpgradeButton() {
    const { managerVersion } = this.state;
    const { agent } = this.props;
    let outDated = ActionAgents.compareVersions(managerVersion, agent.version);

    if (outDated === true) return;
    return (
      <EuiFlexItem grow={false}>
        <EuiButton
          color="secondary"
          iconType="sortUp"
          onClick={this.onClickUpgradeAgent}
        >
          更新
        </EuiButton>
      </EuiFlexItem>
    );
  }

  onTimeChange = (datePicker) => {
    const { start: from, end: to } = datePicker;
    this.setState({ datePicker: { from, to } });
  }

  getOptions() {
    return [
      { value: 'pci', text: 'PCI DSS' },
      { value: 'gdpr', text: 'GDPR' },
      { value: 'nist', text: 'NIST 800-53' },
      { value: 'hipaa', text: 'HIPAA' },
      { value: 'gpg13', text: 'GPG13' },
      { value: 'tsc', text: 'TSC' },
    ];
  }

  setSelectValue(e) {
    this.setState({ selectedRequirement: e.target.value });
  }

  getRequirementVis() {
    if (this.state.selectedRequirement === 'pci') {
      return 'Wazuh-App-Agents-Welcome-Top-PCI';
    }
    if (this.state.selectedRequirement === 'gdpr') {
      return 'Wazuh-App-Agents-Welcome-Top-GDPR';
    }
    if (this.state.selectedRequirement === 'hipaa') {
      return 'Wazuh-App-Agents-Welcome-Top-HIPAA';
    }
    if (this.state.selectedRequirement === 'nist') {
      return 'Wazuh-App-Agents-Welcome-Top-NIST-800-53';
    }
    if (this.state.selectedRequirement === 'gpg13') {
      return 'Wazuh-App-Agents-Welcome-Top-GPG-13';
    }
    if (this.state.selectedRequirement === 'tsc') {
      return 'Wazuh-App-Agents-Welcome-Top-TSC';
    }
    return 'Wazuh-App-Agents-Welcome-Top-PCI'
  }

  renderMitrePanel(){
    return (
      <Fragment>
        <EuiPanel paddingSize="s" height={{ height: 300 }}>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <h2 className="embPanel__title wz-headline-title">
                  <EuiText size="xs"><h2>MITRE</h2></EuiText>
                </h2>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ alignSelf: 'center' }}>
                <EuiToolTip position="top" content="打开MITRE">
                  <EuiButtonIcon
                    iconType="popout"
                    color="primary"
                    onClick={() => {
                      window.location.href = `#/overview?tab=mitre`;
                      this.router.reload();
                    }
                    }
                    aria-label="打开MITRE" />
                </EuiToolTip>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiSpacer size="m" />
          <EuiFlexGroup>
            <EuiFlexItem>
              <MitreTopTactics agentId={this.props.agent.id} />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </Fragment>

    )
  }

  renderCompliancePanel(){
    return (
      <RequirementVis
        agent={this.props.agent}
        width={200}
        height={200}
        innerRadius={70}
        outerRadius={100} />
    )
  }

  renderEventCountVisualization(){
    return (
      <EuiPanel paddingSize="s" >
        <EuiFlexItem>
          <EuiFlexGroup>
            <EuiFlexItem>
              <h2 className="embPanel__title wz-headline-title">
                <EuiText size="xs"><h2>告警趋势</h2></EuiText>
              </h2>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="s" />
          <div style={{ height: this.props.resultState !== 'loading' ? '225px' : 0 }}>
            <WzReduxProvider>
              <KibanaVis
                visID={'Wazuh-App-Agents-Welcome-Events-Evolution'}
                tab={'welcome'}
              ></KibanaVis>
            </WzReduxProvider>
          </div>
          <div style={{ display: this.props.resultState === 'loading' ? 'block' : 'none', alignSelf: "center", paddingTop: 100 }}>
            <EuiLoadingChart size="xl" />
          </div>
        </EuiFlexItem>
      </EuiPanel>
    )
  }

  renderSCALastScan(){
    return (
      <EuiFlexGroup direction="column">
        <ScaScan switchTab={this.props.switchTab} {...this.props} />
      </EuiFlexGroup>
    )
  }

  render() {
    const title = this.renderTitle();
    const upgradeButton = this.renderUpgradeButton();
    const { agentData, isBrokenNetworkModalVisible, isConnnectNetworkModalVisible } = this.state;
    let brokenNetworkModal, connnectNetworkModal;
    if (this.props.agent.status === 'never_connected') {
      return (
        <EuiEmptyPrompt
          iconType="securitySignalDetected"
          style={{ marginTop: 20 }}
          title={<h2>代理从未连接。</h2>}
          body={
            <Fragment>
              <p>
                代理已注册，但尚未连接到管理器。
            </p>
              <a href="https://documentation.wazuh.com/current/user-manual/agents/agent-connection.html" target="_blank">
                https://documentation.wazuh.com/current/user-manual/agents/agent-connection.html
            </a>
            </Fragment>
          }
          actions={
            <EuiButton href='#/agents-preview?' color="primary" fill>
              返回
          </EuiButton>
          }
        />)
    }

    if (isBrokenNetworkModalVisible) {
      brokenNetworkModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认将该代理一键断网吗？"
            onCancel={() => this.setBrokenNetworkModal(false)}
            onConfirm={() => this.toBrokenNetwork()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
          </EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

    if (isConnnectNetworkModalVisible) {
      connnectNetworkModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认将该代理恢复连接吗？"
            onCancel={() => this.setConnnectNetworkModal(false)}
            onConfirm={() => this.toConnnectNetwork()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
          </EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

    const arrayStats = [
      {
        title: agentData.node_name && agentData.node_name !== 'unknown' ? agentData.node_name : '-',
        description: '集群节点'
      },
      { title: agentData.tag, description: '标签' },
      { title: agentData.cpu, description: 'CPU' },
      { title: agentData.mem, description: '内存' },
      { title: agentData.disk, description: '硬盘' },
      { title: agentData.net, description: '实时网速' },
      { 
        title: !agentData.netbor ? '-' : agentData.netbor === 'netbreak' ? '断网' : '连接',
        description: '网络状态'
      },
    ]

    const stats = this.buildStats(arrayStats);

    return (
      <div className="wz-module wz-module-welcome">
        <div className='wz-module-header-agent wz-module-header-agent-main'>
          {title}
        </div>
        <div>
          <div className='wz-module-header-nav'>
            <div style={{ margin: '0 16px 8px' }}>
              <EuiPanel paddingSize='s' className="wz-welcome-page-agent-info">
                <AgentInfo agent={this.props.agent} isCondensed={false} hideActions={true} {...this.props}></AgentInfo>
                <EuiFlexGroup className="wz-welcome-page-agent-info-details">
                  {stats}
                </EuiFlexGroup>
              </EuiPanel>
            </div>
            <SyscollectorInventory agent={this.props.agent}></SyscollectorInventory>
          </div>
        </div>
        {brokenNetworkModal}
        {connnectNetworkModal}
      </div>
    );
  }
}
