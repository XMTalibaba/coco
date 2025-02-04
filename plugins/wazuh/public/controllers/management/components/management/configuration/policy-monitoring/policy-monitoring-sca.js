/*
 * Wazuh app - React component for show configuration of policy monitoring - sca tab.
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

import { EuiBasicTable } from '@elastic/eui';

import WzNoConfig from '../util-components/no-config';
import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzConfigurationSettingsHeader from '../util-components/configuration-settings-header';
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import helpLinks from './help-links';
import { renderValueYesThenEnabled } from '../utils/utils';
import { wodleBuilder } from '../utils/builders';

const securitySettings = [
  {
    field: 'enabled',
    label: '安全配置评估状态',
    render: renderValueYesThenEnabled
  },
  { field: 'interval', label: '时间间隔' },
  { field: 'scan_on_start', label: '检查开始' },
  { field: 'skip_nfs', label: 'Skip nfs' }
];

const columns = [{ field: 'policy', name: 'Name' }];

class WzPolicyMonitoringSCA extends Component {
  constructor(props) {
    super(props);
    this.wodleConfig = wodleBuilder(this.props.currentConfig, 'sca');
  }
  render() {
    return (
      <Fragment>
        {!this.wodleConfig.sca ? (
          <WzNoConfig error="not-present" help={helpLinks} />
        ) : (
          <WzConfigurationSettingsTabSelector
            title="安全配置评估状态"
            currentConfig={this.wodleConfig}
            minusHeight={this.props.agent.id === '000' ? 320 : 415}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={this.wodleConfig.sca}
              items={securitySettings}
            />
            <WzConfigurationSettingsHeader title="Policies" />
            <EuiBasicTable
              items={this.wodleConfig.sca.policies.map(policy => ({ policy }))}
              columns={columns}
              noItemsMessage="无数据"
            />
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    );
  }
}

WzPolicyMonitoringSCA.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default WzPolicyMonitoringSCA;
