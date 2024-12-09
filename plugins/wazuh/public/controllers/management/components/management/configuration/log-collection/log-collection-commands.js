/*
 * Wazuh app - React component for show configuration of log collection - commands tab.
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
  renderValueOrDefault,
  renderValueOrNoValue
} from '../utils/utils';
import { settingsListBuilder } from '../utils/builders';
import helpLinks from './help-links';

const renderTargetField = item => item ? item.join(', ') : 'agent';

const mainSettings = [
  { field: 'logformat', label: '日志格式' },
  { field: 'command', label: '运行此命令', render: renderValueOrNoValue },
  { field: 'alias', label: '命令别名', render: renderValueOrNoValue },
  {
    field: 'frequency',
    label: '命令执行之间的间隔',
    render: renderValueOrNoValue
  },
  {
    field: 'target',
    label: '将输出重定向到此套接字',
    render: renderTargetField
  }
];


class WzConfigurationLogCollectionCommands extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig } = this.props;
    const items =
      currentConfig['logcollector-localfile'] &&
      currentConfig['logcollector-localfile']['localfile-commands']
        ? settingsListBuilder(
            currentConfig['logcollector-localfile']['localfile-commands'],
            [
              'file',
              'alias',
              'commnad', 
              (item) => `${item.logformat}${item.target ? ` - ${item.target.join(', ')}` : ''}`
            ]
          )
        : [];
    return (
      <Fragment>
        {currentConfig['logcollector-localfile'] &&
          isString(currentConfig['logcollector-localfile']) && (
            <WzNoConfig
              error={currentConfig['logcollector-localfile']}
              help={helpLinks}
            />
          )}
        {currentConfig['logcollector-localfile'] &&
        !isString(currentConfig['logcollector-localfile']) &&
        !(currentConfig['logcollector-localfile']['localfile-commands'] || [])
          .length ? (
          <WzNoConfig error="not-present" help={helpLinks} />
        ) : null}
        {currentConfig['logcollector-localfile'] &&
        !isString(currentConfig['logcollector-localfile']) &&
        currentConfig['logcollector-localfile']['localfile-commands'] &&
        currentConfig['logcollector-localfile']['localfile-commands'].length ? (
          <WzConfigurationSettingsTabSelector
            title="命令监控"
            description="这些命令的所有输出将被读取为一条或多条日志消息，具体取决于使用的是command还是full_command。"
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

WzConfigurationLogCollectionCommands.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default WzConfigurationLogCollectionCommands;
