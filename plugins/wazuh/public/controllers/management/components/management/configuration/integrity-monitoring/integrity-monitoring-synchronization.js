/*
 * Wazuh app - React component for show configuration of integrity monitoring - synchronization tab.
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
import PropTypes from 'prop-types';

import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import WzNoConfig from '../util-components/no-config';
import helpLinks from './help-links';
import { renderValueYesThenEnabled } from '../utils/utils';

const mainSettings = [
  {
    field: 'enabled',
    label: '同步状态',
    render: renderValueYesThenEnabled
  },
  {
    field: 'max_interval',
    label: '每次同步之间的最大间隔（以秒为单位）'
  },
  { field: 'interval', label: '每次同步之间的间隔（以秒为单位）' },
  { field: 'response_timeout', label: '响应超时（以秒为单位）' },
  { field: 'queue_size', label: '管理员响应的队列大小' },
  { field: 'max_eps', label: '最大邮件吞吐量' }
];

class WzConfigurationIntegrityMonitoringSynchronization extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig } = this.props;
    return (
      <Fragment>
        {currentConfig &&
        currentConfig['syscheck-syscheck'] &&
        currentConfig['syscheck-syscheck'].syscheck &&
        currentConfig['syscheck-syscheck'].syscheck.synchronization ? (
          <WzConfigurationSettingsTabSelector
            title="同步"
            description="数据库同步设置"
            currentConfig={currentConfig['syscheck-syscheck']}
            minusHeight={this.props.agent.id === '000' ? 320 : 415}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={
                currentConfig['syscheck-syscheck'].syscheck.synchronization
              }
              items={mainSettings}
            />
          </WzConfigurationSettingsTabSelector>
        ) : (
          <WzNoConfig error="not-present" help={helpLinks} />
        )}
      </Fragment>
    );
  }
}

WzConfigurationIntegrityMonitoringSynchronization.proptTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default WzConfigurationIntegrityMonitoringSynchronization;
