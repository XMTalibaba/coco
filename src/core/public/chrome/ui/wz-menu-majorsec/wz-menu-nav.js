/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

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
import { EuiSideNav, EuiCollapsibleNavGroup } from '@elastic/eui';

export class MenuNav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openNav: '',
      urlHash: '',
    };
  }

  async componentDidMount() {}

  clickMenuItem = (ev, id, type, modulesTab, tabView, app) => {

    const params = { tab: id };
    let urlHash;
    if (modulesTab) {
      urlHash = modulesTab;
    } else if (type) {
      urlHash = `${type}/${id}`;
    } else {

      urlHash = id;
    }

    this.setState({ urlHash });
    if (id === 'sca') {
      // SCA initial tab is inventory
      params.tabView = 'inventory';
    }
    if (modulesTab) {
      params.modulesTab = modulesTab;
    }
    if (tabView) {
      params.tabView = tabView;
    }
    if (type) {
      this.props.navigateToModule(ev, type, params, app ? app : 'wazuh');
    } else {


      this.props.navigateToModule(ev, id, {}, app ? app : 'wazuh');
  
    }
  };

  createItems = (items) => {
    return items.map((item) => this.createItem(item));
  };

  createItem = (item, data = {}) => {
    // NOTE: Duplicate `name` values will cause `id` collisions.
    // console.log(window.location.hash)
    const { urlHash } = this.state;
    const checkUrl = urlHash ? urlHash : window.location.hash;
    let isSelected = false;
    if (item.modulesTab) {
      isSelected = checkUrl.includes(item.modulesTab);
    } else if (item.type) {
      isSelected = checkUrl.includes(item.type) && checkUrl.includes(item.id);
    } else {
      isSelected = checkUrl.includes(item.id);
    }
    return {
      ...data,
      id: item.id + item.text,
      name: item.text,
      isSelected,
      onClick: () => {},
      onMouseDown: (ev) =>
        this.clickMenuItem(ev, item.id, item.type, item.modulesTab, item.tabView, item.app),
    };
  };

  setOpen = (isOpen, type) => {
    const openNav = isOpen ? type : 'close';
    this.setState({ openNav });
  };

  render() {
    const { currentMenuTab, navItems, rolesType } = this.props;
    const { openNav } = this.state;
    const activeNav = openNav ? openNav : currentMenuTab;
    const container = document.getElementsByTagName('body');
    const permissionsRoute = navItems[rolesType];
    return ReactDOM.createPortal(
      <div className="wz-menu-nav">
        <div>
          {permissionsRoute &&
            Object.keys(permissionsRoute).map((k) => {
              if (permissionsRoute[k].routeItems.length > 0) {
                return (
                  <EuiCollapsibleNavGroup
                    key={k}
                    title={permissionsRoute[k].title}
                    titleSize="xs"
                    iconType={permissionsRoute[k].iconType}
                    isCollapsible={true}
                    initialIsOpen={false}
                    forceState={activeNav === permissionsRoute[k].activeNav ? 'open' : 'closed'}
                    className={activeNav === permissionsRoute[k].activeNav ? 'nav-active' : ''}
                    onToggle={(isOpen) => this.setOpen(isOpen, permissionsRoute[k].activeNav)}
                  >
                    <EuiSideNav items={this.createItems(permissionsRoute[k].routeItems)} />
                  </EuiCollapsibleNavGroup>
                );
              }
            })}
        </div>
      </div>,
      container[0]
    );
  }
}
