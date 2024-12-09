/*
 * Wazuh app - React component for show configuration of registration service.
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

import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import withWzConfig from '../util-hocs/wz-config';
import WzNoConfig from '../util-components/no-config';
import { isString, renderValueNoThenEnabled } from '../utils/utils';

const helpLinks = [
  {
    text: '如何使用注册服务',
    href:
      'https://documentation.wazuh.com/current/user-manual/registering/simple-registration-method.html'
  },
  {
    text: '注册服务引用',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/auth.html'
  }
];

const mainSettings = [
  {
    field: 'disabled',
    label: '服务状态',
    render: renderValueNoThenEnabled
  },
  { field: 'port', label: '监听端口上的连接' },
  { field: 'use_source_ip', label: "使用客户端的源IP地址" },
  { field: 'use_password', label: '使用密码注册代理' },
  { field: 'purge', label: '删除代理时清除代理列表' },
  {
    field: 'limit_maxagents',
    label: '将注册限制为最大代理人数'
  },
  {
    field: 'force_insert',
    label: '使用现有IP地址时强制注册'
  }
];
const sslSettings = [
  { field: 'ssl_verify_host', label: '使用CA证书验证代理' },
  {
    field: 'ssl_auto_negotiate',
    label: '自动选择SSL协商方法'
  },
  { field: 'ssl_manager_ca', label: 'CA证书位置' },
  { field: 'ssl_manager_cert', label: '服务器SSL证书位置' },
  { field: 'ssl_manager_key', label: '服务器SSL密钥位置' },
  { field: 'ciphers', label: '使用以下SSL密码' }
];

class WzRegistrationService extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.props.updateBadge(this.badgeEnabled());
  }
  badgeEnabled() {
    return (
      this.props.currentConfig['auth-auth'] &&
      this.props.currentConfig['auth-auth'].auth &&
      this.props.currentConfig['auth-auth'].auth.disabled === 'no'
    );
  }
  render() {
    const { currentConfig } = this.props;
    return (
      <Fragment>
        {currentConfig['auth-auth'] && !currentConfig['auth-auth'].auth && (
          <WzNoConfig error={currentConfig['auth-auth']} help={helpLinks} />
        )}
        {currentConfig['auth-auth'] &&
          currentConfig['auth-auth'].auth &&
          !isString(currentConfig['auth-auth'].auth) && (
            <WzConfigurationSettingsTabSelector
              title="主要设置"
              description="应用于注册服务的常规设置"
              currentConfig={currentConfig}
              minusHeight={260}
              helpLinks={helpLinks}
            >
              <WzConfigurationSettingsGroup
                config={currentConfig['auth-auth'].auth}
                items={mainSettings}
              />
              <WzConfigurationSettingsGroup
                title="SSL设置"
                description="当注册服务使用SSL证书时应用"
                config={currentConfig['auth-auth'].auth}
                items={sslSettings}
              />
            </WzConfigurationSettingsTabSelector>
          )}
      </Fragment>
    );
  }
}

WzRegistrationService.propTypes = {
  // currentConfig: PropTypes.object.isRequired
};

export default withWzConfig([{ component: 'auth', configuration: 'auth' }])(
  WzRegistrationService
);
