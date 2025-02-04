/*
 * Wazuh app - React component for show main configuration.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Component } from 'react';
import WzReduxProvider from '../../../../../redux/wz-redux-provider';
import WzConfigurationSwitch from './configuration-switch';
import { updateGlobalBreadcrumb } from '../../../../../redux/actions/globalBreadcrumbActions';
import store from '../../../../../redux/store';

class WzConfigurationMain extends Component {
  constructor(props) {
    super(props);
  }

  setGlobalBreadcrumb() {
    let breadcrumb = false;
    if (this.props.agent.id === '000') {
      breadcrumb = [
        { text: '' },
        { text: '策略管理' },
        { text: '系统策略配置' },
        // { text: '策略管理', href: '/app/wazuh#/manager' },
        // { text: '配置' }
      ];
    } else {
      breadcrumb = [
        { text: '' },
        { text: '资产管理' },
        {
          text: '主机管理',
          href: '#/agents-preview'
        },
        { agent: this.props.agent },
        { text: '配置' }
      ];
    }
    store.dispatch(updateGlobalBreadcrumb(breadcrumb));
    $('#breadcrumbNoTitle').attr("title","");
  }

  async componentDidMount() {
    this.setGlobalBreadcrumb();
  }

  render() {
    return (
      <WzReduxProvider>
        <WzConfigurationSwitch {...this.props} />
      </WzReduxProvider>
    );
  }
}

export default WzConfigurationMain;
