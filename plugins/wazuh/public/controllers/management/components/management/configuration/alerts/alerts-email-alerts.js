/*
 * Wazuh app - React component for show configuration of alerts - email alerts tab.
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

import { EuiSpacer } from '@elastic/eui';

import WzConfigurationSetting from '../util-components/configuration-setting';
import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzConfigurationSettingsListSelector from '../util-components/configuration-settings-list-selector';
import WzNoConfig from '../util-components/no-config';
import { isString, isArray } from '../utils/utils';
import { settingsListBuilder } from '../utils/builders';

import { connect } from 'react-redux';

const mainSettings = [
  { field: 'email_to', label: '向此电子邮件地址发送警报' },
  {
    field: 'level',
    label: '通过电子邮件发送警报的最低严重级别'
  },
  {
    field: 'group',
    label: '只发送属于其中一个组的警报'
  },
  {
    field: 'event_location',
    label: '当警报与此事件位置匹配时发送警报'
  },
  { field: 'format', label: '电子邮件提醒的格式' },
  {
    field: 'rule_id',
    label: '只发送属于这些规则id之一的警报'
  },
  { field: 'do_not_delay', label: '禁用延迟发送邮件' },
  {
    field: 'do_not_group',
    label: '禁用警报分组到同一电子邮件'
  }
];

const helpLinks = [
  {
    text: '如何配置电子邮件提醒',
    href:
      'https://documentation.wazuh.com/current/user-manual/manager/manual-email-report/index.html'
  },
  {
    text: '如何配置认证的SMTP服务器',
    href:
      'https://documentation.wazuh.com/current/user-manual/manager/manual-email-report/smtp_authentication.html'
  },
  {
    text: '电子邮件警报参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/email_alerts.html'
  }
];

class WzConfigurationAlertsEmailAlerts extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, wazuhNotReadyYet } = this.props;
    const items =
      currentConfig &&
      currentConfig['mail-alerts'] &&
      isArray(currentConfig['mail-alerts'].email_alerts)
        ? settingsListBuilder(
            currentConfig['mail-alerts'].email_alerts,
            'email_to'
          )
        : [];
    return (
      <Fragment>
        {currentConfig['mail-alerts'] &&
          isString(currentConfig['mail-alerts']) && (
            <WzNoConfig error={currentConfig['mail-alerts']} help={helpLinks} />
          )}
        {currentConfig['mail-alerts'] &&
        !isString(currentConfig['mail-alerts']) &&
        (!currentConfig['mail-alerts'].email_alerts ||
          !currentConfig['mail-alerts'].email_alerts.length) ? (
          <WzNoConfig error="not-present" help={helpLinks} />
        ) : null}
        {wazuhNotReadyYet &&
          (!currentConfig || !currentConfig['mail-alerts']) && (
            <WzNoConfig error="Wazuh还没有准备好" help={helpLinks} />
          )}
        {currentConfig['mail-alerts'] &&
        isArray(currentConfig['mail-alerts'].email_alerts) &&
        currentConfig['mail-alerts'].email_alerts.length ? (
          <WzConfigurationSettingsTabSelector
            title="主要设置"
            description="电子邮件提醒选项"
            currentConfig={currentConfig}
            minusHeight={320}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsListSelector
              items={items}
              settings={mainSettings}
            />
          </WzConfigurationSettingsTabSelector>
        ) : null}
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  wazuhNotReadyYet: state.appStateReducers.wazuhNotReadyYet
});

WzConfigurationAlertsEmailAlerts.propTypes = {
  // currentConfig: PropTypes.object.isRequired,
  wazuhNotReadyYet: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default connect(mapStateToProps)(WzConfigurationAlertsEmailAlerts);
