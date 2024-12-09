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
import { EuiFlexItem, EuiFlexGroup, EuiSideNav, EuiIcon, EuiCollapsibleNavGroup } from '@elastic/eui';
import { WzRequest } from '../../react-services/wz-request';
import { connect } from 'react-redux';
import { AppNavigate } from '../../react-services/app-navigate';

class WzMenuSecurity extends Component {
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

  avaibleRenderSettings() {
    return [
      this.createItem({ id: 'users', text: '用户' }),
      this.createItem({ id: 'roles', text: '角色' }),
      this.createItem({ id: 'policies', text: '策略' }),
      this.createItem({ id: 'roleMapping', text: '角色映射' }),
    ]
  }

  clickMenuItem = async (ev, section) => {
    AppNavigate.navigateToModule(ev, 'security', { tab: section });
  };

  createItem = (item, data = {}) => {
    // NOTE: Duplicate `name` values will cause `id` collisions.
    return {
      ...data,
      id: item.id,
      name: item.text,
      isSelected: window.location.href.includes('/security') && this.props.state.selected_security_section === item.id,
      onClick: () => { },
      onMouseDown: (ev) => this.clickMenuItem(ev, item.id)
    };
  };

  render() {
    const container = document.getElementsByTagName('body');
    const renderSettings = this.avaibleRenderSettings()
    return ReactDOM.createPortal(<div className="wz-menu-nav">
      <EuiCollapsibleNavGroup
        title="安全"
        titleSize="xs"
        iconType="managementApp"
        isCollapsible={true}
        initialIsOpen={false}
      >
        <EuiSideNav
          items={renderSettings}
          style={{ padding: '4px 12px' }}
        />
      </EuiCollapsibleNavGroup>
    </div>, container[0])

    // const renderSettings = this.avaibleRenderSettings()
    // const sideNavAdmin = [
    //   {
    //     name: '安全',
    //     id: 0,
    //     icon: <EuiIcon type="securityApp" color="primary" />,
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
    state: state.securityReducers
  };
};

export default connect(mapStateToProps, null)(WzMenuSecurity);
