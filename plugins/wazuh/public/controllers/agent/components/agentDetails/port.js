import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiBasicTable,
  EuiFieldSearch,
  EuiButton,
} from '@elastic/eui';
import { WzRequest } from '../../../../react-services/wz-request';
import { KeyEquivalence } from '../../../../../common/csv-key-equivalence';
import { formatUIDate } from '../../../../react-services/time-service';
import { AppState } from '../../../../react-services/app-state';
import { processColumns, portsColumns, packagesColumns } from '../../../../components/agents/syscollector/columns';

export class Port extends Component {
  constructor(props) {
		super(props);
		this.state = {
      pageIndex: 0,
      pageSize: 15,
      sortField: '',
      sortDirection: 'asc',
      totalItems: 0,
      listItems: [],
      search: '',
      soPlatform: 'linux',
      isLoading: false
    };
    this.textSearchTimer = null;
	}

  async componentDidMount() {
    this._isMount = true;
    const { selectAgent } = this.props;
    let soPlatform;
    if (((selectAgent.os || {}).uname || '').includes('Linux')) {
      soPlatform = 'linux';
    } else if ((selectAgent.os || {}).platform === 'windows') {
      soPlatform = 'windows';
    } else if ((selectAgent.os || {}).platform === 'darwin') {
      soPlatform = 'apple';
    }
    this.setState({ soPlatform });

    if (this.props.selectView === 'port') this.getItems();
  }
  async componentDidUpdate(prevProps, prevState) {
    if ((this.props.selectAgent.id && this.props.selectView === 'port')
      && (prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize
      || prevState.sortField !== this.state.sortField
      || prevState.sortDirection !== this.state.sortDirection)) {
      await this.getItems();
    }
  }

  async getItems() {
    try {
      this.setState({ isLoading: true });
      const { selectAgent } = this.props;
      const rawItems = await WzRequest.apiReq(
        'GET',
        `/syscollector/${selectAgent.id}/ports`,
        { params: this.buildFilter() }
      );

      const formatedAgents = (
        ((rawItems || {}).data || {}).data || {}
      ).affected_items;

      this.setState({
        listItems: formatedAgents,
        totalItems: (((rawItems || {}).data || {}).data || {}).total_affected_items,
        isLoading: false
      });
        
    } catch (error) {
      this.setState({ isLoading: false });
    }
  }

  buildFilter() {
    const { pageIndex, pageSize, search } = this.state;

    const filter = {
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize,
      ...this.buildSortFilter()
    };
    if (search) filter.search = search;

    return filter;
  }

  buildSortFilter() {
    const { sortField, sortDirection } = this.state;

    const field = sortField;
    const direction = sortDirection === 'asc' ? '+' : '-';

    return !!field ? { sort: `${direction}${field}` } : {};
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
    });
  };

  changeSearch(e) {
    this.setState({ search: e.target.value });
    if (this.textSearchTimer) clearTimeout(this.textSearchTimer);
    this.textSearchTimer = null;
    this.textSearchTimer = setTimeout(() => {
      this.getItems()
      clearTimeout(this.textSearchTimer);
      this.textSearchTimer = null;
    }, 500);
  }

  getColumns() {
    let columns = [];
    const { soPlatform } = this.state;
    const arr = soPlatform ? portsColumns[soPlatform] : [];
    columns = arr.map(item => {
      if (item.id === 'scan_time') {
        return {
          field: item.id,
          name: item.label || KeyEquivalence[item.id] || item.id,
          sortable: typeof item.sortable !== 'undefined' ? item.sortable : true,
          width: item.width || undefined,
          render: field => formatUIDate(field)
        }
      }
      return {
        field: item.id,
        name: item.label || KeyEquivalence[item.id] || item.id,
        sortable: typeof item.sortable !== 'undefined' ? item.sortable : true,
        width: item.width || undefined,
      };
    });
    return columns;
  }

  tableRender() {
    const {
      listItems,
      totalItems,
      pageIndex,
      sortField,
      sortDirection,
      pageSize,
      isLoading,
      search,
    } = this.state;
    const columns = this.getColumns();

    const pagination =
      totalItems > 15
        ? {
          pageIndex: pageIndex,
          pageSize: pageSize,
          totalItemCount: totalItems,
          pageSizeOptions: [15, 25, 50, 100]
        }
        : false;
    const sorting = {
      sort: {
        field: sortField,
        direction: sortDirection
      }
    };

    return (
      <div>
        <EuiFieldSearch
          placeholder={`过滤端口列表`}
          value={search}
          fullWidth={true}
          onChange={e => this.changeSearch(e)}
          aria-label={`过滤端口列表`}
        />
        <EuiSpacer size="m" />
        <EuiBasicTable
          items={listItems}
          columns={columns}
          pagination={pagination}
          loading={isLoading}
          sorting={sorting}
          onChange={this.onTableChange}
          noItemsMessage="未找到数据"
        />
      </div>
    )
  }

  async downloadCsv () {
    const { selectAgent } = this.props;
    const { search } = this.state;
    const csvKey = ['local', 'remote', 'process', 'pid', 'protocol', 'state', 'agent_id', 'agent_ip', 'agent_name'];
    await AppState.downloadCsv(
      `/syscollector/${selectAgent.id}/ports`,
      `${selectAgent.name}-端口.csv`,
      !!search ? [{ name: 'search', value: search }] : [],
      csvKey
    )
  }

  render() {
    const { totalItems } = this.state;
    const table = this.tableRender();
		return (
			<div>
				<EuiSpacer size="m"></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiTitle size={'xs'} style={{ padding: '6px 0px' }}>
              <h4>{`端口`}</h4>
            </EuiTitle>
          </EuiFlexItem>
          { totalItems > 0 && 
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.downloadCsv()}
            >
              导出CSV
            </EuiButton>
          </EuiFlexItem>
          }
        </EuiFlexGroup>
				<EuiSpacer size="s"></EuiSpacer>
        {table}
			</div>
		);
	}

}