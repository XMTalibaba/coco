/*
 * Wazuh app - React component of actions buttons for status.
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
// Eui components
import {
  EuiFlexItem,
  EuiButtonEmpty,
  EuiSelect,
  EuiOverlayMask,
  EuiConfirmModal,
  EuiButton,
} from '@elastic/eui';

import { connect } from 'react-redux';

import {
  updateLoadingStatus,
  updateListDaemons,
  updateNodeInfo,
  updateSelectedNode,
  updateStats,
  updateAgentInfo,
} from '../../../../../redux/actions/statusActions';

import StatusHandler from './utils/status-handler';
import { getToasts }  from '../../../../../kibana-services';
import { WzButtonPermissions } from '../../../../../components/common/permissions/button';

class WzStatusActionButtons extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.refreshTimeoutId = null;
    this.statusHandler = StatusHandler;
    this.state = {
      isModalVisible: false,
      isRestarting: false
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    this._isMounted = false;
  }

  /**
   * Restart cluster
   */
  async restartCluster() {
    this.setState({ isRestarting: true });
    try {
      const result = await this.statusHandler.restartCluster();
      this.setState({ isRestarting: false });
      this.showToast(
        'success',
        '重新启动群集，最多需要30秒。',
        3000
      );
    } catch (error) {
      this.setState({ isRestarting: false });
      this.showToast('danger', `重新启动群集时出错: ${error.message || error}`, 3000);
    }
  }

  /**
   * Restart manager
   */
  async restartManager() {
    this.setState({ isRestarting: true });
    try {
      await this.statusHandler.restartManager();
      this.setState({ isRestarting: false });
      this.showToast('success', '正在重新启动管理器。', 3000);
    } catch (error) {
      this.setState({ isRestarting: false });
      this.showToast('danger', `重新启动管理器时出错: ${error.message || error}`, 3000);
    }
  }

  objToArr(obj) {
    const arr = [];
    for (const key in obj) arr.push({ key, value: obj[key] });
    return arr;
  }

  /**
   * This change to a selected node
   * @param {String} node
   */
  changeNode = async e => {
    try {
      const node = e.target.value;
      this.props.updateLoadingStatus(true);
      this.props.updateSelectedNode(node);

      const agentSummaryResponse = await this.statusHandler.agentsSummary();
      const agentsCountResponse = await this.statusHandler.clusterAgentsCount();

      const { active, disconnected, never_connected, total } = agentSummaryResponse.data.data;
      this.props.updateStats({
        agentsCount: agentsCountResponse.data.data.nodes,
        agentsCountActive: active,
        agentsCountDisconnected: disconnected,
        agentsCountNeverConnected: never_connected,
        agentsCountTotal: total,
        agentsCoverity: total ? (active / total) * 100 : 0
      });

      const daemons = await this.statusHandler.clusterNodeStatus(node);
      const listDaemons = this.objToArr(daemons.data.data.affected_items[0]);
      this.props.updateListDaemons(listDaemons);

      const nodeInfo = await this.statusHandler.clusterNodeInfo(node);
      this.props.updateNodeInfo(nodeInfo.data.data.affected_items[0]);

      const lastAgentRaw = await this.statusHandler.lastAgentRaw();
      const [lastAgent] = lastAgentRaw.data.data.affected_items;

      this.props.updateAgentInfo(lastAgent);

      this.props.updateLoadingStatus(false);
    } catch (error) {
      this.props.updateLoadingStatus(false);
      this.showToast('danger', `节点${node}宕机`, 3000);
    }

    return;
  };

  onRefreshLoading() {
    clearInterval(this.refreshTimeoutId);

    this.props.updateLoadingStatus(true);
    this.refreshTimeoutId = setInterval(() => {
      if (!this.props.state.isProcessing) {
        this.props.updateLoadingStatus(false);
        clearInterval(this.refreshTimeoutId);
      }
    }, 100);
  }

  showToast = (color, text, time) => {
    getToasts().add({
      color: color,
      title: text,
      toastLifeTimeMs: time
    });
  };

  transforToOptions = listNodes => {
    let options = [];
    for (const node of listNodes) {
      options.push({
        value: node.name,
        text: `${node.name} (${node.type})`
      });
    }
    return options;
  };

  closeModal = () => {
    this.setState({ isModalVisible: false });
  };

  render() {
    const {
      isLoading,
      listNodes,
      selectedNode,
      clusterEnabled,
      isRestarting
    } = this.props.state;

    let options = this.transforToOptions(listNodes);

    // Select node
    const selectNode = (
      <EuiSelect
        id="selectNode"
        options={options}
        value={selectedNode}
        onChange={this.changeNode}
        disabled={isLoading || this.state.isRestarting}
        aria-label="选择节点"
      />
    );

    // Restart button
    const restartButton = (
      // <WzButtonPermissions
      //   buttonType='empty'
      //   permissions={[clusterEnabled ? {action: 'cluster:restart', resource: 'node:id:*'} : {action: 'manager:restart', resource: '*:*:*'}]}
      //   iconType="refresh"
      //   onClick={async () => this.setState({ isModalVisible: true })}
      //   isDisabled={isLoading}
      //   isLoading={this.state.isRestarting}
      // >
      //   {clusterEnabled && '重启集群'}
      //   {!clusterEnabled && '重启管理器'}
      // </WzButtonPermissions>
      <EuiButton
        size="s"
        onClick={async () => this.setState({ isModalVisible: true })}
        isDisabled={isLoading}
        isLoading={this.state.isRestarting}
      >
        {clusterEnabled && '重启集群'}
        {!clusterEnabled && '重启管理器'}
      </EuiButton>
    );

    let modal;

    if (this.state.isModalVisible) {
      modal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title={
              clusterEnabled
                ? '集群将被重新启动'
                : '管理将被重新启动'
            }
            onCancel={this.closeModal}
            onConfirm={() => {
              if (clusterEnabled) {
                this.restartCluster();
              } else {
                this.restartManager();
              }
              this.setState({ isModalVisible: false });
            }}
            cancelButtonText="取消"
            confirmButtonText="确认"
            defaultFocusedButton="cancel"
          ></EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

    return (
      <Fragment>
        {selectedNode !== null && (
          <EuiFlexItem grow={false}>{restartButton}</EuiFlexItem>
        )}
        {selectedNode && <EuiFlexItem grow={false}>{selectNode}</EuiFlexItem>}
        {modal}
      </Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.statusReducers
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateLoadingStatus: status => dispatch(updateLoadingStatus(status)),
    updateListDaemons: listDaemons => dispatch(updateListDaemons(listDaemons)),
    updateNodeInfo: nodeInfo => dispatch(updateNodeInfo(nodeInfo)),
    updateSelectedNode: selectedNode => dispatch(updateSelectedNode(selectedNode)),
    updateStats: stats => dispatch(updateStats(stats)),
    updateAgentInfo: agentInfo => dispatch(updateAgentInfo(agentInfo))
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WzStatusActionButtons);
