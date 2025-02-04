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
import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiIcon
} from '@elastic/eui';
import { formatUIDate } from '../../../../../react-services/time-service';
import { connect } from 'react-redux';

export class WzStatusAgentInfo extends Component {
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
    const { agentInfo } = this.props.state;
    const status = agentInfo.status;
    let operatingSystem = false;
    if (status !== 'never_connected' && agentInfo.os) {
      operatingSystem = agentInfo.os.name
        ? agentInfo.os.name + agentInfo.os.version
        : agentInfo.os.uname
        ? agentInfo.os.uname
        : '-';
    }

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
                  <h2>最后注册的代理</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>名称</EuiFlexItem>
          <EuiFlexItem style={greyStyle}>{agentInfo.name}</EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>ID</EuiFlexItem>
          <EuiFlexItem style={greyStyle}>{agentInfo.id}</EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>状态</EuiFlexItem>
          <EuiFlexItem style={greyStyle}>{agentInfo.status}</EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>IP地址</EuiFlexItem>
          <EuiFlexItem style={greyStyle}>{agentInfo.ip}</EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>添加时间</EuiFlexItem>
          <EuiFlexItem style={greyStyle}>{formatUIDate(agentInfo.dateAdd)}</EuiFlexItem>
        </EuiFlexGroup>
        {status !== 'never_connected' && (
          <div>
            <EuiFlexGroup>
              <EuiFlexItem>版本</EuiFlexItem>
              <EuiFlexItem style={greyStyle}>{agentInfo.version || '-'}</EuiFlexItem>
            </EuiFlexGroup>
            <EuiFlexGroup>
              <EuiFlexItem>最后连接</EuiFlexItem>
              <EuiFlexItem style={greyStyle}>
                {formatUIDate(agentInfo.lastKeepAlive)}
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiFlexGroup>
              <EuiFlexItem>操作系统</EuiFlexItem>
              <EuiFlexItem style={greyStyle}>
                {operatingSystem || '-'}
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        )}
      </EuiPanel>
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.statusReducers
  };
};

export default connect(mapStateToProps)(WzStatusAgentInfo);
