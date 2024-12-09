/*
 * Wazuh app - React component for show configuration of active response - active response tab.
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
import { compose } from 'redux';
import withWzConfig from '../util-hocs/wz-config';

const mainSettings = [
  {
    field: 'disabled',
    label: '此活动响应的状态',
    render: renderValueNoThenEnabled
  },
  { field: 'command', label: '执行命令' },
  { field: 'location', label: '在此位置执行命令' },
  { field: 'agent_id', label: '在其上执行命令的代理程序ID' },
  { field: 'level', label: '符合此严重级别或更高' },
  { field: 'rules_group', label: '匹配这些组之一' },
  { field: 'rules_id', label: '匹配这些规则ID之一' },
  { field: 'timeout', label: '还原前的超时时间（以秒为单位）' }
];

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

class WzConfigurationActiveResponseActiveResponse extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, wazuhNotReadyYet } = this.props;
    const items =
      !isString(currentConfig['analysis-active_response']) &&
      currentConfig['analysis-active_response']['active-response'] &&
      currentConfig['analysis-active_response']['active-response'].length
        ? settingsListBuilder(
            currentConfig['analysis-active_response']['active-response'],
            'command'
          )
        : [];
    return (
      <Fragment>
        {currentConfig['analysis-active_response'] &&
          isString(currentConfig['analysis-active_response']) && (
            <WzNoConfig
              error={currentConfig['analysis-active_response']}
              help={helpLinks}
            />
          )}
        {currentConfig['analysis-active_response'] &&
          !isString(currentConfig['analysis-active_response']) &&
          currentConfig['analysis-active_response']['active-response'] &&
          !currentConfig['analysis-active_response']['active-response']
            .length && <WzNoConfig error="not-present" help={helpLinks} />}
        {wazuhNotReadyYet &&
          (!currentConfig || !currentConfig['analysis-active_response']) && (
            <WzNoConfig error="应用程序还没有准备好" help={helpLinks} />
          )}
        {currentConfig['analysis-active_response'] &&
        !isString(currentConfig['analysis-active_response']) &&
        currentConfig['analysis-active_response']['active-response'].length ? (
          <WzConfigurationSettingsTabSelector
            title="活动响应定义"
            description="在此处找到所有当前定义的有效回复"
            currentConfig={currentConfig['analysis-active_response']}
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

WzConfigurationActiveResponseActiveResponse.propTypes = {
  // currentConfig: PropTypes.object.isRequired,
  wazuhNotReadyYet: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

const mapStateToProps = state => ({
  wazuhNotReadyYet: state.appStateReducers.wazuhNotReadyYet
});

export default connect(mapStateToProps)(
  WzConfigurationActiveResponseActiveResponse
);

const sectionsAgent = [{ component: 'com', configuration: 'active-response' }];

export const WzConfigurationActiveResponseActiveResponseAgent = compose(
  connect(mapStateToProps),
  withWzConfig(sectionsAgent)
)(WzConfigurationActiveResponseActiveResponse);

WzConfigurationActiveResponseActiveResponseAgent.propTypes = {
  // currentConfig: PropTypes.object.isRequired,
  wazuhNotReadyYet: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};
