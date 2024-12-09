/*
 * Wazuh app - React component for show configuration of alerts - Report tab.
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
import WzConfigurationListSelector from '../util-components/configuration-settings-list-selector';
import WzNoConfig from '../util-components/no-config';
import { isString } from '../utils/utils';
import { settingsListBuilder } from '../utils/builders';

import { connect } from 'react-redux';

const helpLinks = [
  {
    text: '如何生成自动报告',
    href:
      'https://documentation.wazuh.com/current/user-manual/manager/automatic-reports.html'
  },
  {
    text: '报告参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/reports.html'
  }
];

const mainSettings = [
  { field: 'title', label: '报告名称' },
  { field: 'mail_to', label: '将报告发送到此电子邮件地址' },
  { field: 'showlogs', label: '创建报表时包含日志' },
  { field: 'group', label: '按此组筛选' },
  { field: 'category', label: '按此类别筛选' },
  { field: 'rule', label: '根据规则ID进行过滤' },
  { field: 'level', label: '根据此警报级别或更高级别进行过滤' },
  { field: 'location', label: '根据此日志位置进行筛选' },
  { field: 'srcip', label: '根据源IP地址进行过滤' },
  { field: 'user', label: '按此用户名筛选' }
];

class WzConfigurationAlertsReports extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, wazuhNotReadyYet } = this.props;
    const items =
      currentConfig &&
      currentConfig['monitor-reports'] &&
      currentConfig['monitor-reports'].reports
        ? settingsListBuilder(currentConfig['monitor-reports'].reports, 'title')
        : {};
    return (
      <Fragment>
        {currentConfig['monitor-reports'] &&
          isString(currentConfig['monitor-reports']) && (
            <WzNoConfig
              error={currentConfig['monitor-reports']}
              help={helpLinks}
            />
          )}
        {currentConfig['monitor-reports'] &&
          !isString(currentConfig['monitor-reports']) &&
          (!currentConfig['monitor-reports'].reports ||
            !currentConfig['monitor-reports'].reports.length) && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {wazuhNotReadyYet &&
          (!currentConfig || !currentConfig['monitor-reports']) && (
            <WzNoConfig error="Wazuh还没有准备好" help={helpLinks} />
          )}
        {currentConfig['monitor-reports'] &&
          !isString(currentConfig['monitor-reports']) &&
          currentConfig['monitor-reports'].reports &&
          currentConfig['monitor-reports'].reports.length && (
            <WzConfigurationSettingsTabSelector
              title="主要设置"
              description="每日警报报告"
              minusHeight={320}
              currentConfig={currentConfig}
              helpLinks={helpLinks}
            >
              <WzConfigurationListSelector
                items={items}
                settings={mainSettings}
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
