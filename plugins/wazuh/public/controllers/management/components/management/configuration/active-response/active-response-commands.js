/*
 * Wazuh app - React component for show configuration of active response - command tab.
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

import WzNoConfig from '../util-components/no-config';
import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzConfigurationSettingsListSelector from '../util-components/configuration-settings-list-selector';
import { isString, renderValueNoThenEnabled } from '../utils/utils';
import { settingsListBuilder } from '../utils/builders';

import { connect } from 'react-redux';

const helpLinks = [
  {
    text: '主动响应文档',
    href:
      'https://documentation.wazuh.com/current/user-manual/capabilities/active-response/index.html'
  },
  {
    text: '命令参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/commands.html'
  }
];

const mainSettings = [
  { field: 'name', label: '命令名称' },
  { field: 'executable', label: '可执行文件名称' },
  { field: 'expect', label: '预期字段清单' },
  { field: 'extra_args', label: '额外的参数' },
  {
    field: 'timeout_allowed',
    label: '允许恢复此命令',
    render: renderValueNoThenEnabled
  }
];

class WzConfigurationActiveResponseCommands extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, wazuhNotReadyYet } = this.props;
    const items =
      currentConfig &&
      currentConfig['analysis-command'] &&
      currentConfig['analysis-command'].command
        ? settingsListBuilder(currentConfig['analysis-command'].command, 'name')
        : [];
    return (
      <Fragment>
        {currentConfig['analysis-command'] &&
          isString(currentConfig['analysis-command']) && (
            <WzNoConfig
              error={currentConfig['analysis-command']}
              help={helpLinks}
            />
          )}
        {currentConfig['analysis-command'] &&
          !isString(currentConfig['analysis-command']) &&
          currentConfig['analysis-command'].command &&
          !currentConfig['analysis-command'].command.length && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {wazuhNotReadyYet &&
          (!currentConfig || !currentConfig['analysis-command']) && (
            <WzNoConfig error="应用程序还没有准备好" help={helpLinks} />
          )}
        {currentConfig['analysis-command'] &&
        !isString(currentConfig['analysis-command']) &&
        currentConfig['analysis-command'].command &&
        currentConfig['analysis-command'].command.length ? (
          <WzConfigurationSettingsTabSelector
            title="命令定义"
            description="在这里找到用于主动响应的所有当前定义的命令"
            currentConfig={currentConfig['analysis-command']}
            minusHeight={320}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsListSelector
              items={items}
              settings={mainSettings}
            />
          </WzConfigurationSettingsTabSelector>
        ) : null}
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  wazuhNotReadyYet: state.appStateReducers.wazuhNotReadyYet
});

WzConfigurationActiveResponseCommands.propTypes = {
  // currentConfig: PropTypes.object.isRequired,
  wazuhNotReadyYet: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default connect(mapStateToProps)(WzConfigurationActiveResponseCommands);
