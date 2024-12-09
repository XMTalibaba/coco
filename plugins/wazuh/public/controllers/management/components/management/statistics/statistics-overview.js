/*
 * Wazuh app - React component for building the reporting view
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
import React, { Component, useState, useEffect } from "react";
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiButtonEmpty,
  EuiPanel,
  EuiTitle,
  EuiPage,
  EuiText,
  EuiCallOut,
  EuiTabs,
  EuiTab,
  EuiSpacer,
  EuiSelect,
  EuiProgress,
  EuiTextColor,
	EuiButtonIcon,
	EuiPopover,
	EuiPopoverTitle,
  EuiButton,
} from "@elastic/eui";

import { clusterNodes } from "../configuration/utils/wz-fetch";
import { WzStatisticsRemoted } from "./statistics-dashboard-remoted";
import { WzStatisticsAnalysisd } from "./statistics-dashboard-analysisd";
import { WzDatePicker } from "../../../../../components/wz-date-picker/wz-date-picker";
import { AppNavigate } from "../../../../../react-services/app-navigate";
import { compose } from 'redux';
import { withGuard, withGlobalBreadcrumb } from "../../../../../components/common/hocs";
import { PromptStatisticsDisabled } from './prompt-statistics-disabled';
import { PromptStatisticsNoIndices } from './prompt-statistics-no-indices';
import { WazuhConfig } from "../../../../../react-services/wazuh-config";
import { WzRequest } from '../../../../../react-services/wz-request';
import { WAZUH_MODULES } from '../../../../../../common/wazuh-modules';

const wzConfig = new WazuhConfig();

export class WzStatisticsOverview extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      isDescPopoverOpen: false,
      selectedTabId: "remoted",
      stats: {},
      isLoading: false,
      loadingNode: false,
      searchvalue: "",
      clusterNodeSelected: 'all',
      refreshVisualizations: Date.now()
    };
    this.tabs = [
      {
        id: "remoted",
        name: "监听器引擎",
      },
      {
        id: "analysisd",
        name: "分析引擎",
      },
    ];

    this.info = {
      remoted:
        "远程统计使用已存在的历史累积数据。",
      analysisd:
        "分析统计：从变量‘analysis.stat_interval’中指示的时间段开始存储的数据。",
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    try {
      const data = await clusterNodes();
      const nodes = data.data.data.affected_items.map((item) => {
        return { value: item.name, text: `${item.name} (${item.type})` };
      });
      nodes.unshift({ value: 'all', text: 'All' })
      this.setState({
        clusterNodes: nodes,
        clusterNodeSelected: nodes[0].value,
      });
    } catch (err) {
      this.setState({
        clusterNodes: [],
        clusterNodeSelected: 'all',
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onSelectedTabChanged = (id) => {
    this.setState(
      {
        selectedTabId: id,
        searchvalue: "",
      }
    );
  };

  renderTabs() {
    return this.tabs.map((tab, index) => (
      <EuiTab
        onClick={() => this.onSelectedTabChanged(tab.id)}
        isSelected={tab.id === this.state.selectedTabId}
        key={index}
      >
        {tab.name}
      </EuiTab>
    ));
  }

  onSelectNode = (e) => {
    const newValue = e.target.value;
    this.setState(
      {
        loadingNode: true
      },
      () => {
        this.setState({ clusterNodeSelected: newValue, loadingNode: false })
      }
    );
  };

  refreshVisualizations = () => {
    this.setState({ refreshVisualizations: Date.now() })
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
                    <span>&nbsp;{WAZUH_MODULES['statisticsOverview'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['statisticsOverview'].description}
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
    const search = {
      box: {
        incremental: true,
        schema: true,
      },
    };
    const title = this.renderTitle();
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
              <EuiPage style={{ background: "transparent" }}>
                <EuiPanel>
                  <EuiFlexGroup alignItems="center">
                    <EuiFlexItem>
                      <EuiFlexGroup alignItems="center">
                        <EuiFlexItem grow={false}>
                          <EuiTitle size="s">
                            <h3>系统统计</h3>
                          </EuiTitle>
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiTextColor color="subdued">{'在这里，您可以查看守护程序统计信息'}</EuiTextColor>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    {!!(
                      this.state.clusterNodes &&
                      this.state.clusterNodes.length &&
                      this.state.clusterNodeSelected
                    ) && (
                        <EuiFlexItem grow={false}>
                          <EuiSelect
                            id="selectNode"
                            options={this.state.clusterNodes}
                            value={this.state.clusterNodeSelected}
                            onChange={this.onSelectNode}
                            aria-label="选择节点"
                          />
                        </EuiFlexItem>
                      )}
                    <EuiFlexItem grow={false}>
                      <WzDatePicker condensed={true} onTimeChange={() => { }} />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      {/* <EuiButtonEmpty
                        iconType="refresh"
                        onClick={this.refreshVisualizations}
                      >
                        刷新
                      </EuiButtonEmpty> */}
                      <EuiButton
                        size="s"
                        onClick={this.refreshVisualizations}
                      >
                        刷新
                      </EuiButton>
                    </EuiFlexItem>
                    {/* <EuiFlexItem grow={false}>
                      <EuiButtonEmpty
                        onMouseDown={e => AppNavigate.navigateToModule(e, 'settings', { tab: 'configuration', category: 'statistics' })}
                        iconType="gear"
                        iconSide="left" >
                        设置
                      </EuiButtonEmpty>
                    </EuiFlexItem> */}
                  </EuiFlexGroup>
                  {/* <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiText color="subdued">
                        在这里，您可以查看守护程序统计信息。
                      </EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup> */}
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiTabs>{this.renderTabs()}</EuiTabs>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiSpacer size={"m"} />
                  {(
                    <>
                      {this.state.selectedTabId === "remoted" && !this.state.loadingNode && (
                        <div>
                          <EuiSpacer size={"m"} />
                          <EuiCallOut
                            title={this.info[this.state.selectedTabId]}
                            iconType="iInCircle"
                          />
                          <EuiSpacer size={"m"} />
                          <WzStatisticsRemoted clusterNodeSelected={this.state.clusterNodeSelected} refreshVisualizations={this.state.refreshVisualizations}/>
                        </div>
                      )}
                      {this.state.selectedTabId === "analysisd" && !this.state.loadingNode && (
                        <div>
                          <EuiSpacer size={"m"} />
                          <EuiCallOut
                            title={this.info[this.state.selectedTabId]}
                            iconType="iInCircle"
                          />
                          <EuiSpacer size={"m"} />
                          <WzStatisticsAnalysisd clusterNodeSelected={this.state.clusterNodeSelected} refreshVisualizations={this.state.refreshVisualizations}/>
                        </div>
                      )}
                    </>
                  )}
                </EuiPanel>
              </EuiPage>
            </div>
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

export default compose(
  withGlobalBreadcrumb([
    { text: '' },
    { text: '系统管理' },
    // { text: '策略管理', href: '/app/wazuh#/manager' },
    { text: '系统统计' }
  ]),
  withGuard(props => {
    return !((wzConfig.getConfig() || {})['cron.statistics.status']); // if 'cron.statistics.status' is false, then it renders PromptStatisticsDisabled component
  }, PromptStatisticsDisabled)
)(
  props => {
    const [loading, setLoading] = useState(false);
    const [existStatisticsIndices, setExistStatisticsIndices] = useState(false);
    useEffect(() => {
      const fetchData = async () => {
        try{
          setLoading(true);
          const data = await WzRequest.genericReq('GET', '/elastic/statistics');
          setExistStatisticsIndices(data.data);
        }catch(error){}
        setLoading(false);
      };
  
      fetchData();
    }, []);
    if(loading){
      return <EuiProgress size="xs" color="primary" />
    }
    return existStatisticsIndices ? <WzStatisticsOverview {...props}/> : <PromptStatisticsNoIndices {...props}/>
  }
);
