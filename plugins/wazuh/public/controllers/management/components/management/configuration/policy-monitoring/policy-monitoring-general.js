/*
 * Wazuh app - React component for show configuration of policy monitoring - general tab.
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
import helpLinks from './help-links';
import { isString, renderValueNoThenEnabled } from '../utils/utils';
import WzNoConfig from '../util-components/no-config';

const allSettings = [
  {
    field: 'disabled',
    label: '策略监控服务状态',
    render: renderValueNoThenEnabled
  },
  { field: 'base_directory', label: '基础目录' },
  { field: 'scanall', label: '扫描整个系统' },
  { field: 'frequency', label: '执行扫描的频率(秒)' },
  { field: 'check_dev', label: '检查/dev路径' },
  { field: 'check_files', label: '检查文件' },
  { field: 'check_if', label: '检查网络接口' },
  { field: 'check_pids', label: '检查进程ID' },
  { field: 'check_ports', label: '检查网络端口' },
  { field: 'check_sys', label: '检查异常的系统对象' },
  { field: 'check_trojans', label: '检查木马' },
  { field: 'check_unixaudit', label: '检查UNIX审计' },
  { field: 'check_winapps', label: '检查Windows应用程序' },
  { field: 'check_winaudit', label: '检查Windows审核' },
  { field: 'check_winmalware', label: '检查Windows恶意软件' },
  { field: 'skip_nfs', label: '跳过扫描CIFS/NFS挂载' },
  { field: 'rootkit_files', label: 'Rootkit文件数据库路径' },
  { field: 'rootkit_trojans', label: 'Rootkit木马数据库路径' },
  { field: 'windows_audit', label: 'Windows审计定义文件路径' },
  { field: 'windows_apps', label: 'Windows应用程序定义文件路径' },
  { field: 'windows_malware', label: 'Windows恶意软件定义文件路径' }
];

class WzConfigurationPolicyMonitoringGeneral extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig } = this.props;
    return (
      <Fragment>
        {currentConfig['syscheck-rootcheck'] &&
          isString(currentConfig['syscheck-rootcheck']) && (
            <WzNoConfig
              error={currentConfig['syscheck-rootcheck']}
              help={helpLinks}
            />
          )}
        {currentConfig['syscheck-rootcheck'] &&
          !isString(currentConfig['syscheck-rootcheck']) &&
          !currentConfig['syscheck-rootcheck'].rootcheck && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {((currentConfig['syscheck-rootcheck'] &&
          !isString(currentConfig['syscheck-rootcheck']) &&
          currentConfig['syscheck-rootcheck'].rootcheck) ||
          currentConfig['sca']) && (
          <WzConfigurationSettingsTabSelector
            title="所有设置"
            description="rootcheck守护进程的一般设置"
            currentConfig={currentConfig}
            minusHeight={this.props.agent.id === '000' ? 320 : 415}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={currentConfig['syscheck-rootcheck'].rootcheck}
              items={allSettings}
            />
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    );
  }
}

WzConfigurationPolicyMonitoringGeneral.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default WzConfigurationPolicyMonitoringGeneral;
