/*
 * Wazuh app - React component building the API entries table.
 *
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiButtonIcon,
  EuiToolTip,
  EuiHealth,
  EuiPanel,
  EuiPage,
  EuiButtonEmpty,
  EuiTitle,
  EuiText,
  EuiLoadingSpinner,
  EuiIcon
} from '@elastic/eui';
import { WzButtonPermissions } from '../../common/permissions/button';
import WzReduxProvider from '../../../redux/wz-redux-provider';
import store from '../../../redux/store';
import { updateSelectedSettingsSection } from '../../../redux/actions/appStateActions';
import { AppState } from '../../../react-services/app-state';
import { API_USER_STATUS_RUN_AS } from '../../../../server/lib/cache-api-user-has-run-as';

export class ApiTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      apiEntries: [],
      refreshingEntries: false
    };
  }

  componentDidMount() {
    store.dispatch(updateSelectedSettingsSection('api'));
    this.setState({
      apiEntries: this.props.apiEntries
    });
  }

  /**
   * Refresh the API entries
   */
  async refresh() {
    try {
      let status = 'complete';
      this.setState({ error: false });
      const hosts = await this.props.getHosts();
      this.setState({
        refreshingEntries: true,
        apiEntries: hosts
      });
      const entries = this.state.apiEntries;
      let numErr = 0;
      for (let idx in entries) {
        const entry = entries[idx];
        try {
          const data = await this.props.testApi(entry, true); // token refresh is forced
          const clusterInfo = data.data || {};
          const id = entries[idx].id;
          entries[idx].status = 'online';
          entries[idx].cluster_info = clusterInfo;
          //Updates the cluster info in the registry
          await this.props.updateClusterInfoInRegistry(id, clusterInfo);
        } catch (error) {
          numErr = numErr + 1;
          const code = ((error || {}).data || {}).code;
          const downReason = typeof error === 'string' ? error :
            (error || {}).message || ((error || {}).data || {}).message || '应用程序无法连接';
          const status = code === 3099 ? 'down' : 'unknown';
          entries[idx].status = { status, downReason };
          if(entries[idx].id === this.props.currentDefault){ // if the selected API is down, we remove it so a new one will selected
            AppState.removeCurrentAPI();
          }
        }
      }
      if (numErr) {
        if (numErr >= entries.length) this.props.showApiIsDown();
      }
      this.setState({
        apiEntries: entries,
        status: status,
        refreshingEntries: false
      });
    } catch (error) {
      if (
        error &&
        error.data &&
        error.data.message &&
        error.data.code === 2001
      ) {
        this.props.showAddApiWithInitialError(error);
      }
    }
  }

  /**
   * Checks the API connectivity
   * @param {Object} api
   */
  async checkApi(api) {
    try {
      const entries = this.state.apiEntries;
      const idx = entries.map(e => e.id).indexOf(api.id);
      try {
        await this.props.checkManager(api);
        entries[idx].status = 'online';
      } catch (error) {
        const code = ((error || {}).data || {}).code;
        const downReason = typeof error === 'string' ? error :
        (error || {}).message || ((error || {}).data || {}).message || '应用程序无法连接';
        const status = code === 3099 ? 'down' : 'unknown';
        entries[idx].status = { status, downReason }; 
      }
      this.setState({
        apiEntries: entries
      });
    } catch (error) {
      console.error('检查管理连接时出错 ', error);
    }
  }

  render() {
    const items = [...this.state.apiEntries];
    const columns = [
      {
        field: 'id',
        name: 'ID',
        align: 'left',
        sortable: true
      },
      {
        field: 'cluster_info.cluster',
        name: '集群',
        align: 'left',
        sortable: true
      },
      {
        field: 'cluster_info.manager',
        name: '管理',
        align: 'left',
        sortable: true
      },
      {
        field: 'url',
        name: '地址',
        align: 'left',
        sortable: true
      },
      {
        field: 'port',
        name: '端口',
        align: 'left',
        sortable: true
      },
      {
        field: 'username',
        name: '用户名',
        align: 'left',
        sortable: true
      },
      {
        field: 'status',
        name: '状态',
        align: 'left',
        sortable: true,
        render: item => {
          if (item) {
            return item === 'online' ? (
              <EuiHealth color="success">已连接</EuiHealth>
            ) : item.status === 'down' ? (
              <span>
                <EuiHealth color="warning">警告</EuiHealth>
                <EuiToolTip position="top" content={item.downReason}>
                  <EuiButtonIcon
                    color="primary"
                    style={{ marginTop: '-12px' }}
                    iconType="questionInCircle"
                    aria-label="错误信息"
                    onClick={() => this.props.copyToClipBoard(item.downReason)}
                  />
                </EuiToolTip>
              </span>
            ) : (
              <span>
                <EuiHealth color="danger">未连接</EuiHealth>
                <EuiToolTip position="top" content={item.downReason}>
                  <EuiButtonIcon
                    color="primary"
                    style={{ marginTop: '-12px' }}
                    iconType="questionInCircle"
                    aria-label="错误信息"
                    onClick={() => this.props.copyToClipBoard(item.downReason)}
                  />
                </EuiToolTip>
              </span>
            );
          } else {
            return (
              <span>
                <EuiLoadingSpinner size="s" />
                <span>&nbsp;&nbsp;检查</span>
              </span>
            );
          }
        }
      },
      {
        name: '运行',
        field: 'allow_run_as',
        align: 'center',
        sortable: true,
        width: '80px',
        render: (value) => {
          return value === API_USER_STATUS_RUN_AS.ENABLED ? (
            <EuiToolTip
              position='top'
              content='配置的API用户使用身份验证上下文。'
            >
              <EuiIcon
                type='check'
              />
            </EuiToolTip>
          
          ) : value === API_USER_STATUS_RUN_AS.USER_NOT_ALLOWED ? (
            <EuiToolTip
              position='top'
              content='配置的API用户不允许使用run_as。给它权限或者在主机配置中将run_as设置为false值。'
            >
              <EuiIcon
                color='danger'
                type='alert'
              />
            </EuiToolTip>
          ): '';
        }
      },
      {
        name: '操作',
        render: item => (
          <EuiFlexGroup>
            <EuiFlexItem grow={false}>
              <WzButtonPermissions
                buttonType='icon'        
                roles={[]}
                tooltip={{position: 'top', content: <p>设为默认</p>}}
                iconType={
                  item.id === this.props.currentDefault
                    ? 'starFilled'
                    : 'starEmpty'
                }
                aria-label="设为默认"
                onClick={async () => {
                  const currentDefault = await this.props.setDefault(item);
                  this.setState({
                    currentDefault
                  });
                }}
              />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiToolTip position="top" content={<p>检查连接</p>}>
                <EuiButtonIcon
                  aria-label="检查连接"
                  iconType="refresh"
                  onClick={async () => await this.checkApi(item)}
                  color="success"
                />
              </EuiToolTip>
            </EuiFlexItem>
          </EuiFlexGroup>
        )
      }
    ];

    const search = {
      box: {
        incremental: this.state.incremental,
        schema: true
      }
    };

    return (
      <EuiPage>
        <WzReduxProvider>
          <EuiPanel paddingSize="l">
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFlexGroup>
                  <EuiFlexItem>
                    <EuiTitle>
                      <h2>API配置</h2>
                    </EuiTitle>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <WzButtonPermissions
                  buttonType='empty'              
                  iconType="plusInCircle"
                  roles={[]}
                  onClick={() => this.props.showAddApi()}
                >
                  新增
                </WzButtonPermissions>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiButtonEmpty
                  iconType="refresh"
                  onClick={async () => await this.refresh()}
                >
                  刷新
                </EuiButtonEmpty>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiText color="subdued" style={{ paddingBottom: '15px' }}>
                  在这里，您可以管理和配置API条目。
                  您还可以检查它们的连接和状态。
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiInMemoryTable
              itemId="id"
              items={items}
              search={search}
              columns={columns}
              pagination={true}
              sorting={true}
              loading={this.state.refreshingEntries}
            />
          </EuiPanel>
        </WzReduxProvider>
      </EuiPage>
    );
  }
}

ApiTable.propTypes = {
  apiEntries: PropTypes.array,
  currentDefault: PropTypes.string,
  setDefault: PropTypes.func,
  checkManager: PropTypes.func,
  updateClusterInfoInRegistry: PropTypes.func,
  getHosts: PropTypes.func,
  testApi: PropTypes.func,
  showAddApiWithInitialError: PropTypes.func,
  showApiIsDown: PropTypes.func,
  copyToClipBoard: PropTypes.func
};
