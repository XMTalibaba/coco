/*
 * Wazuh app - React component for show Client-Buffer configuration.
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

import {
  isString,
  renderValueNoThenEnabled,
  renderValueOrDefault
} from '../utils/utils';

const helpLinks = [
  {
    text: '防溢出机制',
    href:
      'https://documentation.wazuh.com/current/user-manual/capabilities/antiflooding.html'
  },
  {
    text: '客户端缓冲区引用',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/agent_buffer.html'
  }
];

const mainSettings = [
  {
    field: 'disabled',
    label: '缓存状态',
    render: renderValueNoThenEnabled
  },
  {
    field: 'queue_size',
    label: '队列的大小',
    render: renderValueOrDefault('5000')
  },
  {
    field: 'events_per_second',
    label: '事件/秒',
    render: renderValueOrDefault('500')
  }
];

class WzConfigurationClientBuffer extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig } = this.props;
    return (
      <Fragment>
        {currentConfig['agent-buffer'] &&
          isString(currentConfig['agent-buffer']) && (
            <WzNoConfig
              error={currentConfig['agent-buffer']}
              help={helpLinks}
            />
          )}
        {currentConfig['agent-buffer'] &&
          !isString(currentConfig['agent-buffer']) &&
          !currentConfig['agent-buffer'].buffer && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {currentConfig['agent-buffer'] &&
          !isString(currentConfig['agent-buffer']) &&
          currentConfig['agent-buffer'].buffer && (
            <WzConfigurationSettingsTabSelector
              title="主要设置"
              description="这些设置决定了代理的事件处理速率"
              currentConfig={currentConfig}
              minusHeight={355}
              helpLinks={helpLinks}
            >
              <WzConfigurationSettingsGroup
                config={currentConfig['agent-buffer'].buffer}
                items={mainSettings}
              />
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

const sections = [{ component: 'agent', configuration: 'buffer' }];

WzConfigurationClientBuffer.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default withWzConfig(sections)(WzConfigurationClientBuffer);
