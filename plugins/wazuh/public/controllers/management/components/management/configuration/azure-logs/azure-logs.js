/*
 * Wazuh app - React component for show configuration of Azure logs.
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

import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import WzNoConfig from '../util-components/no-config';
import withWzConfig from '../util-hocs/wz-config';
import { isString, renderValueNoThenEnabled } from '../utils/utils';
import { wodleBuilder } from '../utils/builders';

const helpLinks = [
  {
    text: '使用应用程序监视Azure',
    href: 'https://documentation.wazuh.com/current/azure/index.html'
  },
  {
    text: 'Azure参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/wodle-azure-logs.html'
  }
];

const mainSettings = [
  { field: 'disabled', label: '启用', render: renderValueNoThenEnabled },
  { field: 'timeout', label: '每次评估的超时' },
  { field: 'day', label: '每个月的哪天运行azure日志' },
  { field: 'wday', label: '每周的哪天运行azure日志' },
  { field: 'time', label: '每天的哪个时间运行azure日志' },
  { field: 'interval', label: 'Azure日志执行之间的间隔' },
  {
    field: 'run_on_start',
    label: '服务启动后立即运行评估'
  }
];

const contentSettings = [
  { field: 'application_id', label: '应用id' },
  { field: 'tag', label: 'Tag' },
  { field: 'tenantdomain', label: '租户域' },
  { field: 'application_key', label: '应用密钥' },
  { field: 'account_name', label: '账号名称' },
  { field: 'account_key', label: '账号密钥' },
  {
    field: 'auth_path',
    label:
      '包含应用程序标识符和应用程序密钥的文件路径'
  }
];

class WzConfigurationAzure extends Component {
  constructor(props) {
    super(props);
    this.wodleConfig = wodleBuilder(this.props.currentConfig, 'azure-logs');
  }
  componentDidMount() {
    this.props.updateBadge(this.badgeEnabled());
  }
  badgeEnabled() {
    return (
      this.wodleConfig &&
      this.wodleConfig['azure-logs'] &&
      this.wodleConfig['azure-logs'].disabled === 'no'
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
          !this.wodleConfig['azure-logs'] &&
          !isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {currentConfig && this.wodleConfig['azure-logs'] && (
          <WzConfigurationSettingsTabSelector
            title="主要设置"
            description="Azure日志的配置"
            currentConfig={this.wodleConfig}
            minusHeight={260}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={this.wodleConfig['azure-logs']}
              items={mainSettings}
            />
            {this.wodleConfig['azure-logs'].content &&
            this.wodleConfig['azure-logs'].content.length ? (
              <Fragment>
                {this.wodleConfig['azure-logs'].content.map(
                  (currentContent, key) => (
                    <Fragment key={`azure-logs-content-${key}`}>
                      {(currentContent.type || currentContent.tag) && (
                        <WzConfigurationSettingsGroup
                          title={currentContent.type || currentContent.tag}
                          config={currentContent}
                          items={contentSettings}
                        />
                      )}
                    </Fragment>
                  )
                )}
              </Fragment>
            ) : null}
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    );
  }
}

const sections = [{ component: 'wmodules', configuration: 'wmodules' }];

export default withWzConfig(sections)(WzConfigurationAzure);
