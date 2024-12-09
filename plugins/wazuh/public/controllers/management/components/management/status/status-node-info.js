/*
 * Wazuh app - React component for building the status stats
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
import React, { Component } from 'react';
import { EuiPanel, EuiFlexGroup, EuiFlexItem, EuiTitle } from '@elastic/eui';
import { formatUIDate } from '../../../../../react-services/time-service';
import { connect } from 'react-redux';

export class WzStatusNodeInfo extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { stats, nodeInfo, selectedNode, clusterEnabled } = this.props.state;
    const agentsNodeCount = clusterEnabled ? (stats.agentsCount.find(node => node.node_name === selectedNode) || {}).count || 0 : stats.agentsCountTotal;
    const title = selectedNode
      ? selectedNode + '信息'
      : '管理器信息';

    const greyStyle = {
      color: 'grey'
    };

    return (
      <EuiPanel>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size="m">
                  <h2>{title}</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>版本</EuiFlexItem>
          <EuiFlexItem style={greyStyle}>{nodeInfo.version}</EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>编译日期</EuiFlexItem>
          <EuiFlexItem style={greyStyle}>
            {formatUIDate(nodeInfo.compilation_date)}
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>安装路径</EuiFlexItem>
          <EuiFlexItem style={greyStyle}>{nodeInfo.path}</EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>安装方式</EuiFlexItem>
          <EuiFlexItem style={greyStyle}>{nodeInfo.type}</EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>代理</EuiFlexItem>
          <EuiFlexItem style={greyStyle}>{agentsNodeCount}</EuiFlexItem>
        </EuiFlexGroup>
      </EuiPanel>
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.statusReducers
  };
};

export default connect(mapStateToProps)(WzStatusNodeInfo);
