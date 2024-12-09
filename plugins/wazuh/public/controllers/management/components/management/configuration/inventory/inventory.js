/*
 * Wazuh app - React component for show configuration of inventory.
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
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import withWzConfig from '../util-hocs/wz-config';
import { isString, renderValueNoThenEnabled } from '../utils/utils';
import { wodleBuilder } from '../utils/builders';

const mainSettings = [
  {
    field: 'disabled',
    label: 'Syscollector集成状态',
    render: renderValueNoThenEnabled
  },
  { field: 'interval', label: '系统扫描之间的间隔' },
  { field: 'scan-on-start', label: '开始扫描' }
];

const scanSettings = [
  { field: 'hardware', label: '扫描硬件信息' },
  { field: 'processes', label: '扫描当前进程' },
  { field: 'os', label: '扫描操作系统信息' },
  { field: 'packages', label: '扫描已安装的软件包' },
  { field: 'network', label: '扫描网络接口' },
  { field: 'ports', label: '扫描监听网络端口' },
  { field: 'ports_all', label: '扫描所有网络端口' }
];

const helpLinks = [
  {
    text: 'Syscollector模块文档',
    href:
      'https://documentation.wazuh.com/current/user-manual/capabilities/syscollector.html'
  },
  {
    text: 'Syscollector模块参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/wodle-syscollector.html'
  }
];

class WzConfigurationInventory extends Component {
  constructor(props) {
    super(props);
    this.wodleConfig = wodleBuilder(this.props.currentConfig, 'syscollector');
  }
  componentDidMount() {
    this.props.updateBadge(this.badgeEnabled());
  }
  badgeEnabled() {
    return (
      this.wodleConfig &&
      this.wodleConfig.syscollector &&
      this.wodleConfig.syscollector.disabled === 'no'
    );
  }
  render() {
    const { currentConfig } = this.props;
    return (
      <Fragment>
        {currentConfig['wmodules-wmodules'] &&
          isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig
              error={currentConfig['wmodules-wmodules']}
              help={helpLinks}
            />
          )}
        {currentConfig &&
          !this.wodleConfig.syscollector &&
          !isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {currentConfig && this.wodleConfig && this.wodleConfig.syscollector && (
          <WzConfigurationSettingsTabSelector
            title="主要设置"
            description="常规设置应用于所有扫描"
            currentConfig={this.wodleConfig}
            minusHeight={this.props.agent.id === '000' ? 260 : 355}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={this.wodleConfig.syscollector}
              items={mainSettings}
            />
            <WzConfigurationSettingsGroup
              title="扫描设置"
              description="收集特定库的扫描"
              config={this.wodleConfig.syscollector}
              items={scanSettings}
            />
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    );
  }
}

const sections = [{ component: 'wmodules', configuration: 'wmodules' }];

WzConfigurationInventory.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default withWzConfig(sections)(WzConfigurationInventory);
