/*
 * Wazuh app - React component for show configuration of log collection - sockets tab.
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

import WzNoConfig from '../util-components/no-config';
import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzConfigurationListSelector from '../util-components/configuration-settings-list-selector';
import {
  isString,
  isArray,
  renderValueOrDefault,
  renderValueOrNoValue
} from '../utils/utils';
import { settingsListBuilder } from '../utils/builders';

const helpLinks = [
  {
    text: '使用多个输出',
    href:
      'https://documentation.wazuh.com/current/user-manual/capabilities/log-data-collection/log-data-configuration.html#using-multiple-outputs'
  },
  {
    text: 'Socket参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/socket.html'
  }
];

const mainSettings = [
  { field: 'name', label: 'Socket名称', render: renderValueOrNoValue },
  { field: 'location', label: 'Socket地址', render: renderValueOrNoValue },
  {
    field: 'mode',
    label: 'UNIX socket协议',
    render: renderValueOrDefault('udp')
  },
  {
    field: 'prefix',
    label: '前缀放在消息之前',
    render: renderValueOrNoValue
  }
];

class WzConfigurationLogCollectionSockets extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig } = this.props;
    const items = isArray(currentConfig['logcollector-socket'].target)
      ? settingsListBuilder(currentConfig['logcollector-socket'].target, 'name')
      : [];
    return (
      <Fragment>
        {currentConfig['logcollector-socket'] &&
          isString(currentConfig['logcollector-socket']) && (
            <WzNoConfig
              error={currentConfig['logcollector-socket']}
              help={helpLinks}
            />
          )}
        {currentConfig['logcollector-socket'] &&
        !isString(currentConfig['logcollector-socket']) &&
        !currentConfig['logcollector-socket'].target ? (
          <WzNoConfig error="not-present" help={helpLinks} />
        ) : null}
        {currentConfig['logcollector-socket'] &&
        !isString(currentConfig['logcollector-socket']) &&
        currentConfig['logcollector-socket'].target &&
        currentConfig['logcollector-socket'].target.length ? (
          <WzConfigurationSettingsTabSelector
            title="socket输出"
            description="定义自定义输出以发送日志数据"
            currentConfig={currentConfig}
            minusHeight={this.props.agent.id === '000' ? 320 : 415}
            helpLinks={helpLinks}
          >
            <WzConfigurationListSelector
              items={items}
              settings={mainSettings}
            />
          </WzConfigurationSettingsTabSelector>
        ) : null}
      </Fragment>
    );
  }
}

WzConfigurationLogCollectionSockets.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default WzConfigurationLogCollectionSockets;
