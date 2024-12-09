import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiBasicTable,
  EuiText,
  EuiSelect,
  EuiButton,
} from '@elastic/eui';
import { WzRequest } from '../../../../react-services/wz-request';
import { AppState } from '../../../../react-services/app-state';

export class TaskCollect extends Component {
  constructor(props) {
		super(props);
		this.state = {
      pageIndex: 0,
      pageSize: 15,
      sortField: '',
      sortDirection: 'asc',
      totalItems: 0,
      listItems: [],
      task_type: '',
      isLoading: false
    };
    this.textSearchTimer = null;
	}

  async componentDidMount() {
    this._isMount = true;
    if (this.props.selectView === 'taskCollect') this.getItems();
  }
  async componentDidUpdate(prevProps, prevState) {
    if ((this.props.selectAgent.id && this.props.selectView === 'taskCollect')
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
			const { task_type } = this.state;
      const rawItems = await WzRequest.apiReq(
        'GET',
        `/syscollector/${selectAgent.id}/task?pretty=true${task_type ? '&task_type=' + task_type : ''}`,
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

  onSelectedChanged(e) {
    this.setState({ task_type: e.target.value }, this.getItems);
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
      task_type,
    } = this.state;
    const columns = [
      {
        field: 'task_type',
        name: '任务类型',
        sortable: true
      },
      {
        field: 'task_info',
        name: '任务名称',
        sortable: true
      }
    ];

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
    const taskTypeOptions = [
			{ value: '', text: '全部任务类型' },
			{ value: 'crontab', text: 'Crontab' },
			{ value: 'at', text: 'At & Batch' },
			{ value: 'schtasks', text: 'Schtasks' }
		]

    return (
      <div>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiText textAlign="right">{'任务类型'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 150 }}>
            <EuiSelect
              options={taskTypeOptions}
              value={task_type}
              onChange={(e) => this.onSelectedChanged(e)}
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
    const { task_type } = this.state;
    await AppState.downloadCsv(
      `/syscollector/${selectAgent.id}/task?pretty=true${task_type ? '&task_type=' + task_type : ''}`,
      `${selectAgent.name}-任务采集.csv`,
      []
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
              <h4>{`任务采集`}</h4>
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