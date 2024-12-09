/*
 * Wazuh app - React component for show configuration of OpenSCAP - general tab.
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
import WzNoConfig from '../util-components/no-config';
import helpLinks from './help-links';
import { isString, renderValueNoThenEnabled } from '../utils/utils';

const mainSettings = [
  {
    field: 'disabled',
    label: 'OpenSCAP集成状态',
    render: renderValueNoThenEnabled
  },
  { field: 'timeout', label: '扫描执行的超时(秒)' },
  { field: 'interval', label: '扫描执行间隔' },
  { field: 'scan-on-start', label: '扫描开始' }
];

class WzConfigurationOpenSCAPGeneral extends Component {
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
          !wodleConfig['open-scap'] &&
          !isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {wodleConfig['open-scap'] && (
          <WzConfigurationSettingsTabSelector
            title="主要设置"
            description="这些设置适用于所有OpenSCAP评估"
            currentConfig={wodleConfig}
            minusHeight={this.props.agent.id === '000' ? 320 : 415}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={wodleConfig['open-scap']}
              items={mainSettings}
            />
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    );
  }
}

WzConfigurationOpenSCAPGeneral.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default WzConfigurationOpenSCAPGeneral;
