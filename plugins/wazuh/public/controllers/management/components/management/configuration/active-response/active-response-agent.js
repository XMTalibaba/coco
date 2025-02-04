/*
 * Wazuh app - React component for show configuration of active response - agent tab.
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
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';

import withWzConfig from '../util-hocs/wz-config';

import { compose } from 'redux';
import { connect } from 'react-redux';

import { isString, renderValueNoThenEnabled } from '../utils/utils';

const helpLinks = [
  {
    text: '主动响应文档',
    href:
      'https://documentation.wazuh.com/current/user-manual/capabilities/active-response/index.html'
  },
  {
    text: '主动回应参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/active-response.html'
  }
];

const mainSettings = [
  {
    field: 'disabled',
    label: '活动响应状态',
    render: renderValueNoThenEnabled
  },
  {
    field: 'repeated_offenders',
    label: '屡犯者的超时列表（以分钟为单位）'
  },
  {
    field: 'ca_store',
    label: '使用以下根CA证书列表'
  },
  { field: 'ca_verification', label: '使用根CA证书验证WPK' }
];

class WzConfigurationActiveResponseAgent extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, wazuhNotReadyYet } = this.props;
    return (
      <Fragment>
        {currentConfig['com-active-response'] &&
          isString(currentConfig['com-active-response']) && (
            <WzNoConfig
              error={currentConfig['com-active-response']}
              help={helpLinks}
            />
          )}
        {currentConfig['com-active-response'] &&
          !isString(currentConfig['com-active-response']) &&
          !currentConfig['com-active-response']['active-response'] && (
            <WzNoConfig error="not-present" help={helpLinks} />
          )}
        {wazuhNotReadyYet &&
          (!currentConfig || !currentConfig['com-active-response']) && (
            <WzNoConfig error="应用程序还没有准备好" help={helpLinks} />
          )}
        {currentConfig['com-active-response'] &&
          !isString(currentConfig['com-active-response']) &&
          currentConfig['com-active-response']['active-response'] && (
            <WzConfigurationSettingsTabSelector
              title="活动响应设置"
              description="在此处找到该代理的所有活动响应设置"
              currentConfig={currentConfig}
              minusHeight={this.props.agent.id === '000' ? 280 : 355}
              helpLinks={helpLinks}
            >
              <WzConfigurationSettingsGroup
                config={currentConfig['com-active-response']['active-response']}
                items={mainSettings}
              />
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  wazuhNotReadyYet: state.appStateReducers.wazuhNotReadyYet
});

const sectionsAgent = [{ component: 'com', configuration: 'active-response' }];

WzConfigurationActiveResponseAgent.propTypes = {
  // currentConfig: PropTypes.object.isRequired,
  wazuhNotReadyYet: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default compose(
  connect(mapStateToProps),
  withWzConfig(sectionsAgent)
)(WzConfigurationActiveResponseAgent);
