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
import {
  EuiCallOut,
  EuiHealth,
} from '@elastic/eui';

import { connect } from 'react-redux';
import GroupsHandler from './utils/groups-handler';
import { getToasts }  from '../../../../../kibana-services';

import {
  updateLoadingStatus,
  updateFileContent,
  updateIsProcessing,
  updatePageIndexAgents,
  updateShowModal,
  updateListItemsForRemove,
  updateSortDirectionAgents,
  updateSortFieldAgents,
  updateReload
} from '../../../../../redux/actions/groupsActions';

import { getAgentFilterValues } from './get-agents-filters-values';
import { TableWithSearchBarWzAPI } from '../../../../../components/common/tables';
import { WzButtonPermissions } from '../../../../../components/common/permissions/button';
import { WzButtonPermissionsModalConfirm } from '../../../../../components/common/buttons';
import { AppNavigate } from '../../../../../react-services/app-navigate';

class WzGroupAgentsTable extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.suggestions = [
      { type: 'q', key: 'status', label: '状态', description: '按代理连接状态过滤', operators: ['=', '!=',], values: ['active', 'disconnected', 'never_connected'] },
      { type: 'q', key: 'os.platform', label: '操作系统平台', description: '按操作系统平台过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('os.platform', value, {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', key: 'ip', label: 'ip', description: '按IP过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('ip', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', key: 'name', label: '名称', description: '按代理名称过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('name', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', key: 'id', label: 'id', description: '按代理ID过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('id', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', key: 'node_name', label: '节点名称', description: '按节点名称过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('node_name', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', key: 'manager', label: '管理员', description: '按管理员过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('manager', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', key: 'version', label: '版本', description: '按代理版本过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('version', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', key: 'configSum', label: '配置校验和', description: '按代理配置校验和过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('configSum', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      { type: 'q', key: 'mergedSum', label: '组校验和', description: '按代理组校验和过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('mergedSum', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      //{ type: 'q', label: 'dateAdd', description: 'Filter by add date', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('dateAdd', value,  {q: `group=${this.props.state.itemDetail.name}`})},
      //{ type: 'q', label: 'lastKeepAlive', description: 'Filter by last keep alive', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('lastKeepAlive', value,  {q: `group=${this.props.state.itemDetail.name}`})},
    ]
    this.groupsHandler = GroupsHandler;

    this.columns = [
      {
        field: 'id',
        name: 'Id',
        align: 'left',
        sortable: true
      },
      {
        field: 'name',
        name: '名称',
        align: 'left',
        sortable: true
      },
      {
        field: 'ip',
        name: 'Ip',
        align: 'left',
        sortable: true
      },
      {
        field: 'status',
        name: '状态',
        align: 'left',
        sortable: true,
        render: status => {
          const color = status => {
            if (status.toLowerCase() === 'active') {
              return 'success';
            } else if (status.toLowerCase() === 'disconnected') {
              return 'danger';
            } else if (status.toLowerCase() === 'never_connected') {
              return 'subdued';
            }
          };
          const statusText = {
            never_connected: '从未连接',
            disconnected: '未连接',
            active: '已连接',
            pending: '挂起'
          }
      
          return <EuiHealth color={color(status)}><span className={'hide-agent-status'}>{statusText[status] ? statusText[status] : status}</span></EuiHealth>;
        }
      },
      {
        field: 'os.name',
        name: '操作系统',
        align: 'left',
        sortable: true
      },
      {
        field: 'os.version',
        name: '操作系统版本',
        align: 'left',
        sortable: true
      },
      // {
      //   field: 'version',
      //   name: '版本',
      //   align: 'left',
      //   sortable: true
      // },
      {
        name: '操作',
        align: 'left',
        render: item => {
          return (
            <div>
              {/* <WzButtonPermissions
                buttonType='icon'
                permissions={[{action: 'agent:read', resource: `agent:id:${item.id}`}]}
                tooltip={{position: 'top', content: '代理详情'}}
                aria-label="代理详情"
                iconType="eye"
                onClick={async (ev) => {
                  // this.props.groupsProps.showAgent(item);
                  AppNavigate.navigateToModule(ev, 'agents', { "tab": "welcome", "agent": item.id, });
                }}
                color="primary"
              /> */}
              <WzButtonPermissionsModalConfirm
                buttonType='icon'
                permissions={[{action: 'agent:modify_group', resource: `agent:id:${item.id}`}]}
                tooltip={{position: 'top', content: '从该组移除代理'}}
                aria-label="从该组移除代理"
                iconType="trash"
                onConfirm={async () => {
                  this.removeItems([item]);
                }}
                color="danger"
                isDisabled={item.name === 'default'}
                modalTitle={`从该组移除${item.file || item.name}代理？`}
                modalProps={{
                  buttonColor: 'danger'
                }}
              />
            </div>
          );
        }
      }
    ];
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { error } = this.props.state;
    if (!error) {
      return (
          <TableWithSearchBarWzAPI 
            tableColumns={this.columns}
            tableInitialSortingField='id'
            searchBarSuggestions={this.suggestions}
            keyName="key"
            endpoint={`/groups/${this.props.state.itemDetail.name}/agents`}
            reload={this.props.state.reload}
          />
      );
    } else {
      return <EuiCallOut color="warning" title={error} iconType="gear" />;
    }
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  async removeItems(items) {
    const { itemDetail } = this.props.state;

    this.props.updateLoadingStatus(true);
    const results = items.map(async (item, i) => {
      await this.groupsHandler.deleteAgent(item.id, itemDetail.name);
    });

    Promise.all(results).then(
      completed => {
        this.props.updateIsProcessing(true);
        this.props.updateLoadingStatus(false);
        this.props.updateReload();
        this.showToast('success', '成功', '删除成功', 3000);
      },
      error => {
        this.props.updateIsProcessing(true);
        this.props.updateLoadingStatus(false);
        this.props.updateReload();
        this.showToast('danger', '警告', error, 3000);
      }
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.groupsReducers
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateLoadingStatus: status => dispatch(updateLoadingStatus(status)),
    updateFileContent: content => dispatch(updateFileContent(content)),
    updateIsProcessing: isProcessing =>
      dispatch(updateIsProcessing(isProcessing)),
    updatePageIndexAgents: pageIndexAgents =>
      dispatch(updatePageIndexAgents(pageIndexAgents)),
    updateShowModal: showModal => dispatch(updateShowModal(showModal)),
    updateListItemsForRemove: itemList =>
      dispatch(updateListItemsForRemove(itemList)),
    updateSortDirectionAgents: sortDirectionAgents =>
      dispatch(updateSortDirectionAgents(sortDirectionAgents)),
    updateSortFieldAgents: sortFieldAgents =>
      dispatch(updateSortFieldAgents(sortFieldAgents)),
    updateReload: () => dispatch(updateReload())
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WzGroupAgentsTable);
