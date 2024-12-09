/*
 * Wazuh app - React component for Settings submenu.
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
import ReactDOM from 'react-dom';
import { EuiFlexItem, EuiFlexGroup, EuiSideNav, EuiIcon, EuiButtonEmpty, EuiToolTip, EuiCollapsibleNavGroup } from '@elastic/eui';
import { WzRequest } from '../../react-services/wz-request';
import { connect } from 'react-redux';
import { AppNavigate } from '../../react-services/app-navigate';
import { getAngularModule } from '../../kibana-services';

class WzMenuSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // TODO: Fix the selected section
      selectedItemName: null
    };
    this.wzReq = WzRequest;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    if (nextProps.section !== this.state.selectedItemName) {
      this.setState({ selectedItemName: nextProps.section });
    }
  }

  availableSettings() {
    let auxSettings = {
      settings: { id: 'settings', text: '设置' },
      api: { id: 'api', text: 'API配置' },
      modules: { id: 'modules', text: '模块' },
      sample_data: { id: 'sample_data', text: '样本数据' },
      configuration: { id: 'configuration', text: '配置' },
      logs: { id: 'logs', text: '日志' },
      about: { id: 'about', text: '关于' },
    };
    return (auxSettings);
  }

  avaibleRenderSettings() {
    const availableSettings = this.availableSettings()
    let auxItems = [
      this.createItem(availableSettings.api),
      this.createItem(availableSettings.modules),
      this.createItem(availableSettings.sample_data),
      this.createItem(availableSettings.configuration),
      this.createItem(availableSettings.logs),
      this.createItem(availableSettings.about),
    ]
    return (auxItems);
  }

  clickMenuItem = async (ev, section) => {
    AppNavigate.navigateToModule(ev, 'settings', { tab: section });
    if (this.props.currentMenuTab === 'settings') {
      const $injector = getAngularModule().$injector;
      const router = $injector.get('$route');
      router.reload();
    }
  };

  createItem = (item, data = {}) => {
    // NOTE: Duplicate `name` values will cause `id` collisions.
    return {
      ...data,
      id: item.id,
      name: item.text,
      isSelected: window.location.href.includes('/settings') && this.props.state.selected_settings_section === item.id,
      onClick: () => { },
      onMouseDown: (ev) => this.clickMenuItem(ev, item.id)
    };
  };

  render() {
    const container = document.getElementsByTagName('body');
    const renderSettings = this.avaibleRenderSettings()
    return ReactDOM.createPortal(<div className="wz-menu-nav">
      <EuiCollapsibleNavGroup
        title="设置"
        titleSize="xs"
        iconType="gear"
        isCollapsible={true}
        initialIsOpen={false}
      >
        <EuiSideNav
          items={renderSettings}
          style={{ padding: '4px 12px' }}
        />
      </EuiCollapsibleNavGroup>
    </div>, container[0])

    // const availableSettings = this.availableSettings()
    // const renderSettings = this.avaibleRenderSettings()
    // const sideNavAdmin = [
    //   {
    //     name: availableSettings.settings.text,
    //     id: availableSettings.settings.id,
    //     disabled: true,
    //     icon: <EuiIcon type="gear" color="primary" />,
    //     items: renderSettings
    //   }
    // ];


    // return (
    //   <div className="WzManagementSideMenu" style={{ width: 200 }}>
    //     <EuiFlexGroup responsive={false}>
    //       <EuiFlexItem grow={false}>
    //         <EuiSideNav items={sideNavAdmin} style={{ padding: '4px 12px' }} />
    //       </EuiFlexItem>
    //     </EuiFlexGroup>
    //   </div>
    // );
  }
}

const mapStateToProps = state => {
  return {
    state: state.appStateReducers,
  };
};

export default connect(
  mapStateToProps,
)(WzMenuSettings);
