/*
 * Wazuh app - React component for show configuration of vulnerabilities - general tab.
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
import { isString } from '../utils/utils';
import helpLinks from './help-links';
import { renderValueYesThenEnabled } from '../utils/utils';

const mainSettings = [
  { field: 'enabled', label: '漏洞检测器状态', render: renderValueYesThenEnabled },
  { field: 'interval', label: '扫描执行之间的间隔' },
  { field: 'run_on_start', label: '扫描开始' },
  {
    field: 'ignore_time',
    label: '忽略已经检测到的漏洞的时间'
  }
];

class WzConfigurationVulnerabilitiesGeneral extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, wodleConfig } = this.props;
    return (
      <Fragment>
        {currentConfig['wmodules-wmodules'] &&
          isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig
              error={currentConfig['wmodules-wmodules']}
              help={helpLinks}
            />
          )}
        {currentConfig &&
          !wodleConfig['vulnerability-detector'] &&
          !isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {wodleConfig['vulnerability-detector'] && (
          <WzConfigurationSettingsTabSelector
            title="主要设置"
            description="应用于漏洞检测器及其提供者的常规设置"
            currentConfig={wodleConfig}
            minusHeight={320}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={wodleConfig['vulnerability-detector']}
              items={mainSettings}
            />
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    );
  }
}

WzConfigurationVulnerabilitiesGeneral.propTypes = {
  currentConfig: PropTypes.object.isRequired
};

export default WzConfigurationVulnerabilitiesGeneral;
