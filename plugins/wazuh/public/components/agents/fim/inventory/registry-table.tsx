
/*
 * Wazuh app - Integrity monitoring components
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
  EuiFlexGroup,
  EuiFlexItem,
  EuiBasicTable,
  EuiOverlayMask,
  Direction
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';
import { WzRequest } from '../../../../react-services/wz-request';
import { FlyoutDetail } from './flyout';
import { filtersToObject } from '../../../wz-search-bar';

export class RegistryTable extends Component {
  state: {
    syscheck: [],
    error?: string
    pageIndex: number
    pageSize: number
    totalItems: number
    sortField: string
    isFlyoutVisible: Boolean
    sortDirection: Direction
    isLoading: boolean
    currentFile: {
      file: string,
      type: string
    },
    syscheckItem: {}
  };

  props!: {
    filters: []
    totalItems: number
  }

  constructor(props) {
    super(props);

    this.state = {
      syscheck: [],
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      sortField: 'file',
      sortDirection: 'asc',
      isLoading: true,
      isFlyoutVisible: false,
      currentFile: {
        file: "",
        type: '',
      },
      syscheckItem: {}
    }
  }

  async componentDidMount() {
    await this.getSyscheck();
    const regex = new RegExp('file=' + '[^&]*');
    const match = window.location.href.match(regex);
    this.setState({ totalItems: this.props.totalItems });
    if (match && match[0]) {
      const file = match[0].split('=')[1];
      this.showFlyout(decodeURIComponent(file), true);
    }
  }

  componentDidUpdate(prevProps) {
    const { filters } = this.props;
    if (JSON.stringify(filters) !== JSON.stringify(prevProps.filters)) {
      this.setState({ pageIndex: 0, isLoading: true }, this.getSyscheck)
    }
  }

  closeFlyout() {
    this.setState({ isFlyoutVisible: false, currentFile: {} });
  }

  async showFlyout(file, item, redirect = false) {
    window.location.href = window.location.href.replace(new RegExp("&file=" + "[^\&]*", 'g'), "");
    let fileData = false;
    if (!redirect) {
      fileData = this.state.syscheck.filter(item => {
        return item.file === file;
      })
    } else {
      const response = await WzRequest.apiReq('GET', `/syscheck/${this.props.agent.id}`, {
        params: {
          'file': file
        }
      });
      fileData = ((response.data || {}).data || {}).affected_items || [];
    }
    if (!redirect)
      window.location.href = window.location.href += `&file=${file}`;
    //if a flyout is opened, we close it and open a new one, so the components are correctly updated on start.
    const currentFile = {
      file,
      type: item.type
    }
    this.setState({ isFlyoutVisible: false }, () => this.setState({ isFlyoutVisible: true, currentFile, syscheckItem: item }));
  }

  async getSyscheck() {
    const agentID = this.props.agent.id;
    try {
      const syscheck = await WzRequest.apiReq(
        'GET',
        `/syscheck/${agentID}`,
        { params: this.buildFilter() }
      );

      this.setState({
        syscheck: (((syscheck || {}).data || {}).data || {}).affected_items || {},
        totalItems: (((syscheck || {}).data || {}).data || {}).total_affected_items - 1,
        isLoading: false,
        error: undefined,
      });
    } catch (error) {
      this.setState({ error, isLoading: false })
    }
  }

  buildSortFilter() {
    const { sortField, sortDirection } = this.state;

    const field = (sortField === 'os_name') ? '' : sortField;
    const direction = (sortDirection === 'asc') ? '+' : '-';

    return direction + field;
  }

  buildFilter() {
    const { pageIndex, pageSize } = this.state;
    const filters = filtersToObject(this.props.filters);

    const filter = {
      ...filters,
      offset: pageIndex * pageSize,
      limit: pageSize,
      sort: this.buildSortFilter(),
      q: 'type=registry_key'
    };

    return filter;
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
      isLoading: true,
    },
      () => this.getSyscheck()
    );
  };

  columns() {
    return [
      {
        field: 'file',
        name: '注册',
        sortable: true,
      },
      {
        field: 'mtime',
        name: '最后修改',
        sortable: true,
        width: '200px',
      }
    ]
  }

  renderRegistryTable() {
    const getRowProps = item => {
      const { file } = item;
      return {
        'data-test-subj': `row-${file}`,
        onClick: () => this.showFlyout(file, item),
      };
    };

    const { syscheck, pageIndex, pageSize, totalItems, sortField, sortDirection, isLoading, error } = this.state;
    const columns = this.columns();
    const pagination = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalItemCount: totalItems,
      pageSizeOptions: [15, 25, 50, 100],
    }
    const sorting = {
      sort: {
        field: sortField,
        direction: sortDirection,
      },
    };

    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiBasicTable
            items={syscheck}
            error={error}
            columns={columns}
            pagination={pagination}
            onChange={this.onTableChange}
            rowProps={getRowProps}
            sorting={sorting}
            itemId="file"
            isExpandable={true}
            loading={isLoading}
            noItemsMessage="无数据"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  render() {
    const registryTable = this.renderRegistryTable();
    return (
      <div>
        {registryTable}
        {this.state.isFlyoutVisible && (
          <EuiOverlayMask
            headerZindexLocation="below"
            onClick={() => this.closeFlyout()}
          >
            <FlyoutDetail
              fileName={this.state.currentFile.file}
              agentId={this.props.agent.id}
              item={this.state.syscheckItem}
              closeFlyout={() => this.closeFlyout()}
              type= {this.state.currentFile.type}
              view='inventory'
              {...this.props} />
          </EuiOverlayMask>
        )}
      </div>
    )
  }
}