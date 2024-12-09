/*
 * Wazuh app - React component for show configuration of log settings - internal tab.
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

import WzNoConfig from '../util-components/no-config';
import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import { isString } from '../utils/utils';
import helpLinks from './help-links';

const mainSettings = [
  { field: 'plain_format', label: 'Plain格式' },
  { field: 'JSON format', label: 'JSON格式' },
  { field: 'Compress rotatio', label: '压缩转换' },
  { field: 'Saved rotations', label: '保存转换' },
  { field: 'schedule', label: '日程' },
  { field: 'maxsize', label: '最大日志大小' },
  { field: 'minsize', label: '最小日志大小' },
  { field: 'maxage', label: '最长记录期限' }
];

class WzConfigurationLogSettingsInternal extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig } = this.props;
    return (
      <Fragment>
        {currentConfig['monitor-logging'] &&
          isString(currentConfig['monitor-logging']) && (
            <Fragment>
              <WzNoConfig
                error={currentConfig['monitor-logging']}
                help={helpLinks}
              />
            </Fragment>
          )}
        {(currentConfig['analysis-logging'] &&
          currentConfig['analysis-logging'].logging) ||
          (currentConfig['monitor-logging'] &&
            currentConfig['monitor-logging'].logging && (
              <WzConfigurationSettingsTabSelector
                title="内部设置"
                description="基本内部日志设置"
                currentConfig={currentConfig['monitor-logging'].logging}
                helpLinks={helpLinks}
              >
                <WzConfigurationSettingsGroup
                  config={currentConfig['monitor-logging'].logging}
                  items={mainSettings}
                />
              </WzConfigurationSettingsTabSelector>
            ))}
        {currentConfig['agent-logging'] &&
          currentConfig['agent-logging'].logging && (
            <WzConfigurationSettingsTabSelector
              title="内部设置"
              description="基本内部日志设置"
              currentConfig={currentConfig['agent-logging'].logging}
              helpLinks={helpLinks}
            >
              <WzConfigurationSettingsGroup
                config={currentConfig['agent-logging'].logging}
                items={mainSettings}
              />
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

export default WzConfigurationLogSettingsInternal;
