/*
 * Wazuh app - React component for show configuration of commands.
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
import WzConfigurationSettingsListSelector from '../util-components/configuration-settings-list-selector';
import withWzConfig from '../util-hocs/wz-config';
import { isString, renderValueNoThenEnabled } from '../utils/utils';
import { settingsListBuilder } from '../utils/builders';

const helpLinks = [
  {
    text: '命令模块引用',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/wodle-command.html'
  }
];

const mainSettings = [
  { field: 'disabled', label: '命令状态', renderValueNoThenEnabled },
  { field: 'tag', label: '命令名称' },
  { field: 'command', label: '命令执行' },
  { field: 'interval', label: '执行的时间间隔' },
  { field: 'run_on_start', label: '在开始运行' },
  { field: 'ignore_output', label: '忽略命令输出' },
  { field: 'timeout', label: '等待执行的超时(以秒为单位)' },
  { field: 'verify_md5', label: '验证MD5和' },
  { field: 'verify_sha1', label: '验证SHA1和' },
  { field: 'verify_sha256', label: '验证SHA256和' },
  { field: 'skip_verification', label: '忽略校验和验证' }
];

class WzConfigurationCommands extends Component {
  constructor(props) {
    super(props);
    this.wodleConfig =
      this.props.currentConfig &&
      !isString(this.props.currentConfig['wmodules-wmodules'])
        ? this.props.currentConfig['wmodules-wmodules'].wmodules.filter(
            item => item['command']
          )
        : [];
  }
  render() {
    const { currentConfig } = this.props;
    const items =
      this.wodleConfig && this.wodleConfig.length
        ? settingsListBuilder(this.wodleConfig.map(item => item.command), ['tag','command'])
        : false;
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
          !items &&
          !isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {currentConfig &&
        items &&
        !isString(currentConfig['wmodules-wmodules']) ? (
          <WzConfigurationSettingsTabSelector
            title="命令定义"
            description="在这里找到所有当前定义的命令"
            currentConfig={currentConfig}
            minusHeight={this.props.agent.id === '000' ? 260 : 355}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsListSelector
              items={items}
              settings={mainSettings}
            />
          </WzConfigurationSettingsTabSelector>
        ) : null}
      </Fragment>
    );
  }
}

const sections = [{ component: 'wmodules', configuration: 'wmodules' }];

WzConfigurationCommands.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default withWzConfig(sections)(WzConfigurationCommands);
