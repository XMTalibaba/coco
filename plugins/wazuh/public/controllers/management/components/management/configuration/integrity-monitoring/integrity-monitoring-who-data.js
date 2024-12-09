/*
 * Wazuh app - React component for show configuration of integrity monitoring - whodata tab.
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

import { EuiBasicTable, EuiIcon, EuiLink } from '@elastic/eui';

import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import WzNoConfig from '../util-components/no-config';
import helpLinks from './help-links';

const mainSettings = [
  { field: 'restart_audit', label: '重新开始审核' },
  { field: 'startup_healthcheck', label: '启动健康检查' }
];

const columns = [{ field: 'audit_key', name: 'Keys' }];

class WzConfigurationIntegrityMonitoringWhoData extends Component {
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
          !currentConfig['syscheck-syscheck'].syscheck.whodata && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {currentConfig &&
          currentConfig['syscheck-syscheck'] &&
          currentConfig['syscheck-syscheck'].syscheck &&
          currentConfig['syscheck-syscheck'].syscheck.whodata && (
            <WzConfigurationSettingsTabSelector
              title="数据审核密钥"
              description="应用程序将在完整性监控基线中包含审计使用audit_key监视的事件。"
              currentConfig={currentConfig['syscheck-syscheck']}
              minusHeight={this.props.agent.id === '000' ? 320 : 415}
              helpLinks={helpLinks}
            >
              <WzConfigurationSettingsGroup
                config={currentConfig['syscheck-syscheck'].syscheck.whodata}
                items={mainSettings}
              />
              {currentConfig['syscheck-syscheck'].syscheck.whodata
                .audit_key && (
                <EuiBasicTable
                  items={currentConfig[
                    'syscheck-syscheck'
                  ].syscheck.whodata.audit_key.map(item => ({
                    audit_key: item
                  }))}
                  columns={columns}
                  noItemsMessage="无数据"
                />
              )}
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

WzConfigurationIntegrityMonitoringWhoData.proptTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default WzConfigurationIntegrityMonitoringWhoData;
