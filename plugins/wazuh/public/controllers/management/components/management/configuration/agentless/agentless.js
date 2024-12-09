/*
 * Wazuh app - React component for show configuration of agentless.
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

import withWzConfig from '../util-hocs/wz-config';
import WzNoConfig from '../util-components/no-config';
import WzConfigurationListSelector from '../util-components/configuration-settings-list-selector';
import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import { isString } from '../utils/utils';

import { connect } from 'react-redux';
import { compose } from 'redux';

const mainSettings = [
  { field: 'type', label: '无代理监控类型' },
  { field: 'frequency', label: '检查间隔时间(秒)' },
  { field: 'host', label: '设备用户名和主机名' },
  { field: 'state', label: '设备检查类型' },
  { field: 'arguments', label: '将这些参数传递给check' }
];

const helpLinks = [
  {
    text: '如何监控无代理设备',
    href:
      'https://documentation.wazuh.com/current/user-manual/capabilities/agentless-monitoring/index.html'
  },
  {
    text: '无代理参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/agentless.html'
  }
];

class WzConfigurationAgentless extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, wazuhNotReadyYet } = this.props;
    const items =
      currentConfig &&
      currentConfig['agentless-agentless'] &&
      currentConfig['agentless-agentless'].agentless
        ? currentConfig['agentless-agentless'].agentless.map(item => ({
            label: `${item.type} (${item.state})`,
            data: item
          }))
        : false;
    return (
      <Fragment>
        {currentConfig['agentless-agentless'] &&
          isString(currentConfig['agentless-agentless']) && (
            <WzNoConfig
              error={currentConfig['agentless-agentless']}
              help={helpLinks}
            />
          )}
        {wazuhNotReadyYet &&
          (!currentConfig || !currentConfig['agentless-agentless']) && (
            <WzNoConfig error="应用程序还没有准备好" help={helpLinks} />
          )}
        {currentConfig['agentless-agentless'] &&
          !isString(currentConfig['agentless-agentless']) && (
            <WzConfigurationSettingsTabSelector
              title="设备列表"
              description="不使用代理的受监视设备的列表"
              currentConfig={currentConfig}
              minusHeight={260}
              helpLinks={helpLinks}
            >
              <WzConfigurationListSelector
                items={items}
                settings={mainSettings}
              />
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

const sections = [{ component: 'agentless', configuration: 'agentless' }];

const mapStateToProps = state => ({
  wazuhNotReadyYet: state.appStateReducers.wazuhNotReadyYet
});

WzConfigurationAgentless.propTypes = {
  // currentConfig: PropTypes.object.isRequired,
  wazuhNotReadyYet: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default compose(
  withWzConfig(sections),
  connect(mapStateToProps)
)(WzConfigurationAgentless);
