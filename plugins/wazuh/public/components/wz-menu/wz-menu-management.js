/*
 * Wazuh app - React component for registering agents.
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
import { AppNavigate } from '../../react-services/app-navigate'

class WzMenuManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // TODO: Fix the selected section
      selectedItemName: null
    };

    this.managementSections = {
      management: { id: 'management', text: '策略管理' },
      administration: { id: 'administration', text: '管理' },
      ruleset: { id: 'ruleset', text: '规则集' },
      rules: { id: 'rules', text: '规则' },
      decoders: { id: 'decoders', text: '解码器' },
      lists: { id: 'lists', text: 'CDB清单' },
      groups: { id: 'groups', text: '组' },
      configuration: { id: 'configuration', text: '配置' },
      statusReports: { id: 'statusReports', text: '状态和报告' },
      status: { id: 'status', text: '状态' },
      cluster: { id: 'monitoring', text: '集群' },
      logs: { id: 'logs', text: '日志' },
      reporting: { id: 'reporting', text: '报告' },
      statistics: { id: 'statistics', text: '统计' },
    };

    this.paths = {
      rules: '/rules',
      decoders: '/decoders',
      lists: '/lists/files'
    };

    this.wzReq = WzRequest;
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    if (nextProps.section !== this.state.selectedItemName) {
      this.setState({ selectedItemName: nextProps.section });
    }
  }

  clickMenuItem = (ev, section) => {
    AppNavigate.navigateToModule(ev, 'manager', { tab: section })
  };

  createItem = (item, data = {}) => {
    // NOTE: Duplicate `name` values will cause `id` collisions.
    return {
      ...data,
      id: item.id,
      name: item.text,
      isSelected: this.props.state.section === item.id,
      onClick: () => { },
      onMouseDown: (ev) => this.clickMenuItem(ev, item.id)
    };
  };

  render() {
    const container = document.getElementsByTagName('body');
    return ReactDOM.createPortal(<div className="wz-menu-nav">
      <EuiCollapsibleNavGroup
        title="管理"
        titleSize="xs"
        iconType="managementApp"
        isCollapsible={true}
        initialIsOpen={false}
      >
        <EuiSideNav
          items={[
            this.createItem(this.managementSections.rules),
            this.createItem(this.managementSections.decoders),
            this.createItem(this.managementSections.lists),
            this.createItem(this.managementSections.groups),
            this.createItem(this.managementSections.configuration),
          ]}
          style={{ padding: '4px 12px' }}
        />
      </EuiCollapsibleNavGroup>
      <EuiCollapsibleNavGroup
        title="状态和报告"
        titleSize="xs"
        iconType="reportingApp"
        isCollapsible={true}
        initialIsOpen={false}
      >
        <EuiSideNav
          items={[
            this.createItem(this.managementSections.status),
            this.createItem(this.managementSections.cluster),
            this.createItem(this.managementSections.statistics),
            this.createItem(this.managementSections.logs),
            this.createItem(this.managementSections.reporting)
          ]}
          style={{ padding: '4px 12px' }}
        />
      </EuiCollapsibleNavGroup>
    </div>, container[0])

    // const sideNavAdmin = [
    //   {
    //     name: this.managementSections.administration.text,
    //     id: this.managementSections.administration.id,
    //     id: 0,
    //     disabled: true,
    //     icon: <EuiIcon type="managementApp" color="primary" />,
    //     items: [
    //       this.createItem(this.managementSections.rules),
    //       this.createItem(this.managementSections.decoders),
    //       this.createItem(this.managementSections.lists),
    //       this.createItem(this.managementSections.groups),
    //       this.createItem(this.managementSections.configuration),
    //     ],
    //   }
    // ];

    // const sideNavStatus = [
    //   {
    //     name: this.managementSections.statusReports.text,
    //     id: this.managementSections.statusReports.id,
    //     disabled: true,
    //     icon: <EuiIcon type="reportingApp" color="primary" />,
    //     items: [
    //       this.createItem(this.managementSections.status),
    //       this.createItem(this.managementSections.cluster),
    //       this.createItem(this.managementSections.statistics),
    //       this.createItem(this.managementSections.logs),
    //       this.createItem(this.managementSections.reporting)
    //     ]
    //   }
    // ];

    // return (
    //   <div className="WzManagementSideMenu">
    //     <EuiFlexGroup>
    //       <EuiFlexItem grow={false} style={{ marginLeft: 14 }}>
    //         <EuiButtonEmpty iconType="apps"
    //           onClick={() => {
    //             this.props.closePopover();
    //             window.location.href = '#/manager';
    //           }}>
    //           策略管理目录
    //           </EuiButtonEmpty>
    //       </EuiFlexItem>
    //     </EuiFlexGroup>
    //     <EuiFlexGroup responsive={false}>
    //       <EuiFlexItem grow={false}>
    //         <EuiSideNav items={sideNavAdmin} style={{ padding: '4px 12px' }} />
    //       </EuiFlexItem>
    //       <EuiFlexItem grow={false}>
    //         <EuiSideNav items={sideNavStatus} style={{ padding: '4px 12px' }} />
    //       </EuiFlexItem>
    //     </EuiFlexGroup>
    //   </div>
    // );
  }
}

const mapStateToProps = state => {
  return {
    state: state.rulesetReducers,
  };
};

export default connect(
  mapStateToProps,
)(WzMenuManagement);
