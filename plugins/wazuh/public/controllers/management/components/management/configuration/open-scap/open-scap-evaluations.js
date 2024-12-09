/*
 * Wazuh app - React component for show configuration of OpenSCAP - evaluations tab.
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

import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzNoConfig from '../util-components/no-config';
import { isString } from '../utils/utils';
import helpLinks from './help-links';

const renderProfile = item => (
  <Fragment>
    {item && item.length ? (
      <ul>
        {item.map((profile, key) => (
          <li key={`profile-${key}`}>{profile}</li>
        ))}
      </ul>
    ) : (
      '-'
    )}
  </Fragment>
);

const columns = [
  { field: 'path', name: '路径' },
  { field: 'profile', name: '配置文件', render: renderProfile },
  { field: 'type', name: '类型' },
  { field: 'timeout', name: '超时' }
];

class WzConfigurationOpenScapEvaluations extends Component {
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
          ((wodleConfig['open-scap'] &&
          !wodleConfig['open-scap'].content) || !wodleConfig['open-scap']) &&
          !isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {wodleConfig['open-scap'] && wodleConfig['open-scap'].content && (
          <WzConfigurationSettingsTabSelector
            title="评估"
            description="根据特定的安全策略及其配置文件执行扫描"
            currentConfig={wodleConfig}
            minusHeight={this.props.agent.id === '000' ? 320 : 415}
            helpLinks={helpLinks}
          >
            <EuiBasicTable
              columns={columns}
              items={wodleConfig['open-scap'].content}
              noItemsMessage="无数据"
            />
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    );
  }
}

WzConfigurationOpenScapEvaluations.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default WzConfigurationOpenScapEvaluations;
