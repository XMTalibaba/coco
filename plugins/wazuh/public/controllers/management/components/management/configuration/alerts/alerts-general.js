/*
 * Wazuh app - React component for show configuration of alerts - General tab.
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

import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzNoConfig from '../util-components/no-config';
import { isString, renderValueOrNo } from '../utils/utils';

const mainSettings = [
  {
    field: 'log_alert_level',
    label: '存储警报的最低严重级别'
  },
  {
    field: 'email_alert_level',
    label: '通过电子邮件发送警报的最低严重级别'
  },
  { field: 'use_geoip', label: 'Enable GeoIP lookups', render: renderValueOrNo }
];
const helpLinks = [
  {
    text: '关于警报生成的用例',
    href:
      'https://documentation.wazuh.com/current/getting-started/use-cases.html'
  },
  {
    text: '警报参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/alerts.html'
  }
];

class WzConfigurationAlertsGeneral extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, wazuhNotReadyYet } = this.props;
    return (
      <Fragment>
        {currentConfig['analysis-alerts'] &&
          isString(currentConfig['analysis-alerts']) && (
            <WzNoConfig
              error={currentConfig['analysis-alerts']}
              help={helpLinks}
            />
          )}
        {currentConfig['analysis-alerts'] &&
          !isString(currentConfig['analysis-alerts']) &&
          !currentConfig['analysis-alerts'].alerts && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {wazuhNotReadyYet &&
          (!currentConfig || !currentConfig['analysis-alerts']) && (
            <WzNoConfig error="应用程序还没有准备好" help={helpLinks} />
          )}
        {currentConfig['analysis-alerts'] &&
          !isString(currentConfig['analysis-alerts']) &&
          currentConfig['analysis-alerts'].alerts && (
            <WzConfigurationSettingsTabSelector
              title="主要设置"
              description="通用报警设置"
              currentConfig={currentConfig}
              minusHeight={320}
              helpLinks={helpLinks}
            >
              <WzConfigurationSettingsGroup
                config={currentConfig['analysis-alerts'].alerts}
                items={mainSettings}
              />
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

WzConfigurationAlertsGeneral.propTypes = {
  // currentConfig: PropTypes.object.isRequired,
  wazuhNotReadyYet: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default WzConfigurationAlertsGeneral;
