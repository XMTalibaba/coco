/*
 * Wazuh app - React component for show configuration of integrity monitoring - general tab.
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
import WzSettingsGroup from '../util-components/configuration-settings-group';

import {
  renderValueOrDefault,
  renderValueOrNoValue,
  renderValueOrYes,
  renderValueOrNo,
  renderValueNoThenEnabled
} from '../utils/utils';

import helpLinks from './help-links';

const mainSettings = [
  {
    field: 'disabled',
    label: '完整性监控状态',
    render: renderValueNoThenEnabled
  },
  {
    field: 'frequency',
    label: '运行完整性扫描的间隔(以秒为单位)'
  },
  {
    field: 'scan_time',
    label: '每天的哪个时间运行完整性扫描',
    render: renderValueOrNoValue
  },
  {
    field: 'scan_day',
    label: '每周的哪天运行完整性扫描',
    render: renderValueOrNoValue
  },
  {
    field: 'auto_ignore',
    label: '忽略更改次数过多的文件',
    render: renderValueOrNo,
    when: 'manager'
  },
  {
    field: 'alert_new_files',
    label: '创建新文件时发出警报',
    render: renderValueOrNo,
    when: 'manager'
  },
  { field: 'scan_on_start', label: '检查开始' },
  { field: 'skip_nfs', label: '跳过扫描CIFS/NFS挂载' },
  { field: 'skip_dev', label: '跳过扫描/dev目录' },
  { field: 'skip_sys', label: '跳过扫描/sys目录' },
  { field: 'skip_proc', label: '跳过扫描/proc目录' },
  {
    field: 'remove_old_diff',
    label: '删除旧的本地快照',
    render: renderValueOrYes
  },
  { field: 'restart_audit', label: '重新启动审计守护进程' },
  {
    field: 'windows_audit_interval',
    label: "检查目录SACL的间隔(以秒为单位)",
    render: renderValueOrDefault('300')
  },
  {
    field: 'prefilter_cmd',
    label: '防止预链接的命令',
    render: renderValueOrNoValue
  },
  { field: 'max_eps', label: '最大事件报告吞吐量' },
  { field: 'process_priority', label: '进程优先级' },
  { field: 'database', label: '数据库类型' }
];

const mainSettingsOfAgentOrManager = agent =>
  agent.id === '000'
    ? mainSettings
    : mainSettings.filter(setting => setting.when !== 'manager');

class WzConfigurationIntegrityMonitoringGeneral extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, agent } = this.props;
    return (
      <Fragment>
        <WzConfigurationSettingsTabSelector
          title="常规"
          description="下面显示的设置是全局应用的"
          currentConfig={currentConfig['syscheck-syscheck']}
          minusHeight={this.props.agent.id === '000' ? 320 : 415}
          helpLinks={helpLinks}
        >
          <WzSettingsGroup
            config={currentConfig['syscheck-syscheck'].syscheck}
            items={mainSettingsOfAgentOrManager(agent)}
          />
        </WzConfigurationSettingsTabSelector>
      </Fragment>
    );
  }
}

WzConfigurationIntegrityMonitoringGeneral.proptTypes = {
  // currentConfig: PropTypes.object.isRequired,
  agent: PropTypes.object
};

export default WzConfigurationIntegrityMonitoringGeneral;
