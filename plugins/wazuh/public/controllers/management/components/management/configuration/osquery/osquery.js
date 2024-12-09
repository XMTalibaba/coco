/*
 * Wazuh app - React component for show configuration of Osquery.
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

import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import withWzConfig from '../util-hocs/wz-config';
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import WzNoConfig from '../util-components/no-config';
import WzConfigurationSettingsHeader from '../util-components/configuration-settings-header';
import { isString, isArray, renderValueNoThenEnabled } from '../utils/utils';
import { wodleBuilder } from '../utils/builders';

const mainSettings = [
  {
    field: 'disabled',
    label: 'Osquery集成状态',
    render: renderValueNoThenEnabled
  },
  { field: 'run_daemon', label: '自动运行Osquery守护进程' },
  { field: 'bin_path', label: 'Osquery可执行文件的路径' },
  { field: 'log_path', label: 'Osquery结果日志文件的路径' },
  { field: 'config_path', label: 'Osquery配置文件的路径' },
  { field: 'add_labels', label: '使用已定义的标签作为装饰器' }
];

const helpLinks = [
  {
    text: 'Osquery模块文档',
    href:
      'https://documentation.wazuh.com/current/user-manual/capabilities/osquery.html'
  },
  {
    text: 'Osquery模块引用',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/wodle-osquery.html'
  }
];

const columns = [
  { field: 'name', name: 'Name' },
  { field: 'path', name: 'Path' }
];

class WzConfigurationOsquery extends Component {
  constructor(props) {
    super(props);
    this.wodleConfig = wodleBuilder(this.props.currentConfig, 'osquery');
  }
  componentDidMount() {
    this.props.updateBadge(this.badgeEnabled());
  }
  badgeEnabled() {
    return (
      this.wodleConfig &&
      this.wodleConfig.osquery &&
      this.wodleConfig.osquery.disabled === 'no'
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
          !this.wodleConfig.osquery &&
          !isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {currentConfig && this.wodleConfig && this.wodleConfig.osquery && (
          <WzConfigurationSettingsTabSelector
            title="主要设置"
            description="一般的Osquery集成设置"
            currentConfig={this.wodleConfig}
            minusHeight={this.props.agent.id === '000' ? 260 : 355}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={this.wodleConfig.osquery}
              items={mainSettings}
              ks
            />
            {this.wodleConfig.osquery.packs &&
              isArray(this.wodleConfig.osquery.packs) &&
              this.wodleConfig.osquery.packs.length && (
                <Fragment>
                  <WzConfigurationSettingsHeader
                    title="Osquery包"
                    description="一个包包含多个查询，可以快速检索系统信息"
                  />
                  <EuiBasicTable
                    items={this.wodleConfig.osquery.packs}
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

const sections = [{ component: 'wmodules', configuration: 'wmodules' }];

WzConfigurationOsquery.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default withWzConfig(sections)(WzConfigurationOsquery);
