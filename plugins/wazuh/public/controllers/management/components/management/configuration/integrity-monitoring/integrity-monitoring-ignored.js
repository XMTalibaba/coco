/*
 * Wazuh app - React component for show configuration of integrity monitoring - ignored tab.
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

import { EuiBasicTable, EuiSpacer } from '@elastic/eui';

import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzNoConfig from '../util-components/no-config';
import helpLinks from './help-links';

const columnsPath = [{ field: 'path', name: 'Path' }];

const columnsSregex = [{ field: 'sregex', name: 'Sregex' }];

const columnsEntryArch = [
  { field: 'entry', name: 'Entry' },
  { field: 'arch', name: 'Arch' }
];

const columnsEntryArchSRegex = [
  { field: 'entry', name: 'Entry Sregex' },
  { field: 'arch', name: 'Arch' }
];

class WzConfigurationMonitoringIgnored extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, agent } = this.props;
    return (
      <Fragment>
        {((agent || {}).os || {}).platform !== 'windows' &&
        currentConfig &&
        currentConfig['syscheck-syscheck'] &&
        currentConfig['syscheck-syscheck'].syscheck &&
        !currentConfig['syscheck-syscheck'].syscheck.ignore &&
        !currentConfig['syscheck-syscheck'].syscheck.ignore_sregex ? (
          <WzNoConfig error="not-present" help={helpLinks} />
        ) : null}
        {((agent || {}).os || {}).platform !== 'windows' &&
        currentConfig &&
        currentConfig['syscheck-syscheck'] &&
        currentConfig['syscheck-syscheck'].syscheck &&
        (currentConfig['syscheck-syscheck'].syscheck.ignore ||
        currentConfig['syscheck-syscheck'].syscheck.ignore_sregex ) ? (
          <Fragment>
            <WzConfigurationSettingsTabSelector
              title="忽略的文件和目录"
              description="这些文件和目录从完整性扫描中被忽略"
              currentConfig={currentConfig['syscheck-syscheck']}
              minusHeight={this.props.agent.id === '000' ? 320 : 415}
              helpLinks={helpLinks}
            >
              {currentConfig['syscheck-syscheck'].syscheck.ignore && (
                <EuiBasicTable
                  items={currentConfig['syscheck-syscheck'].syscheck.ignore.map(
                    item => ({ path: item })
                  )}
                  columns={columnsPath}
                  noItemsMessage="无数据"
                />
              )}
              {currentConfig['syscheck-syscheck'].syscheck.ignore_sregex && (
                <Fragment>
                  {currentConfig['syscheck-syscheck'].syscheck.ignore && <EuiSpacer size="s" />}
                  <EuiBasicTable
                    items={currentConfig[
                      'syscheck-syscheck'
                    ].syscheck.ignore_sregex.map(item => ({ sregex: item }))}
                    columns={columnsSregex}
                    noItemsMessage="无数据"
                  />
                </Fragment>
              )}
            </WzConfigurationSettingsTabSelector>
          </Fragment>
        ) : null}
        {((agent || {}).os || {}).platform === 'windows' &&
          currentConfig &&
          currentConfig['syscheck-syscheck'] &&
          currentConfig['syscheck-syscheck'].syscheck &&
          !currentConfig['syscheck-syscheck'].syscheck.ignore &&
          !currentConfig['syscheck-syscheck'].syscheck.ignore_sregex &&
          !currentConfig['syscheck-syscheck'].syscheck.registry_ignore &&
          !currentConfig['syscheck-syscheck'].syscheck.registry_ignore_sregex && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {((agent || {}).os || {}).platform === 'windows' &&
          currentConfig &&
          currentConfig['syscheck-syscheck'] &&
          currentConfig['syscheck-syscheck'].syscheck &&
          (currentConfig['syscheck-syscheck'].syscheck.ignore ||
            currentConfig['syscheck-syscheck'].syscheck.ignore_sregex ||
            currentConfig['syscheck-syscheck'].syscheck.registry_ignore ||
            currentConfig['syscheck-syscheck'].syscheck.registry_ignore_sregex) && (
            <WzConfigurationSettingsTabSelector
              title="忽略"
              description="注册表项的列表将被忽略"
              currentConfig={currentConfig}
              minusHeight={this.props.agent.id === '000' ? 320 : 415}
              helpLinks={helpLinks}
            >
              {currentConfig['syscheck-syscheck'].syscheck.registry_ignore && (
                <EuiBasicTable
                  items={
                    currentConfig['syscheck-syscheck'].syscheck.registry_ignore
                  }
                  columns={columnsEntryArch}
                  noItemsMessage="无数据"
                />
              )}
              {currentConfig['syscheck-syscheck'].syscheck
                .registry_ignore_sregex && (
                  <Fragment>
                    {(currentConfig['syscheck-syscheck'].syscheck.registry_ignore) && <EuiSpacer />}
                    <EuiBasicTable
                      items={
                        currentConfig['syscheck-syscheck'].syscheck.registry_ignore_sregex
                      }
                      columns={columnsEntryArchSRegex}
                      noItemsMessage="无数据"
                    />
                  </Fragment>
              )}
              {currentConfig['syscheck-syscheck'].syscheck
                .ignore && (
                  <Fragment>
                    {(currentConfig['syscheck-syscheck'].syscheck.registry_ignore || currentConfig['syscheck-syscheck'].syscheck.registry_ignore_sregex ) && <EuiSpacer />}
                    <EuiBasicTable
                      items={
                        currentConfig['syscheck-syscheck'].syscheck.ignore.map(item => ({ path: item }))
                      }
                      columns={columnsPath}
                      noItemsMessage="无数据"
                    />
                  </Fragment>
              )}
              {currentConfig['syscheck-syscheck'].syscheck
                .ignore_sregex && (
                  <Fragment>
                    {(currentConfig['syscheck-syscheck'].syscheck.registry_ignore || currentConfig['syscheck-syscheck'].syscheck.registry_ignore_sregex || currentConfig['syscheck-syscheck'].syscheck.ignore) && <EuiSpacer />}
                    <EuiBasicTable
                      items={
                        currentConfig['syscheck-syscheck'].syscheck.ignore_sregex.map(item => ({ sregex: item }))
                      }
                      columns={columnsSregex}
                      noItemsMessage="无数据"
                    />
                  </Fragment>
              )}
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

WzConfigurationMonitoringIgnored.proptTypes = {
  // currentConfig: PropTypes.object.isRequired,
  agent: PropTypes.object
};

export default WzConfigurationMonitoringIgnored;
