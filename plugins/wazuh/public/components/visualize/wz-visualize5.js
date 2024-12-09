/*
 * Wazuh app - React component for Visualize.
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

import { visualizations } from './visualizations';
import { agentVisualizations } from './agent-visualizations';
import KibanaVis from '../../kibana-integrations/kibana-vis';
import {
  EuiPage,
  EuiFlexGroup,
  EuiPanel,
  EuiFlexItem,
  EuiButton,
  EuiButtonIcon,
  EuiDescriptionList,
  EuiCallOut,
  EuiSelect,
  EuiSwitch,
  EuiSpacer,
  EuiPageBody,
  EuiTitle,
  EuiProgress,
  EuiButtonEmpty,
  EuiBasicTable,
  EuiPopover,
  EuiPopoverTitle,
  EuiText
} from '@elastic/eui';
import WzReduxProvider from '../../redux/wz-redux-provider';
import { WazuhConfig } from '../../react-services/wazuh-config';
import { formatUIDate } from '../../react-services/time-service';
import { WzRequest } from '../../react-services/wz-request';
import { CommonData } from '../../services/common-data';
import { VisHandlers } from '../../factories/vis-handlers';
import { RawVisualizations } from '../../factories/raw-visualizations';
import { Metrics } from '../overview/metrics/metrics';
import { PatternHandler } from '../../react-services/pattern-handler';
import { getToasts } from '../../kibana-services';
import { SecurityAlerts } from './components';
import { toMountPoint } from '../../../../../src/plugins/kibana_react/public';

const visHandler = new VisHandlers();
const securituAlertsTabs = ['general', 'systemCommands',
'webAttack', 'bruteForce', 'fim', 'logToClear', 'reboundShell', 'localAskRight', 'dataTheft',
'blackmailVirus', 'riskPort', 'pm', 'vuls', 'accountChange', 'accountUnusual', 'accountLogin', 'zombies', 'hiddenProcess',
'riskService', 'virusFound', 'systemCommandVerify'];

export class WzVisualize extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      visualizations: !!props.isAgent ? agentVisualizations : visualizations,
      expandedVis: false,
      thereAreSampleAlerts: false,
      hasRefreshedKnownFields: false,
      refreshingKnownFields: [],
      affected_items: [
        {
          timestamp: "2023-11-29T10:18:48+00:00",
          Agent: "002",
          AgentModal: "LAPTOP-9JE83I8E",
          Virus:'CanmAV:found Unix:Trojan.gENERIC-9919438-0',
          SourceName: "scheduled.tsx ",
          Leave:'center'
        },
        {
          timestamp: "2023-11-29T10:18:48+00:00",
          Agent: "002",
          AgentModal: "LAPTOP-9JE83I8E",
          Virus:'CanmAV:found Unix:Trojan.gENERIC-9919438-0',
          SourceName: "scheduled.tsx ",
          Leave:'center'
        },
        {
          timestamp: "2023-11-29T10:18:48+00:00",
          Agent: "002",
          AgentModal: "LAPTOP-9JE83I8E",
          Virus:'CanmAV:found Unix:Trojan.gENERIC-9919438-0',
          SourceName: "scheduled.tsx ",
          Leave:'center'
        }],
      refreshingIndex: true
    };
    this.metricValues = false;
    this.rawVisualizations = new RawVisualizations();
    this.wzReq = WzRequest;
    
    const wazuhConfig = new WazuhConfig();
    this.commonData = new CommonData();
    const configuration = wazuhConfig.getConfig();
    this.monitoringEnabled = !!(configuration || {})[
      'wazuh.monitoring.enabled'
    ];
    this.newFields={};
  }


  showToast(color, title = '', text = '', time = 3000) {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time,
    });
  };

  async componentDidMount() {
    
  }

  async componentDidUpdate(prevProps) {
    // if (prevProps.isAgent !== this.props.isAgent) {
    //   this._isMount &&
    //     this.setState({ visualizations: !!this.props.isAgent ? agentVisualizations : visualizations });
    //   typeof prevProps.isAgent !== 'undefined' && visHandler.removeAll();
    // }
  }
  logsTable() {
    const {
      affected_items
    } = this.state;
    const columns = [
      {
        field: 'timestamp',
        name: 'timestamp',
        render: timestamp => (<span>{formatUIDate(timestamp)}</span>),
      },
      {
        field: 'Agent',
        name: 'Agent',
      },
      {
        field: 'AgentModal',
        name: 'AgentModal',
      },
      {
        field: 'Virus',
        name: 'Virus',
      },
      {
        field: 'SourceName',
        name: 'SourceName',
      },
      {
        field: 'Leave',
        name: 'Leave',
      }
     
     
    ];
    return (
      <div>
        {(this.state.affected_items && (
          <Fragment>
            <div className='code-block-log-viewer-container' style={{ height: this.height, overflowY: 'auto' }}>
              <EuiBasicTable
                items={this.state.affected_items}
                columns={columns}
                noItemsMessage="未找到数据"
              />
            </div>
            <EuiSpacer size="m" />
            <EuiFlexGroup justifyContent='center'>
                <EuiFlexItem grow={false} style={{ marginTop: 0, marginBottom: 0 }}>
                  <EuiButtonEmpty
                    iconType='refresh'
                    isLoading={this.state.loadingLogs}
                    isDisabled={this.state.loadingLogs}
                    onClick={!this.state.loadingLogs ? () => this.loadExtraLogs() : undefined}
                  >
                    更多日志
                  </EuiButtonEmpty>
                </EuiFlexItem>
              </EuiFlexGroup>
          </Fragment>
        )) || (
            <EuiCallOut
              color="warning"
              title="没有符合您的搜索标准的结果。"
              iconType="alert"
            ></EuiCallOut>
          )}
      </div>
    );
  }
  componentWillUnmount() {
    // this._isMount = false;
  }

  expand = id => {
    this.setState({ expandedVis: this.state.expandedVis === id ? false : id });
  };

  refreshKnownFields = async ( newField = null ) => {
    if(newField && newField.name){
      this.newFields[newField.name] = newField;
    }
    if (!this.state.hasRefreshedKnownFields) { // Known fields are refreshed only once per dashboard loading
      try {
        this.setState({ hasRefreshedKnownFields: true, isRefreshing: true });
        await PatternHandler.refreshIndexPattern(this.newFields);
        this.setState({ isRefreshing: false });
        this.reloadToast();
        this.newFields={};
      } catch (err) {
        this.setState({ isRefreshing: false });
        this.showToast('danger', '无法刷新索引模式');

      }
    } else if (this.state.isRefreshing) {
      await new Promise(r => setTimeout(r, 150));
      await this.refreshKnownFields();
    }
  }
  reloadToast = () => {
    getToasts().add({
      color: 'success',
      title: '成功刷新索引模式。',
      text: toMountPoint(<EuiFlexGroup justifyContent="flexEnd" gutterSize="s">
        <EuiFlexItem grow={false}>
          当前索引模式有一些未知字段。
          您需要刷新页面以应用更改。
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton onClick={() => window.location.reload()} size="s">重新加载页面</EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>)
    })
  }
  render() {
    const { visualizations } = this.state;
    const { selectedTab } = this.props;
    const renderVisualizations = vis => {
      return (
        <EuiFlexItem
          grow={parseInt((vis.width || 10) / 10)}
          key={vis.id}
          style={{ maxWidth: vis.width + '%', margin: 0, padding: 12 }}
        >
          <EuiPanel
            paddingSize="none"
            className={
              this.state.expandedVis === vis.id ? 'fullscreen h-100' : 'h-100'
            }
          >
            <EuiFlexItem className="h-100">
              <EuiFlexGroup
                style={{ padding: '12px 12px 0px' }}
                className="embPanel__header"
              >
                <h2 className="embPanel__title wz-headline-title">
                  {vis.title}
                </h2>
                <EuiButtonIcon
                  color="text"
                  style={{ padding: '0px 6px', height: 30 }}
                  onClick={() => this.expand(vis.id)}
                  iconType="expand"
                  aria-label="展开"
                />
              </EuiFlexGroup>
              <div style={{ height: '100%' }}>
                {(vis.id !== 'Wazuh-App-Overview-General-Agents-status' ||
                  (vis.id === 'Wazuh-App-Overview-General-Agents-status' &&
                    this.monitoringEnabled)) && (
                    <WzReduxProvider>
                      <KibanaVis
                        refreshKnownFields={this.refreshKnownFields}
                        visID={vis.id}
                        tab={selectedTab}
                        {...this.props}
                      ></KibanaVis>
                    </WzReduxProvider>
                  )}
                {vis.id === 'Wazuh-App-Overview-General-Agents-status' &&
                  !this.monitoringEnabled && (
                    <EuiPage style={{ background: 'transparent' }}>
                      <EuiDescriptionList
                        type="column"
                        listItems={this.agentsStatus}
                        style={{ maxWidth: '400px' }}
                      />
                    </EuiPage>
                  )}
              </div>
            </EuiFlexItem>
          </EuiPanel>
        </EuiFlexItem>
      );
    };

    const renderVisualizationRow = (rows, width, idx) => {
      return (
        <EuiFlexItem
          grow={(width || 10) / 10}
          key={idx}
          style={{ maxWidth: width + '%', margin: 0, padding: 12 }}
        >
          {rows.map((visRow, j) => {
            return (
              <EuiFlexGroup
                key={j}
                style={{
                  height: visRow.height || 0 + 'px',
                  marginBottom: visRow.noMargin ? '' : '4px'
                }}
              >
                {visRow.vis.map(visualizeRow => {
                  return renderVisualizations(visualizeRow);
                })}
              </EuiFlexGroup>
            );
          })}
        </EuiFlexItem>
      );
    };

    return (
      <Fragment>
        {/* Sample alerts Callout */}
        {selectedTab === 'systemCommands' && (
          <EuiCallOut title='请注意: 使用该功能，需要按步骤执行以下指令' color='warning' iconType='alert' style={{ margin: '0 8px 16px 8px' }}>
            <h4>1) 在被管控主机开启audit功能</h4>
            <p style={{textIndent: '2rem', fontWeight: '600', marginBottom: '0.4rem'}}>ubuntu安装(centos不需要安装): <span style={{fontWeight: 'normal'}}>sudo apt-get install auditd</span></p>
            <p style={{textIndent: '2rem', fontWeight: '600', marginBottom: '0.4rem'}}>启用audit服务: <span style={{fontWeight: 'normal'}}>service auditd start 或 systemctl start auditd</span></p>
            <h4 style={{marginTop: '0'}}>2) 修改规则: <span style={{fontWeight: 'normal'}}>echo "-a exit,always -S execve -k audit-wazuh-c" >> /etc/audit/rules.d/audit.rules</span></h4>
            <h4 style={{marginTop: '0'}}>3) 重启规则: <span style={{fontWeight: 'normal'}}>auditctl -R /etc/audit/rules.d/audit.rules</span></h4>
            <h4 style={{marginTop: '0'}}>4) 在资产管理-主机管理页面，重启对应主机</h4>
          </EuiCallOut>
        )}
        {selectedTab === 'logToClear' && (
          <EuiCallOut title='请注意' color='warning' iconType='alert' style={{ margin: '0 8px 16px 8px' }}>
            <p>日志清除默认检测时间为12小时，且服务关闭时的日志删除行为不会被记录。</p>
          </EuiCallOut>
        )}
        {/* {this.state.thereAreSampleAlerts && this.props.resultState === 'ready' && (
          <EuiCallOut title='该仪表板包含样本数据' color='warning' iconType='alert' style={{ margin: '0 8px 16px 8px' }}>
            <p>显示的数据可能包含样本警报。 点击 <EuiLink href='#/settings?tab=sample_data' aria-label='配置样本数据'>这里</EuiLink> 去配置样本数据。
            </p>
          </EuiCallOut>
        )} */}

        {/* {this.props.resultState === 'none' && (
          <div className="wz-margin-top-10 wz-margin-right-8 wz-margin-left-8">
            <EuiCallOut title="所选时间范围没有结果。试试另一个。" color="warning" iconType='help'></EuiCallOut>
          </div>
        )} */}
        <EuiFlexItem className={this.props.resultState === 'none' && 'no-opacity' || ''}>
          {this.props.resultState === 'ready' &&
            < Metrics section={selectedTab} resultState={this.props.resultState} />}

          {selectedTab &&
            selectedTab !== 'welcome' &&
            visualizations[selectedTab] &&
            visualizations[selectedTab].rows.map((row, i) => {
              return (
                <EuiFlexGroup
                  key={i}
                  style={{
                    display: row.hide && 'none',
                    height: row.height || 0 + 'px',
                    margin: 0,
                    maxWidth: '100%'
                  }}
                >
                  {row.vis.map((vis, n) => {
                    return !vis.hasRows
                      ? renderVisualizations(vis)
                      : renderVisualizationRow(vis.rows, vis.width, n);
                  })}
                </EuiFlexGroup>
              );
            })}
        </EuiFlexItem>
        <EuiFlexGroup style={{ margin: 0 }}>
          <EuiFlexItem>
            {/* {(securituAlertsTabs.indexOf(this.props.selectedTab) !== -1) && this.props.resultState !== "none" && */}
            {(securituAlertsTabs.indexOf(this.props.selectedTab) !== -1) && 

              <EuiPanel
                paddingSize="none"
                className={
                  this.state.expandedVis === 'security-alerts' ? 'fullscreen h-100 wz-overflow-y-auto wz-overflow-x-hidden' : 'h-100'
                }
              >
                <EuiFlexItem className="h-100" style={{ marginBottom: 12 }}>
                  <EuiFlexGroup
                    style={{ padding: '12px 12px 0px' }}
                    className="embPanel__header"
                  >
                    <h2 className="embPanel__title wz-headline-title" style={{marginBottom:'20px'}}>
                    security alerts
                    </h2>
                    <EuiButtonIcon
                      color="text"
                      style={{ padding: '0px 6px', height: 30 }}
                      onClick={() => this.expand('security-alerts')}
                      iconType="expand"
                      aria-label="expand"
                    />
                  </EuiFlexGroup>

                  {(this.logsTable()) || (
                      <EuiFlexGroup alignItems="center" justifyContent="center">
                        <EuiFlexItem>
                          <EuiSpacer></EuiSpacer>
                          <EuiProgress size="xs" color="primary" />
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    )}
                </EuiFlexItem>
              </EuiPanel>
            }
          </EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    );
  }
}
