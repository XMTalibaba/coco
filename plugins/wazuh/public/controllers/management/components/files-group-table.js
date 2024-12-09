/*
 * Wazuh app - React component for building the groups table.
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
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiInMemoryTable,
  EuiButtonIcon,
  EuiFlexItem,
  EuiFlexGroup,
  EuiPanel,
  EuiTitle,
  EuiButtonEmpty,
  EuiText,
  EuiToolTip
} from '@elastic/eui';

import { ExportConfiguration } from '../../agent/components/export-configuration';
import { ReportingService } from '../../../react-services/reporting';

export class FilesInGroupTable extends Component {
  constructor(props) {
    super(props);
    this.reportingService = new ReportingService();

    this.state = {
      groupName: this.props.group.name || 'Group',
      files: [],
      originalfiles: [],
      isLoading: false
    };

    this.filters = { name: 'search', value: '' };
  }

  async componentDidMount() {
    try {
      const files = await this.props.getFilesFromGroup(this.props.group.name);
      this.setState({
        files: files,
        originalfiles: files
      });
    } catch (error) {
      console.error('安装组件时出错 ', error);
    }
  }

  onQueryChange = ({ query }) => {
    if (query) {
      this.setState({ isLoading: true });
      const filter = query.text || '';
      this.filters.value = filter;
      const items = filter
        ? this.state.originalfiles.filter(item => {
            return item.filename.toLowerCase().includes(filter.toLowerCase());
          })
        : this.state.originalfiles;
      this.setState({
        isLoading: false,
        files: items
      });
    }
  };

  /**
   * Refresh the agents
   */
  async refresh() {
    try {
      this.setState({ refreshingFiles: true });
      const files = await this.props.getFilesFromGroup(this.props.group.name);
      this.setState({
        originalfiles: files,
        refreshingFiles: false
      });
    } catch (error) {
      this.setState({ refreshingFiles: false });
      console.error('刷新文件时出错 ', error);
    }
  }

  render() {
    const columns = [
      {
        field: 'filename',
        name: '文件',
        sortable: true
      },
      {
        field: 'hash',
        name: '校验和',
        sortable: true
      },
      {
        name: '操作',

        render: item => {
          return (
            <EuiToolTip position="right" content="查看文件内容">
              <EuiButtonIcon
                aria-label="查看文件内容"
                onClick={() => 
                  this.props.openFileContent(
                    this.state.groupName,
                    item.filename
                  )
                }
                iconType="eye"
              />
            </EuiToolTip>
          );
        }
      }
    ];

    const search = {
      onChange: this.onQueryChange,
      box: {
        incremental: this.state.incremental,
        schema: true
      }
    };

    return (
      <EuiPanel paddingSize="l" className="wz-margin-16">
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle>
                  <h2>{this.state.groupName}</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              iconSide="left"
              iconType="pencil"
              onClick={() => this.props.editConfig()}
            >
              编辑组配置
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <ExportConfiguration
              exportConfiguration={enabledComponents =>
                this.reportingService.startConfigReport(
                  this.props.state.itemDetail,
                  'groupConfig',
                  enabledComponents
                )
              }
              type='group'
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              iconType="importAction"
              onClick={async () =>
                await this.props.export(this.state.groupName, [this.filters])
              }
            >
              download
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty iconType="refresh" onClick={() => this.refresh()}>
              刷新
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText color="subdued" style={{ paddingBottom: '15px' }}>
              您可以从此处列出并查看您的组文件，也可以编辑组配置
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiInMemoryTable
          itemId="id"
          items={this.state.files}
          columns={columns}
          search={search}
          pagination={true}
          loading={this.state.refreshingFiles || this.state.isLoading}
        />
      </EuiPanel>
    );
  }
}

FilesInGroupTable.propTypes = {
  group: PropTypes.object,
  getFilesFromGroup: PropTypes.func,
  export: PropTypes.func,
  exportConfigurationProps: PropTypes.object,
  editConfig: PropTypes.func,
  openFileContent: PropTypes.func
};
