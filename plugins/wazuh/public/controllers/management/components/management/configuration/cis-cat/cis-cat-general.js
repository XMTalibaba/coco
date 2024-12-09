/*
 * Wazuh app - React component for show configuration of CIS-CAT - general tab.
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
    label: 'CIS-CAT集成状态',
    render: renderValueNoThenEnabled
  },
  { field: 'timeout', label: '扫描执行的超时(秒)' },
  { field: 'java_path', label: 'Java可执行目录的路径' },
  { field: 'ciscat_path', label: 'CIS-CAT可执行目录的路径' }
];

const schedulingSettings = [
  { field: 'interval', label: '扫描执行间隔' },
  { field: 'scan-on-start', label: '检查开始' },
  { field: 'day', label: '每个月的哪一天运行扫描' },
  { field: 'wday', label: '每周的哪一天运行扫描' },
  { field: 'time', label: '每天的哪个时间运行扫描' }
];

class WzConfigurationCisCatGeneral extends Component {
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
          !wodleConfig['cis-cat'] &&
          !isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {wodleConfig['cis-cat'] && (
          <WzConfigurationSettingsTabSelector
            title="主要设置"
            description="应用于所有基准测试的一般设置"
            currentConfig={wodleConfig}
            minusHeight={this.props.agent.id === '000' ? 320 : 415}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={wodleConfig['cis-cat']}
              items={mainSettings}
            />
            <WzConfigurationSettingsGroup
              title="调度设置"
              description="自定义CIS-CAT扫描调度"
              config={wodleConfig['cis-cat']}
              items={schedulingSettings}
            />
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    );
  }
}

WzConfigurationCisCatGeneral.propTypes = {
  // currentConfig: PropTypes.object.isRequired,
};

export default WzConfigurationCisCatGeneral;
