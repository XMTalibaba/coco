/*
 * Wazuh app - React component for show configuration of cluster.
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

import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzNoConfig from '../util-components/no-config';

import withWzConfig from '../util-hocs/wz-config';
import { isString } from '../utils/utils';

import { connect } from 'react-redux';
import { compose } from 'redux';

const mainSettings = [
  { field: 'disabled', label: '集群状态' },
  { field: 'name', label: '集群名称' },
  { field: 'node_name', label: '节点名称' },
  { field: 'node_type', label: '节点类型' },
  { field: 'nodes', label: '主节点IP地址' },
  { field: 'port', label: '侦听群集通信的端口' },
  {
    field: 'bind_addr',
    label: '监听集群通信的IP地址'
  },
  { field: 'hidden', label: '在警报中隐藏集群信息' }
];

const helpLinks = [
  {
    text: '如何配置集群',
    href:
      'https://documentation.wazuh.com/current/user-manual/configuring-cluster/index.html'
  },
  {
    text: '集群参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/cluster.html'
  }
];

class WzCluster extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { currentConfig, wazuhNotReadyYet } = this.props;
    let mainSettingsConfig = {
      ...currentConfig['com-cluster'],
      disabled:
        currentConfig['com-cluster'].disabled === 'yes' ? 'disabled' : 'enabled'
    };
    return (
      <Fragment>
        {currentConfig['com-cluster'] &&
          isString(currentConfig['com-cluster']) && (
            <WzNoConfig error={currentConfig['com-cluster']} help={helpLinks} />
          )}
        {wazuhNotReadyYet &&
          (!currentConfig || !currentConfig['com-cluster']) && (
            <WzNoConfig error="应用程序还没有准备好" help={helpLinks} />
          )}
        {currentConfig['com-cluster'] &&
          !isString(currentConfig['com-cluster']) && (
            <WzConfigurationSettingsTabSelector
              title="主要设置"
              currentConfig={currentConfig}
              minusHeight={260}
              helpLinks={helpLinks}
            >
              <WzConfigurationSettingsGroup
                config={mainSettingsConfig}
                items={mainSettings}
              />
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

const sections = [{ component: 'com', configuration: 'cluster' }];

const mapStateToProps = state => ({
  wazuhNotReadyYet: state.appStateReducers.wazuhNotReadyYet
});

WzCluster.propTypes = {
  // currentConfig: PropTypes.object.isRequired
  wazuhNotReadyYet: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default compose(
  withWzConfig(sections),
  connect(mapStateToProps)
)(WzCluster);
