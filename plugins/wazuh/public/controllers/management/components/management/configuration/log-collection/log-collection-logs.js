/*
 * Wazuh app - React component for show configuration of log collection - logs tab.
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
  { field: 'file', label: '日志地址', render: renderValueOrNoValue },
  {
    field: 'only-future-events',
    label: '启动后仅发生接收日志',
    when: 'agent'
  },
  {
    field: 'reconnect_time',
    label:
      '尝试重新连接Windows事件通道的时间(以秒为单位)',
    when: 'agent'
  },
  {
    field: 'query',
    label: '使用此XPATH查询过滤日志',
    render: renderValueOrNoValue,
    when: 'agent'
  },
  {
    field: 'labels',
    label: '启动后仅发生接收日志',
    render: renderValueOrNoValue,
    when: 'agent'
  },
  {
    field: 'target',
    label: '将输出重定向到此套接字',
    render: renderTargetField
  }
];


const getMainSettingsAgentOrManager = agent =>
  agent && agent.id === '000'
    ? mainSettings.filter(setting => setting.when !== 'agent')
    : mainSettings.filter(setting =>
        setting.when === 'agent'
          ? agent && agent.os && agent.os.platform === 'windows'
          : true
      );
class WzConfigurationLogCollectionLogs extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, agent } = this.props;
    const items =
      currentConfig['logcollector-localfile'] &&
      currentConfig['logcollector-localfile']['localfile-logs']
        ? settingsListBuilder(
            currentConfig['logcollector-localfile']['localfile-logs'],
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
        !(currentConfig['logcollector-localfile']['localfile-logs'] || [])
          .length ? (
          <WzNoConfig error="not-present" help={helpLinks} />
        ) : null}
        {currentConfig['logcollector-localfile'] &&
        !isString(currentConfig['logcollector-localfile']) &&
        currentConfig['logcollector-localfile']['localfile-logs'] &&
        currentConfig['logcollector-localfile']['localfile-logs'].length ? (
          <WzConfigurationSettingsTabSelector
            title="日志文件"
            description="将要分析的日志文件列表"
            currentConfig={currentConfig}
            minusHeight={this.props.agent.id === '000' ? 320 : 415}
            helpLinks={helpLinks}
          >
            <WzConfigurationListSelector
              items={items}
              settings={getMainSettingsAgentOrManager(agent)}
            />
          </WzConfigurationSettingsTabSelector>
        ) : null}
      </Fragment>
    );
  }
}

WzConfigurationLogCollectionLogs.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default WzConfigurationLogCollectionLogs;
