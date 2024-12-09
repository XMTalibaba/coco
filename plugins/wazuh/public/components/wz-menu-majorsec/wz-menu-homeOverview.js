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
import { EuiFlexGroup, EuiFlexItem, EuiFlexGrid, EuiButtonEmpty, EuiSideNav, EuiIcon, EuiCollapsibleNavGroup } from '@elastic/eui';
import { connect } from 'react-redux';
import store from '../../redux/store';
import { updateCurrentTab, updateCurrentAgentData } from '../../redux/actions/appStateActions';
import { AppState } from '../../react-services/app-state';
import { AppNavigate } from '../../react-services/app-navigate';
import { getAngularModule } from '../../kibana-services';
import { hasAgentSupportModule } from '../../react-services/wz-agents';
import { WAZUH_MODULES_ID } from '../../../common/constants';
import { getDataPlugin } from '../../kibana-services';

class WzHomeOverview extends Component {
  constructor(props) {
    super(props);
    this.currentApi = JSON.parse(AppState.getCurrentAPI()).id;
    this.state = {
      extensions: []
    };

    this.overviewSections = {
      // workbench: {id: 'workbench', text: '工作台', type: ''}
      workbench: {id: 'general', text: '工作台', type: 'overview'}
    };

    this.homeOverviewItems = [
      this.overviewSections.workbench,
    ]
  }

  async componentDidMount() {
    const extensions = await AppState.getExtensions(this.currentApi);
    this.setState({ extensions });
    const $injector = getAngularModule().$injector;
    this.router = $injector.get('$route');
  }

  clickMenuItem = (ev, section, type) => {
    console.log(window.location.href)
    this.removeSelectedAgent();
    const params = { tab: section };
    if (type) {
      AppNavigate.navigateToModule(ev, type, params)
    }
    else {
      AppNavigate.navigateToModule(ev, section, {})
    }
  };

  createItems = items => {
    return items.map(item => this.createItem(item));
  };

  createItem = (item, data = {}) => {
    // NOTE: Duplicate `name` values will cause `id` collisions.
    return {
      ...data,
      id: item.id,
      name: item.text,
      isSelected: this.props.currentTab === item.id,
      onClick: () => { },
      onMouseDown: (ev) => this.clickMenuItem(ev, item.id, item.type)
    };
  };

  removeSelectedAgent() {
    this.props.updateCurrentAgentData({});
    // this.router.reload();
    const { filterManager } = getDataPlugin().query;
    const currentAppliedFilters = filterManager.getFilters();
    const agentFilters = currentAppliedFilters.filter(x => {
      return x.meta.key === 'agent.id';
    });
    agentFilters.map(x => {
      filterManager.removeFilter(x);
    });
  }

  render() {
    const container = document.getElementsByTagName('body');
    return ReactDOM.createPortal(<div className="wz-menu-nav">
      <EuiSideNav
        items={this.createItems(this.homeOverviewItems)}
        style={{ padding: '4px 12px' }}
      />
    </div>, container[0])
  }
}

const mapStateToProps = state => {
  return {
    state: state.rulesetReducers,
    currentAgentData: state.appStateReducers.currentAgentData,
    currentTab: state.appStateReducers.currentTab
  };
};

const mapDispatchToProps = dispatch => ({
  updateCurrentAgentData: (agentData) => dispatch(updateCurrentAgentData(agentData))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WzHomeOverview);
