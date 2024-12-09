/*
 * Wazuh app - React component for building the agents preview section.
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
import PropTypes from 'prop-types';
import {
  EuiPage,
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiStat,
  EuiLoadingChart,
  EuiSpacer,
  EuiText,
  EuiEmptyPrompt,
  EuiToolTip,
	EuiButtonIcon,
	EuiTitle,
	EuiPopover,
	EuiPopoverTitle,
} from '@elastic/eui';
import { Pie } from "../../../components/d3/pie";
import { ProgressChart } from "../../../components/d3/progress";
import { AgentsTable } from './agents-table'
import { WzRequest } from '../../../react-services/wz-request';
import KibanaVis from '../../../kibana-integrations/kibana-vis';
import WzReduxProvider from '../../../redux/wz-redux-provider';
import { VisFactoryHandler } from '../../../react-services/vis-factory-handler';
import { AppState } from '../../../react-services/app-state';
import { FilterHandler } from '../../../utils/filter-handler';
import { TabVisualizations } from '../../../factories/tab-visualizations';
import { WazuhConfig } from './../../../react-services/wazuh-config.js';
import { WzDatePicker } from '../../../components/wz-date-picker/wz-date-picker';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../../components/common/hocs';
import { WAZUH_MODULES } from '../../../../common/wazuh-modules';
import { formatUIDate } from '../../../../public/react-services/time-service';
import { compose } from 'redux';
import { AppNavigate } from '../../../react-services/app-navigate';

export const AgentsPreview = compose(
  withReduxProvider,
  withGlobalBreadcrumb([{ text: '' }, { text: '资产管理' }, { text: '主机管理' }]),
  withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class AgentsPreview extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = { data: [], loading: false, showAgentsEvolutionVisualization: false, agentTableFilters: [], isDescPopoverOpen: false, currentUserInfo: {} };
    this.wazuhConfig = new WazuhConfig();
    this.agentStatusLabelToIDMap = {
      '已连接': 'active',
      '未连接': 'disconnected',
      '从未连接': 'never_connected'
    }
  }

  async componentDidMount() {
    this._isMount = true;
    let res = await AppState.getCurrentUserInfo();
    this.setState({ currentUserInfo: res });
    this.getSummary();
    if( this.wazuhConfig.getConfig()['wazuh.monitoring.enabled'] ){
      this._isMount && this.setState({ showAgentsEvolutionVisualization: true });
      const tabVisualizations = new TabVisualizations();
      tabVisualizations.removeAll();
      tabVisualizations.setTab('general');
      tabVisualizations.assign({
        general: 1
      });
      const filterHandler = new FilterHandler(AppState.getCurrentPattern());
      await VisFactoryHandler.buildOverviewVisualizations(
        filterHandler,
        'general',
        null
      );
    }
  }

  componentWillUnmount() {
    this._isMount = false;
  }

  agentStatusLabelToID(label){
    return this.agentStatusLabelToIDMap[label];
  }

  groupBy = function(arr) {
    return arr.reduce(function(prev, item) {
      if (item in prev) prev[item]++;
      else prev[item] = 1;
      return prev;
    }, {});
  };

  async getSummary() {
    try {
      this.setState({ loading: true });
      const summaryData = await WzRequest.apiReq('GET', '/agents/summary/status', {});
      this.summary = summaryData.data.data;
      this.totalAgents = this.summary.total;
      const model = [
        { id: 'active', label: "已连接", value: this.summary['active'] || 0 },
        { id: 'disconnected', label: "未连接", value: this.summary['disconnected'] || 0 },
        { id: 'neverConnected', label: "从未连接", value: this.summary['never_connected'] || 0 }
      ];
      this.setState({ data: model });
      this.agentsCoverity = this.totalAgents ? ((this.summary['active'] || 0) / this.totalAgents) * 100 : 0;
      const lastAgent = await WzRequest.apiReq('GET', '/agents', {params: { limit: 1, sort: '-dateAdd', q: 'id!=000' }});
      this.lastAgent = lastAgent.data.data.affected_items[0];
      this.mostActiveAgent = await this.props.tableProps.getMostActive();
      const osresult = await WzRequest.apiReq('GET', '/agents/summary/os', {});
      this.platforms = this.groupBy(osresult.data.data.affected_items);
      const platformsModel = [];
      for (let [key, value] of Object.entries(this.platforms)) {
        platformsModel.push({ id: key, label: key, value: value });
      }
      this._isMount &&
        this.setState({ platforms: platformsModel, loading: false });
    } catch (error) {}
  }
  
  removeFilters(){
    this._isMount && this.setState({agentTableFilters: []})
  }

  renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'} alignItems="center">
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['agentsPreview'].title}&nbsp;&nbsp;</span>
                  </h1>
                </EuiTitle>
                <EuiPopover
                  button={
                    <EuiButtonIcon
                      iconType="iInCircle"
                      style={{marginTop: 3}}
                      color='primary'
                      aria-label='Open/close'
                      onClick={() => { this.setState({ isDescPopoverOpen: !this.state.isDescPopoverOpen }) }}
                    />
                  }
                  anchorPosition="rightUp"
                  isOpen={this.state.isDescPopoverOpen}
                  closePopover={() => { this.setState({ isDescPopoverOpen: false }) }}>
                  <EuiPopoverTitle>模块说明</EuiPopoverTitle>
                  <div style={{ width: '400px' }}>
                    {WAZUH_MODULES['agentsPreview'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}></EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
	}

  render() {
    const colors = ['#017D73', '#bd271e', '#69707D'];
    const title = this.renderTitle();
    const { currentUserInfo } = this.state;
    return (
      <EuiFlexGroup direction="column">
        <EuiFlexItem grow={false}>
          <div className="wz-module">
            <div className='wz-module-header-agent-wrapper'>
							<div className='wz-module-header-agent'>
								{title}
							</div>
						</div>
            <div className='wz-module-body-notab'>
              <EuiPage>
                <EuiFlexItem >
              { !currentUserInfo.department && (
                <div>
                  <EuiFlexGroup style={{ marginTop: 0 }} className="agents-evolution-visualization-group">
                    {this.state.loading && (
                      <EuiFlexItem>
                        <EuiLoadingChart
                          style={{ margin: '75px auto' }}
                          size="xl"
                        />
                      </EuiFlexItem>
                    ) || (
                    <Fragment>
                    {/* <EuiFlexItem className="agents-status-pie" grow={false}>
                      <EuiPanel
                        betaBadgeLabel="状态"
                        style={{ paddingBottom: 0, minHeight: 168, minWidth: 350 }}
                      >
                        <EuiFlexGroup>
                          {this.totalAgents > 0 && (
                            <EuiFlexItem style={{ alignItems: 'center' }}>
                              <Pie
                                legendAction={(status) => this._isMount && this.setState({
                                  agentTableFilters: [ {field: 'q', value: `status=${this.agentStatusLabelToID(status)}`}]
                                })}
                                width={300}
                                height={150}
                                data={this.state.data}
                                colors={colors}
                              />
                            </EuiFlexItem>
                          )}
                        </EuiFlexGroup>
                      </EuiPanel>
                    </EuiFlexItem> */}
                    {this.totalAgents > 0 && (
                      <EuiFlexItem >
                        <EuiPanel betaBadgeLabel="详情">  
                          <EuiFlexGroup>
                            <EuiFlexItem>
                              {this.summary && (
                                <EuiFlexGroup style={{ padding: '12px 0px' }}>
                                  <EuiFlexItem>
                                      <EuiStat
                                        title={this.state.data[0].value}
                                        titleSize={'s'}
                                        description="已连接"
                                        style={{ whiteSpace: 'nowrap' }}
                                      />
                                    </EuiFlexItem>
                                    <EuiFlexItem>
                                      <EuiStat
                                        title={this.state.data[1].value}
                                        titleSize={'s'}
                                        description="未连接"
                                        style={{ whiteSpace: 'nowrap' }}
                                      />
                                    </EuiFlexItem>
                                    <EuiFlexItem>
                                      <EuiStat
                                        title={this.state.data[2].value}
                                        titleSize={'s'}
                                        description="从未连接"
                                        style={{ whiteSpace: 'nowrap' }}
                                      />
                                    </EuiFlexItem>
                                    <EuiFlexItem>
                                      <EuiStat
                                        title={`${this.agentsCoverity.toFixed(2)}%`}
                                        titleSize={'s'}
                                        description="代理覆盖"
                                        style={{ whiteSpace: 'nowrap' }}
                                      />
                                    </EuiFlexItem>
                                </EuiFlexGroup>
                              )}
                              <EuiFlexGroup style={{ marginTop: 0 }}>
                                {this.lastAgent && (
                                  <EuiFlexItem>
                                    <EuiStat
                                      className="euiStatLink"
                                      title={
                                      <EuiToolTip
                                        position='top'
                                        content='显示代理详情'>
                                          {/* <a onClick={() => 
                                          this.props.tableProps.showAgent(
                                            this.lastAgent
                                          )}>{this.lastAgent.name}</a> */}
                                          <a onClick={(ev) => {
                                            console.log(this.lastAgent)
                                            this.props.tableProps.toAgentDetails(this.lastAgent)
                                            // AppNavigate.navigateToModule(ev, 'agents', { "tab": "welcome", "agent": this.lastAgent.id, }); 
                                            ev.stopPropagation()
                                          }}>{this.lastAgent.name}</a>
                                      </EuiToolTip>}
                                      titleSize="s"
                                      description="最后注册的代理"
                                      titleColor="primary"
                                      style={{
                                        paddingBottom: 12,
                                        whiteSpace: 'nowrap'
                                      }}
                                    />
                                  </EuiFlexItem>
                                )}
                                {this.mostActiveAgent && (
                                  <EuiFlexItem>
                                    <EuiStat
                                      className={
                                        this.mostActiveAgent.name ? 'euiStatLink' : ''
                                      }
                                      title={
                                        <EuiToolTip
                                        position='top'
                                        content='显示代理详情'>
                                          {/* <a onClick={() =>
                                            this.mostActiveAgent.name
                                              ? this.props.tableProps.showAgent(
                                                  this.mostActiveAgent
                                                )
                                              : ''
                                          }>{this.mostActiveAgent.name || '-'}</a> */}
                                          <a onClick={(ev) => {
                                            if (this.mostActiveAgent.name) {
                                              console.log(this.mostActiveAgent)
                                              this.props.tableProps.toAgentDetails(this.mostActiveAgent)
                                              // AppNavigate.navigateToModule(ev, 'agents', { "tab": "welcome", "agent": this.mostActiveAgent.id, });
                                              ev.stopPropagation()
                                            }
                                          }}>{this.mostActiveAgent.name || '-'}</a>
                                      </EuiToolTip>}
                                      style={{ whiteSpace: 'nowrap' }}
                                      titleSize="s"
                                      description="最活跃的代理"
                                      titleColor="primary"                              
                                    />
                                  </EuiFlexItem>
                                )}
                              </EuiFlexGroup>
                            </EuiFlexItem>
                          </EuiFlexGroup>
                        </EuiPanel>
                      </EuiFlexItem>
                    )}
                    </Fragment>
                    )}
                    {this.state.showAgentsEvolutionVisualization && (
                      <EuiFlexItem className="agents-evolution-visualization" style={{ display: !this.state.loading ? 'block' : 'none', height: !this.state.loading ? '182px' : 0}}>
                        <EuiPanel paddingSize="none" betaBadgeLabel="资产变化" style={{ display: this.props.resultState === 'ready' ? 'block' : 'none'}}>
                          <EuiFlexGroup>
                            <EuiFlexItem>
                            <div style={{height: this.props.resultState === 'ready' ? '180px' : 0}}>
                              <WzReduxProvider>
                                <KibanaVis
                                  visID={'Wazuh-App-Overview-General-Agents-status'}
                                  tab={'general'}
                                />
                              </WzReduxProvider>
                            </div>
                            {this.props.resultState === 'loading' &&
                              (
                              <div style={{ display: 'block', textAlign: "center", padding: 30}}>                        
                                <EuiLoadingChart size="xl" />
                              </div>
                            ) }
                              
                            </EuiFlexItem>
                          </EuiFlexGroup>                  
                        </EuiPanel>
                        <EuiPanel paddingSize="none" betaBadgeLabel="资产变化" style={{ height: 180,  display: this.props.resultState === 'none' ? 'block' : 'none'}}>
                          <EuiEmptyPrompt
                            className="wz-padding-21"
                            iconType="alert"
                            titleSize="xs"
                            title={<h3>在所选择的时间范围内未找到结果</h3>}
                            actions={
                              <WzDatePicker condensed={true} onTimeChange={() => { }} />
                            }
                          />
                        </EuiPanel>
                      </EuiFlexItem>
                      
                    )}
                  </EuiFlexGroup>
                  <EuiSpacer size="m" />
                </div>
              )}
                  <WzReduxProvider>
                    <AgentsTable
                      filters={this.state.agentTableFilters}
                      removeFilters={() => this.removeFilters()}
                      wzReq={this.props.tableProps.wzReq}
                      addingNewAgent={this.props.tableProps.addingNewAgent}
                      downloadCsv={this.props.tableProps.downloadCsv}
                      clickAction={this.props.tableProps.clickAction}
                      toHostFound={this.props.tableProps.toHostFound}
                      toAgentDetails={this.props.tableProps.toAgentDetails}
                      formatUIDate={ date => formatUIDate(date)}
                      reload={() => this.getSummary()}
                    />
                  </WzReduxProvider>
                </EuiFlexItem>
              </EuiPage>
            </div>
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
});

AgentsTable.propTypes = {
  tableProps: PropTypes.object,
  showAgent: PropTypes.func
};
