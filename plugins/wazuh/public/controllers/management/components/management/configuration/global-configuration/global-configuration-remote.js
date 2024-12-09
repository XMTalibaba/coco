/*
 * Wazuh app - React component for show configuration of global configuration - remote tab.
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

import { EuiBasicTable, EuiSpacer } from '@elastic/eui';

import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzNoConfig from '../util-components/no-config';
import {
  isString,
  renderValueOrNoValue,
  renderValueOrDefault
} from '../utils/utils';

const renderAllowedDeniedIPs = (items, label) => {
  if (items) {
    return (
      <ul>
        {items.map((item, key) => (
          <li key={`remote-${label}-${key}`}>{item}</li>
        ))}
      </ul>
    );
  } else {
    return '-';
  }
};

const helpLinks = [
  {
    text: '远程守护进程参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/daemons/ossec-remoted.html'
  },
  {
    text: '远程配置参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/remote.html'
  }
];

class WzConfigurationGlobalConfigurationRemote extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      { field: 'connection', name: '连接', render: renderValueOrNoValue },
      { field: 'port', name: '端口', render: renderValueOrNoValue },
      {
        field: 'protocol',
        name: '协议',
        render: renderValueOrDefault('udp')
      },
      { field: 'ipv6', name: 'IPv6', render: renderValueOrNoValue },
      {
        field: 'allowed-ips',
        name: '允许的IP',
        render: item => renderAllowedDeniedIPs(item, 'allowed')
      },
      {
        field: 'denied-ips',
        name: '拒绝的IP',
        render: item => renderAllowedDeniedIPs(item, 'denied')
      },
      {
        field: 'local_ip',
        name: '本地的IP',
        render: renderValueOrDefault('All interfaces')
      },
      {
        field: 'queue_size',
        name: '队列的大小',
        render: renderValueOrDefault('16384')
      }
    ];
  }
  render() {
    const { currentConfig } = this.props;
    return (
      <Fragment>
        {currentConfig['request-remote'] &&
          isString(currentConfig['request-remote']) && (
            <WzNoConfig
              error={currentConfig['request-remote']}
              help={helpLinks}
            />
          )}
        {currentConfig['request-remote'] &&
          !isString(currentConfig['request-remote']) &&
          !currentConfig['request-remote'].remote && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {currentConfig['request-remote'] &&
          currentConfig['request-remote'].remote && (
            <WzConfigurationSettingsTabSelector
              title="远程设置"
              description="用于侦听来自代理或syslog客户机的事件的配置"
              minusHeight={320}
              currentConfig={currentConfig}
              helpLinks={helpLinks}
            >
              <EuiSpacer size="s" />
              <EuiBasicTable
                columns={this.columns}
                items={currentConfig['request-remote'].remote}
                noItemsMessage="无数据"
              />
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

WzConfigurationGlobalConfigurationRemote.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default WzConfigurationGlobalConfigurationRemote;
