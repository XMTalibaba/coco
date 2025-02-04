/*
 * Wazuh app - React component for Overview actions.
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
import store from '../../../../redux/store';
import { connect } from 'react-redux';
import { showExploreAgentModal, updateCurrentAgentData } from '../../../../redux/actions/appStateActions';


import {
  EuiFlexItem,
  EuiButtonIcon,
  EuiIcon,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiButtonEmpty,
  EuiToolTip,
} from '@elastic/eui';
import './agents-selector.scss';
import { AgentSelectionTable } from './agents-selection-table';
import { WAZUH_ALERTS_PATTERN } from '../../../../../common/constants';
import { AppState } from '../../../../react-services/app-state';
import { getDataPlugin } from '../../../../kibana-services';
class OverviewActions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: this.props.tab || '',
      subtab: this.props.subtab || '',
      isAgentModalVisible: false,
    };
  }

  async removeAgentsFilter(shouldUpdate = true) {

    await this.props.setAgent(false);
    const currentAppliedFilters = this.state.filterManager.filters;
    const agentFilters = currentAppliedFilters.filter(x => {
      return x.meta.key !== 'agent.id';
    });
    this.state.filterManager.setFilters(agentFilters);
  }

  componentDidMount() {
    const agentId = store.getState().appStateReducers.currentAgentData.id;
    const { filterManager } = getDataPlugin().query;

    this.setState({ filterManager: filterManager }, () => {
      if (this.props.initialFilter) this.agentTableSearch([this.props.initialFilter])
      if (agentId) this.agentTableSearch([agentId])
    });
  }

  componentDidUpdate(){
    const agent = store.getState().appStateReducers.currentAgentData;
    if(this.state.isAgent && !agent.id){
      this.setState({isAgent: false})
    }else if(agent.id && this.state.isAgent !== agent.id){
      this.setState({isAgent: agent.id})
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.tab) {
      this.setState({
        tab: nextProps.tab,
      });
    }
    if (nextProps.subtab) {
      this.setState({
        subtab: nextProps.subtab,
      });
    }
  }

  closeAgentModal() {
    this.setState({ isAgentModalVisible: false });
    store.dispatch(showExploreAgentModal(false));
  }

  showAgentModal() {
    this.setState({ isAgentModalVisible: true });
  }

  updateAgentSearch(agentsIdList) {
    if (agentsIdList) {
      this.setState({ isAgent: agentsIdList });
    }
  }

  agentTableSearch(agentIdList) {
    if (agentIdList && agentIdList.length) {
      if (agentIdList.length === 1) {
        const currentAppliedFilters = this.state.filterManager.filters;
        const agentFilters = currentAppliedFilters.filter(x => {
          return x.meta.key !== 'agent.id';
        });
        const filter = {
          "meta": {
            "alias": null,
            "disabled": false,
            "key": "agent.id",
            "negate": false,
            "params": { "query": agentIdList[0] },
            "type": "phrase",
            "index": AppState.getCurrentPattern() || WAZUH_ALERTS_PATTERN
          },
          "query": {
            "match": {
              'agent.id': {
                query: agentIdList[0],
                type: 'phrase'
              }
            }
          },
          "$state": { "store": "appState", "isImplicit": true},
        };
        agentFilters.push(filter);
        this.state.filterManager.setFilters(agentFilters);
        this.props.setAgent(agentIdList);
      }
    }

    this.setState({ isAgent: agentIdList }, () => this.closeAgentModal());
  }

  getSelectedAgents() {
    let selectedAgentsObject = {};
    for (var i = 0; this.state.isAgent && this.state.isAgent.length && i < this.state.isAgent.length; ++i) selectedAgentsObject[this.state.isAgent[i]] = true;
    return selectedAgentsObject;
  }

  render() {
    let modal;

    if (this.state.isAgentModalVisible || this.props.state.showExploreAgentModal) {
      modal = (
        <EuiOverlayMask onClick={() => this.closeAgentModal()}>
          <EuiModal
            className="wz-select-agent-modal"
            onClose={() => this.closeAgentModal()}
            initialFocus="[name=popswitch]"
          >
            <EuiModalHeader>
              <EuiModalHeaderTitle>选择代理</EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody style={{minHeight: 'calc(100% - 2.5rem - 40px)'}}>
              <AgentSelectionTable
                updateAgentSearch={agentsIdList => this.agentTableSearch(agentsIdList)}
                removeAgentsFilter={(shouldUpdate) => this.removeAgentsFilter(shouldUpdate)}
                selectedAgents={this.getSelectedAgents()}
              ></AgentSelectionTable>
            </EuiModalBody>
          </EuiModal>
        </EuiOverlayMask>
      );
    }
    const agent = store.getState().appStateReducers.currentAgentData;
    return (
      <div>
        <EuiFlexItem>
          {!this.state.isAgent && (
            <EuiToolTip position='bottom' content='选择一个代理以探索其模块' >
              <EuiButtonEmpty
                isLoading={this.state.loadingReport}
                color='primary'
                onClick={() => this.showAgentModal()}>
                <EuiIcon type="watchesApp" color="primary" style={{ marginBottom: 3 }} />&nbsp; 选择代理
            </EuiButtonEmpty>
            </EuiToolTip>
          )}
          {this.state.isAgent && (
            <div style={{ display: "inline-flex" }}>
              <EuiToolTip position='bottom' content='更改已选择的代理' >
                <EuiButtonEmpty
                  style={{background: 'rgba(0, 107, 180, 0.1)'}}
                  isLoading={this.state.loadingReport}
                  onClick={() => this.showAgentModal()}>
                  {agent.name} ({agent.id})
                  </EuiButtonEmpty>
              </EuiToolTip>
              <EuiToolTip position='bottom' content='取消固定代理'>
                <EuiButtonIcon
                  className="wz-unpin-agent"
                  iconType='pinFilled'
                  onClick={() => {
                    store.dispatch(updateCurrentAgentData({}));
                    this.removeAgentsFilter();
                  }}
                  aria-label='取消固定代理' />
              </EuiToolTip>
            </div>
          )}
        </EuiFlexItem>
        {modal}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.appStateReducers,
  };
};

export default connect(mapStateToProps, null)(OverviewActions);