/*
 * Wazuh app - React component for show configuration of Docker listener.
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
import {
  isString,
  renderValueOrDefault,
  renderValueNoThenEnabled,
  renderValueOrYes
} from '../utils/utils';

import withWzConfig from '../util-hocs/wz-config';
import { wodleBuilder } from '../utils/builders';

const helpLinks = [
  {
    text: 'Docker监听器模块引用',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/wodle-docker.html'
  }
];

const mainSettings = [
  {
    field: 'disabled',
    label: 'Docker监听器状态',
    render: renderValueNoThenEnabled
  },
  {
    field: 'attempts',
    label: '尝试执行监听器的次数',
    render: renderValueOrDefault('5')
  },
  {
    field: 'interval',
    label: '在监听器失败时重新运行该监听器的等待时间',
    render: renderValueOrDefault('10m')
  },
  {
    field: 'run_on_start',
    label: '服务启动后立即运行监听器',
    render: renderValueOrYes
  }
];

class WzConfigurationDockerListener extends Component {
  constructor(props) {
    super(props);
    this.wodleConfig = wodleBuilder(
      this.props.currentConfig,
      'docker-listener'
    );
  }
  componentDidMount() {
    this.props.updateBadge(this.badgeEnabled());
  }
  badgeEnabled() {
    return (
      this.props.currentConfig &&
      this.wodleConfig['docker-listener'] &&
      this.wodleConfig['docker-listener'].disabled === 'no'
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
          !this.wodleConfig['docker-listener'] &&
          !isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {currentConfig && this.wodleConfig['docker-listener'] && (
          <WzConfigurationSettingsTabSelector
            title="主要设置"
            description="通用Docker监听器设置"
            currentConfig={this.wodleConfig}
            minusHeight={this.props.agent.id === '000' ? 240 : 355}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={this.wodleConfig['docker-listener']}
              items={mainSettings}
            />
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    );
  }
}

const sections = [{ component: 'wmodules', configuration: 'wmodules' }];

WzConfigurationDockerListener.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default withWzConfig(sections)(WzConfigurationDockerListener);
