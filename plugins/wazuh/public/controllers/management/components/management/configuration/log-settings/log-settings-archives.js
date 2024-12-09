/*
 * Wazuh app - React component for show configuration of log settings - archives tab.
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
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-tab-selector';
import WzNoConfig from '../util-components/no-config';
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

class WzConfigurationLogSettingsArchives extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig } = this.props;
    return (
      <Fragment>
        {currentConfig['analysis-logging'] &&
          isString(currentConfig['analysis-logging']) && (
            <Fragment>
              <WzNoConfig
                error={currentConfig['analysis-logging']}
                help={helpLinks}
              />
            </Fragment>
          )}
        {(currentConfig['analysis-logging'] &&
          currentConfig['analysis-logging'].logging) ||
          (currentConfig['com-logging'] &&
            currentConfig['com-logging'].logging && (
              <WzConfigurationSettingsTabSelector
                title="档案设置"
                description="基本存档日志设置"
                currentConfig={
                  currentConfig['analysis-logging'].logging.archives
                }
                helpLinks={helpLinks}
              >
                <WzConfigurationSettingsGroup
                  config={currentConfig['analysis-logging'].logging.archives}
                  items={mainSettings}
                />
              </WzConfigurationSettingsTabSelector>
            ))}
      </Fragment>
    );
  }
}

export default WzConfigurationLogSettingsArchives;
