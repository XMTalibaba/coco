/*
 * Wazuh app - React component for building the status view
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
import { EuiFlexGroup, EuiIcon, EuiText, EuiPage } from '@elastic/eui';

import { connect } from 'react-redux';

export class WzStatusDaemons extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { listDaemons } = this.props.state;

    const textStyle = {
      marginLeft: '4px'
    };
    
    const daemonOptions = {
      'ossec-analysisd': '分析进程',
      'ossec-authd': ' 认证进程',
      'ossec-execd': '指令执行进程',
      'ossec-integratord': '第三方平台集成进程',
      'ossec-logcollector': '日志收集进程',
      'ossec-maild': '告警邮件通知进程',
      'ossec-monitord': '监控进程',
      'ossec-remoted': '服务器通信进程',
      'ossec-syscheckd': '系统检查进程',
      'wazuh-apid': 'web接口进程',
      'wazuh-clusterd': '集群进程',
      'wazuh-db': '数据库进程',
      'wazuh-modulesd': '模块管理进程'
    }
    let list = listDaemons.filter(k => Object.keys(daemonOptions).indexOf(k.key) !== -1);

    return (
      <EuiPage style={{ background: 'transparent' }}>
        <EuiFlexGroup wrap responsive={true}>
          <div className="daemons-card">
            {list.map(daemon => (
              <div className="daemon-label" key={daemon.key}>
                <EuiText>
                  {(daemon.value === 'running' && (
                    <EuiIcon type="dot" color="#00a69b" size="m" />
                  )) || <EuiIcon type="dot" color="#ff645c" size="m" />}
                  <span style={textStyle}>{daemonOptions[daemon.key]}</span>
                </EuiText>
              </div>
            ))}
          </div>
        </EuiFlexGroup>
      </EuiPage>
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.statusReducers
  };
};

export default connect(mapStateToProps)(WzStatusDaemons);
