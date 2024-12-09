/*
 * Wazuh app - React component for show configuration of integrity monitoring - synchronization tab.
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
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import WzNoConfig from '../util-components/no-config';
import helpLinks from './help-links';
import { renderValueYesThenEnabled } from '../utils/utils';

const mainSettings = [
  {
    field: 'enabled',
    label: '文件限制状态',
    render: renderValueYesThenEnabled
  },
  {
    field: 'entries',
    label: '要监控的最大文件数'
  }
];

class WzConfigurationIntegrityMonitoringFileLimit extends Component {
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
        currentConfig['syscheck-syscheck'].syscheck.file_limit ? (
          <WzConfigurationSettingsTabSelector
            title="文件限制"
            description="限制要监控的文件的最大数量"
            currentConfig={currentConfig['syscheck-syscheck']}
            minusHeight={this.props.agent.id === '000' ? 320 : 415}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={
                currentConfig['syscheck-syscheck'].syscheck.file_limit
              }
              items={mainSettings}
            />
          </WzConfigurationSettingsTabSelector>
        ) : (
          <WzNoConfig error="not-present" help={helpLinks} />
        )}
      </Fragment>
    );
  }
}

WzConfigurationIntegrityMonitoringFileLimit.proptTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default WzConfigurationIntegrityMonitoringFileLimit;
