/*
 * Wazuh app - React component for show configuration of policy monitoring - system audit tab.
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
import { isString } from '../utils/utils';
import helpLinks from './help-links';

const columns = [{ field: 'path', name: 'Path' }];

class WzPolicyMonitoringSystemAudit extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig } = this.props;
    return (
      <Fragment>
        {currentConfig['syscheck-rootcheck'] &&
          isString(currentConfig['syscheck-rootcheck']) && (
            <WzNoConfig
              error={currentConfig['syscheck-rootcheck']}
              help={helpLinks}
            />
          )}
        {currentConfig &&
          currentConfig['syscheck-rootcheck'] &&
          currentConfig['syscheck-rootcheck'].rootcheck &&
          !currentConfig['syscheck-rootcheck'].rootcheck.system_audit && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {currentConfig &&
          currentConfig['syscheck-rootcheck'] &&
          currentConfig['syscheck-rootcheck'].rootcheck &&
          currentConfig['syscheck-rootcheck'].rootcheck.system_audit && (
            <WzConfigurationSettingsTabSelector
              title="UNIX审计文件"
              description="为类unix系统指定审计定义文件的路径"
              currentConfig={currentConfig}
              minusHeight={this.props.agent.id === '000' ? 320 : 415}
              helpLinks={helpLinks}
            >
              <EuiBasicTable
                items={currentConfig[
                  'syscheck-rootcheck'
                ].rootcheck.system_audit.map(item => ({ path: item }))}
                columns={columns}
                noItemsMessage="无数据"
              />
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

WzPolicyMonitoringSystemAudit.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default WzPolicyMonitoringSystemAudit;
