import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiBasicTable,
  EuiFieldSearch,
  EuiButton,
  EuiText,
  EuiSelect,
} from '@elastic/eui';
import { WzRequest } from '../../../../react-services/wz-request';
import { KeyEquivalence } from '../../../../../common/csv-key-equivalence';
import { formatUIDate } from '../../../../react-services/time-service';
import { AppState } from '../../../../react-services/app-state';
import { processColumns, portsColumns, packagesColumns } from '../../../../components/agents/syscollector/columns';

export class Processes extends Component {
  constructor(props) {
		super(props);
		this.state = {
      pageIndex: 0,
      pageSize: 15,
      sortField: '',
      sortDirection: 'asc',
      totalItems: 0,
      listItems: [],
      soPlatform: 'linux',
      pageType: 'all', // all：全部进程，higher：子进程权限高于父进程
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

    if (this.props.selectView === 'processes') this.getItems();
  }
  async componentDidUpdate(prevProps, prevState) {
    if ((this.props.selectAgent.id && this.props.selectView === 'processes')
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
      const { pageType } = this.state;
      const urlOptions = {
        'all': `/syscollector/${selectAgent.id}/processes`,
        'higher': `/syscollector/${selectAgent.id}/processes/abnormal?pretty=true`,
      }
      const rawItems = await WzRequest.apiReq(
        'GET',
        urlOptions[pageType],
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
    const { pageIndex, pageSize } = this.state;

    const filter = {
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize,
      ...this.buildSortFilter()
    };

    return filter;
  }

  buildSortFilter() {
    const { sortField, sortDirection } = this.state;

    const field = sortField;
    const direction = sortDirection === 'asc' ? '+' : '-';

    return !!field ? { sort: `${direction}${field}` } : {};
  }

  onSelectedPageChanged(e) {
    this.setState({ pageType: e.target.value }, this.getItems);
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

  getColumns() {
    let columns = [];
    const { soPlatform, pageType } = this.state;
    const columnsOptions = {
      'all': soPlatform ? processColumns[soPlatform] : [],
      'higher': [
        { id: 'name', width: '10%' },
        { id: 'pid' },
        { id: 'ppid' },
        { id: 'cmd', width: '15%' },
        { id: 'argvs', width: "15%" },
      ]
    }
    columns = columnsOptions[pageType].map(item => {
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
      pageType,
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

    const pageOptions = [
      { value: 'all', text: '全部进程' },
      { value: 'higher', text: '子进程权限高于父进程' },
    ]

    return (
      <div>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiText textAlign="right">{'数据类型'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 200 }}>
            <EuiSelect
              options={pageOptions}
              value={pageType}
              onChange={(e) => this.onSelectedPageChanged(e)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
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
    const { pageType } = this.state;
    const urlOptions = {
      'all': `/syscollector/${selectAgent.id}/processes`,
      'higher': `/syscollector/${selectAgent.id}/processes/abnormal?pretty=true`,
    }
    const csvKey = ['name', 'pid', 'ppid', 'cmd', 'nlwp', 'priority', 'session', 'nice', 'agent_id', 'agent_ip', 'agent_name'];
    await AppState.downloadCsv(
      urlOptions[pageType],
      `${selectAgent.name}-进程.csv`,
      [],
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
              <h4>{`进程`}</h4>
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