/*
 * Wazuh app - React component for the adding an API entry form.
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
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCodeBlock,
  EuiText,
  EuiSpacer,
  EuiCode,
  EuiButton,
  EuiButtonEmpty,
  EuiSteps,
  EuiBasicTable,
  EuiHealth,
  EuiCallOut,
  EuiLoadingSpinner,
  EuiToolTip,
  EuiButtonIcon,
  EuiPanel
} from '@elastic/eui';

export class ApiIsDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'incomplete',
      fetchingData: false,
      apiEntries: [],
      refreshingEntries: false
    };
  }

  componentDidMount() {
    this.setState({
      apiEntries: [...this.props.apiEntries]
    });
  }

  /**
   * Checks again the connection in order to know the state of the API entries
   */
  async checkConnection() {
    try {
      let status = 'complete';
      this.setState({ error: false });
      const hosts = await this.props.getHosts();
      this.setState({
        fetchingData: true,
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
          this.props.setDefault(entry);
        } catch (error) {
          numErr = numErr + 1;
          const code = ((error || {}).data || {}).code;
          const downReason = typeof error === 'string' ? error :
            (error || {}).message || ((error || {}).data || {}).message || 'Wazuh is not reachable';
          const status = code === 3099 ? 'down' : 'unknown';
          entries[idx].status = { status, downReason };
        }
      }
      if (numErr) {
        status = numErr >= entries.length ? 'danger' : 'warning';
      }
      this.setState({
        apiEntries: entries,
        fetchingData: false,
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
        this.setState({ error: error.data.message, status: 'danger' });
      }
    }
  }

  render() {
    const apiExample = `# Example Wazuh API configuration
hosts:
    - production:
        url: https://172.16.1.2
        port: 55000
        username: wazuh-wui
        password: wazuh-wui
        run_as: false
`;

    const checkConnectionChildren = (
      <div>
        <EuiText>
        检查Kibana服务器是否可以连接配置的API。
        </EuiText>
        <EuiSpacer />
        <EuiButton
          onClick={async () => await this.checkConnection()}
          isLoading={this.state.fetchingData}
        >
          检查连接
        </EuiButton>
        {this.state.status !== 'danger' &&
          this.state.status !== 'incomplete' && (
            <EuiButtonEmpty onClick={() => this.props.closeApiIsDown()}>
              关闭
            </EuiButtonEmpty>
          )}
        <EuiSpacer />
        <EuiText>已经配置的API</EuiText>
        <EuiSpacer />
        {(!this.state.error && (
          <EuiBasicTable
            loading={this.state.refreshingEntries}
            items={this.state.apiEntries}
            noItemsMessage="无数据"
            columns={[
              { field: 'id', name: 'ID' },
              { field: 'url', name: '地址' },
              { field: 'port', name: '端口' },
              {
                field: 'status',
                name: 'Status',
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
                            aria-label="Info about the error"
                            onClick={() =>
                              this.props.copyToClipBoard(item.downReason)
                            }
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
                            aria-label="Info about the error"
                            onClick={() =>
                              this.props.copyToClipBoard(item.downReason)
                            }
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
              }
            ]}
          />
        )) || (
          <EuiCallOut
            color="danger"
            iconType="cross"
            title={this.state.error}
          />
        )}
      </div>
    );

    const steps = [
      {
        title: '检查API服务的状态',
        children: (
          <div>
            <EuiText>For Systemd</EuiText>
            <EuiSpacer />
            <EuiCode>$ sudo systemctl status wazuh-manager</EuiCode>
            <EuiSpacer />
            <EuiText>For SysV Init</EuiText>
            <EuiSpacer />
            <EuiCode>$ sudo service wazuh-manager status</EuiCode>
          </div>
        )
      },
      {
        title: '检查配置',
        children: (
          <div>
            <EuiText>
              查看{' '}
              <EuiCode>
                /usr/share/kibana/data/wazuh/config/wazuh.yml
              </EuiCode>{' '}
              文件的配置。
            </EuiText>
            <EuiSpacer />
            <EuiCodeBlock language="yaml">{apiExample}</EuiCodeBlock>
          </div>
        )
      },
      {
        title: '测试配置',
        children: checkConnectionChildren,
        status: this.state.status
      }
    ];
    return (
      <EuiFlexGroup>
        <EuiFlexItem />
        <EuiFlexItem className="min-guide-width">
          <EuiPanel>
            <EuiText>
              <h2>API似乎宕机了</h2>
            </EuiText>
            <EuiSpacer />
            <EuiSteps firstStepNumber={1} steps={steps} />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem />
      </EuiFlexGroup>
    );
  }
}

ApiIsDown.propTypes = {
  apiEntries: PropTypes.array,
  checkManager: PropTypes.func,
  setDefault: PropTypes.func,
  closeApiIsDown: PropTypes.func,
  updateClusterInfoInRegistry: PropTypes.func,
  getHosts: PropTypes.func,
  copyToClipboard: PropTypes.func
};
