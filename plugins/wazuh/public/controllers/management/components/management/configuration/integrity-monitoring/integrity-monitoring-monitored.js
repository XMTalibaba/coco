/*
 * Wazuh app - React component for show configuration of integrity monitoring - monitored tab.
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

import { EuiBasicTable, EuiSpacer } from '@elastic/eui';

import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzConfigurationSettingsHeader from '../util-components/configuration-settings-header';
import WzConfigurationListSelector from '../util-components/configuration-settings-list-selector';
import WzNoConfig from '../util-components/no-config';
import { settingsListBuilder } from '../utils/builders';
import helpLinks from './help-links';

const renderOptsIncludes = key => item => (item.includes(key) ? 'yes' : 'no');

const mainSettings = [
  { field: 'dir', label: '所选项目' },
  {
    field: 'opts',
    label: '启用实时监控',
    render: renderOptsIncludes('realtime')
  },
  {
    field: 'opts',
    label: '启用审核（谁的数据）',
    render: renderOptsIncludes('check_whodata')
  },
  {
    field: 'opts',
    label: '报告文件变更',
    render: renderOptsIncludes('report_changes')
  },
  {
    field: 'opts',
    label: '执行所有校验和',
    render: renderOptsIncludes('check_all')
  },
  {
    field: 'opts',
    label: '校验和（MD5和SHA1）',
    render: renderOptsIncludes('check_sum')
  },
  {
    field: 'opts',
    label: '检查MD5总和',
    render: renderOptsIncludes('check_md5sum')
  },
  {
    field: 'opts',
    label: '检查SHA1总和',
    render: renderOptsIncludes('check_sha1sum')
  },
  {
    field: 'opts',
    label: '检查SHA256总和',
    render: renderOptsIncludes('check_sha256sum')
  },
  {
    field: 'opts',
    label: '检查文件大小',
    render: renderOptsIncludes('check_size')
  },
  {
    field: 'opts',
    label: '检查文件所有者',
    render: renderOptsIncludes('check_owner')
  },
  {
    field: 'opts',
    label: '检查文件组',
    render: renderOptsIncludes('check_group')
  },
  {
    field: 'opts',
    label: '检查文件权限',
    render: renderOptsIncludes('check_perm')
  },
  {
    field: 'opts',
    label: '检查文件修改时间',
    render: renderOptsIncludes('check_mtime')
  },
  {
    field: 'opts',
    label: '检查文件节点',
    render: renderOptsIncludes('check_inode')
  },
  { field: 'restrict', label: '仅限包含此字符串的文件' },
  { field: 'tags', label: '警报的自定义标签' },
  { field: 'recursion_level', label: '递归级别' },
  {
    field: 'opts',
    label: '跟随符号链接',
    render: renderOptsIncludes('follow_symbolic_link')
  }
];

const columnsAgentWin = [
  { field: 'entry', name: 'Entry' },
  { field: 'arch', name: 'Arch' }
];

class WzConfigurationIntegrityMonitoringMonitored extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, agent } = this.props;
    const items =
      currentConfig['syscheck-syscheck'] &&
      currentConfig['syscheck-syscheck'].syscheck &&
      currentConfig['syscheck-syscheck'].syscheck.directories
        ? settingsListBuilder(
            currentConfig['syscheck-syscheck'].syscheck.directories,
            'dir'
          )
        : [];
    return (
      <Fragment>
        {currentConfig &&
        currentConfig['syscheck-syscheck'] &&
        currentConfig['syscheck-syscheck'].syscheck &&
        (currentConfig['syscheck-syscheck'].syscheck.directories &&
        !currentConfig['syscheck-syscheck'].syscheck.directories.length  &&
        ((currentConfig['syscheck-syscheck'].syscheck.registry &&
        !currentConfig['syscheck-syscheck'].syscheck.registry.length) || !currentConfig['syscheck-syscheck'].syscheck.registry)) ? (
          <WzNoConfig error="not-present" help={helpLinks} />
        ) : null}
        {currentConfig &&
        currentConfig['syscheck-syscheck'] &&
        currentConfig['syscheck-syscheck'].syscheck &&
        currentConfig['syscheck-syscheck'].syscheck.directories &&
        currentConfig['syscheck-syscheck'].syscheck.directories.length > 0 ? (
          <WzConfigurationSettingsTabSelector
            title="监控目录"
            description="这些目录包含在完整性扫描中"
            currentConfig={currentConfig['syscheck-syscheck']}
            minusHeight={this.props.agent.id === '000' ? 320 : 415}
            helpLinks={helpLinks}
          >
            <WzConfigurationListSelector
              items={items}
              settings={mainSettings}
            />
            {((agent || {}).os || {}).platform === 'windows' &&
              currentConfig &&
              currentConfig['syscheck-syscheck'] &&
              currentConfig['syscheck-syscheck'].syscheck &&
              currentConfig['syscheck-syscheck'].syscheck.registry && (
                <Fragment>
                  <EuiSpacer />
                  <WzConfigurationSettingsHeader
                    title="监视的注册表项"
                    description="将要监视的注册表项列表"
                  />
                  <EuiBasicTable
                    items={currentConfig['syscheck-syscheck'].syscheck.registry}
                    columns={columnsAgentWin}
                    noItemsMessage="无数据"
                  />
                </Fragment>
            )}
          </WzConfigurationSettingsTabSelector>
        ) : null}
        {((agent || {}).os || {}).platform === 'windows' &&
          currentConfig &&
          currentConfig['syscheck-syscheck'] &&
          currentConfig['syscheck-syscheck'].syscheck &&
          !currentConfig['syscheck-syscheck'].syscheck.registry && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {((agent || {}).os || {}).platform === 'windows' &&
          currentConfig &&
          currentConfig['syscheck-syscheck'] &&
          currentConfig['syscheck-syscheck'].syscheck &&
          currentConfig['syscheck-syscheck'].syscheck.registry &&
          currentConfig['syscheck-syscheck'].syscheck.registry.length > 0 &&
          ((currentConfig['syscheck-syscheck'].syscheck.directories && !currentConfig['syscheck-syscheck'].syscheck.directories.length)
            || !currentConfig['syscheck-syscheck'].syscheck.directories) && (
              <WzConfigurationSettingsTabSelector
                title="监视的注册表项"
                description="将要监视的注册表项列表"
                currentConfig={currentConfig}
                minusHeight={this.props.agent.id === '000' ? 320 : 415}
                helpLinks={helpLinks}
              >
                <EuiBasicTable
                  items={currentConfig['syscheck-syscheck'].syscheck.registry}
                  columns={columnsAgentWin}
                  noItemsMessage="无数据"
                />
              </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

WzConfigurationIntegrityMonitoringMonitored.proptTypes = {
  // currentConfig: PropTypes.object.isRequired,
  agent: PropTypes.object
};

export default WzConfigurationIntegrityMonitoringMonitored;
