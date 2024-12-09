/*
 * Wazuh app - React component for show configuration of client-buffer.
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

import { EuiBasicTable } from '@elastic/eui';

import WzNoConfig from '../util-components/no-config';
import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzConfigurationSettingsHeader from '../util-components/configuration-settings-header';
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';

import {
  isString,
  renderValueOrDefault,
  renderValueOrNoValue
} from '../utils/utils';
import withWzConfig from '../util-hocs/wz-config';

const helpLinks = [
  {
    text: '检查与管理器的连接',
    href:
      'https://documentation.wazuh.com/current/user-manual/agents/agent-connection.html'
  },
  {
    text: '客户参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/client.html'
  }
];

const mainSettings = [
  { field: 'crypto_method', label: '用于加密通信的方法' },
  { field: 'remote_conf', label: '启用远程配置' },
  {
    field: 'auto_restart',
    label:
      '当从管理器接收到有效配置时，自动重启代理'
  },
  {
    field: 'notify_time',
    label: '从代理检查到管理器的时间(秒)'
  },
  {
    field: 'time-reconnect',
    label: '尝试重新连接之前的时间(秒)'
  },
  { field: 'config-profile', label: '配置概况' },
  {
    field: 'local_ip',
    label: '当代理有多个网络接口时使用的IP地址'
  }
];

const columns = [
  { field: 'address', name: '地址', render: renderValueOrNoValue },
  { field: 'port', name: '端口', render: renderValueOrDefault('1514') },
  { field: 'protocol', name: '协议', render: renderValueOrDefault('udp') },
  { field: 'max_retries', name: '连接重试的最大次数', render: renderValueOrNoValue },
  { field: 'retry_interval', name: '连接的重试间隔', render: renderValueOrNoValue },
];

class WzConfigurationClient extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig } = this.props;
    return (
      <Fragment>
        {currentConfig['agent-client'] &&
          isString(currentConfig['agent-client']) && (
            <WzNoConfig
              error={currentConfig['agent-client']}
              help={helpLinks}
            />
          )}
        {currentConfig['agent-client'] &&
          !isString(currentConfig['agent-client']) && (
            <WzConfigurationSettingsTabSelector
              title="主要设置"
              description="基本管理器-代理通信设置"
              currentConfig={currentConfig}
              minusHeight={355}
              helpLinks={helpLinks}
            >
              <WzConfigurationSettingsGroup
                config={currentConfig['agent-client'].client}
                items={mainSettings}
              />
              {currentConfig['agent-client'].client.server.length && (
                <Fragment>
                  <WzConfigurationSettingsHeader
                    title="服务器设置"
                    description="要连接的管理器列表"
                  />
                  <EuiBasicTable
                    items={currentConfig['agent-client'].client.server}
                    columns={columns}
                    noItemsMessage="无数据"
                  />
                </Fragment>
              )}
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

const sections = [{ component: 'agent', configuration: 'client' }];

WzConfigurationClient.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default withWzConfig(sections)(WzConfigurationClient);
