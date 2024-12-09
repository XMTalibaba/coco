/*
 * Wazuh app - React component for show alerts - syslog output tab.
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

import { EuiBasicTable } from '@elastic/eui';

import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzNoConfig from '../util-components/no-config';
import {
  isString,
  renderValueOrAll,
  renderValueOrNo,
  renderValueOrDefault
} from '../utils/utils';

import { connect } from 'react-redux';

const helpLinks = [
  {
    text: '如何配置syslog输出',
    href:
      'https://documentation.wazuh.com/current/user-manual/manager/manual-syslog-output.html'
  },
  {
    text: 'Syslog输出参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/syslog-output.html'
  }
];

const columns = [
  { field: 'server', name: '服务器' },
  { field: 'port', name: '端口' },
  { field: 'level', name: '等级' },
  { field: 'format', name: '格式', render: renderValueOrDefault('default') },
  { field: 'use_fqdn', name: 'FQDN', render: renderValueOrNo },
  { field: 'rule_id', name: '规则ID', render: renderValueOrAll },
  { field: 'group', name: '组', render: renderValueOrAll },
  { field: 'location', name: '位置', render: renderValueOrAll }
];
class WzConfigurationAlertsReports extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, wazuhNotReadyYet } = this.props;
    return (
      <Fragment>
        {currentConfig['csyslog-csyslog'] &&
          isString(currentConfig['csyslog-csyslog']) && (
            <WzNoConfig
              error={currentConfig['csyslog-csyslog']}
              help={helpLinks}
            />
          )}
        {currentConfig['csyslog-csyslog'] &&
          !isString(currentConfig['csyslog-csyslog']) &&
          (!currentConfig['csyslog-csyslog'].syslog_output ||
            !currentConfig['csyslog-csyslog'].syslog_output.length) && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {wazuhNotReadyYet &&
          (!currentConfig || !currentConfig['csyslog-csyslog']) && (
            <WzNoConfig error="应用程序还没有准备好" help={helpLinks} />
          )}
        {currentConfig['csyslog-csyslog'] &&
          !isString(currentConfig['csyslog-csyslog']) &&
          currentConfig['csyslog-csyslog'].syslog_output &&
          currentConfig['csyslog-csyslog'].syslog_output.length && (
            <WzConfigurationSettingsTabSelector
              title="主要设置"
              description="输出告警到syslog服务器"
              currentConfig={currentConfig}
              minusHeight={320}
              helpLinks={helpLinks}
            >
              <EuiBasicTable
                columns={columns}
                items={currentConfig['csyslog-csyslog'].syslog_output}
                noItemsMessage="无数据"
              />
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  wazuhNotReadyYet: state.appStateReducers.wazuhNotReadyYet
});

WzConfigurationAlertsReports.propTypes = {
  // currentConfig: PropTypes.object.isRequired,
  wazuhNotReadyYet: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default connect(mapStateToProps)(WzConfigurationAlertsReports);
