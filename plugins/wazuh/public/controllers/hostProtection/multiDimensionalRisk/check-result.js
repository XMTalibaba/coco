import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiButtonEmpty,
  EuiBasicTable,
  EuiTabs,
  EuiTab,
  EuiPanel,
} from '@elastic/eui';
import { getToasts } from '../../../kibana-services';
import GroupsHandler from '../../management/components/management/groups/utils/groups-handler';
import { WzRequest } from '../../../react-services/wz-request';
import { formatUIDate } from '../../../react-services/time-service'

export class CheckResult extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      sortField: 'scan.time',
      sortDirection: 'asc',
      isLoading: false,
      pageIndex2: 0,
      pageSize2: 15,
      totalItems2: 0,
      listItems2: [],
      sortField2: 'name',
      sortDirection2: 'asc',
      isLoading2: false,
      tabs: [{ id: 'ports', name: '网络端口' }, { id: 'packages', name: '程序包' }],
      selectView: 'ports'
    }
    this.groupsHandler = GroupsHandler;
  }

  async componentDidMount() {
    this._isMount = true;
    await this.getItems();
    await this.getItems2();
  }
  
  async componentDidUpdate(prevProps, prevState) {
    if (prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize
      || prevState.sortField !== this.state.sortField
      || prevState.sortDirection !== this.state.sortDirection) {
      await this.getItems();
    }
    if (prevState.pageIndex2 !== this.state.pageIndex2
      || prevState.pageSize2 !== this.state.pageSize2
      || prevState.sortField2 !== this.state.sortField2
      || prevState.sortDirection2 !== this.state.sortDirection2) {
      await this.getItems2();
    }
  }

  renderTabs() {
		const { selectView, tabs } = this.state;
		return (
      <EuiFlexItem style={{ margin: '0 8px 0 8px' }}>
        <EuiTabs>
          {tabs.map((tab, index) => {
            return <EuiTab
							onClick={() => this.onSelectedTabChanged(tab.id)}
							isSelected={selectView === tab.id}
							key={index}
						>
							{tab.name}
						</EuiTab>
          }
          )}
        </EuiTabs>
      </EuiFlexItem>
    );
	}
	onSelectedTabChanged(id) {
    if (id !== this.state.selectView) {
			this.setState({ selectView: id });
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

  buildFilter() {
    const { pageIndex, pageSize, sortField, sortDirection } = this.state;
    const field = sortField;
    const direction = sortDirection === 'asc' ? '+' : '-';
    const filter = {
      sort: direction + field,
      offset: pageIndex * pageSize,
      limit: pageSize,
      agents_list: this.props.agentsId
    };

    return filter;
  }
  buildFilter2() {
    const { pageIndex2, pageSize2, sortField2, sortDirection2 } = this.state;
    const field = sortField2;
    const direction = sortDirection2 === 'asc' ? '+' : '-';
    const filter = {
      sort: direction + field,
      offset: pageIndex2 * pageSize2,
      limit: pageSize2,
      agents_list: this.props.agentsId
    };

    return filter;
  }

  async getItems() { // 获取ports列表
    try {
      this._isMount && this.setState({ isLoading: true });
      const rawRules = await WzRequest.apiReq('GET', `/experimental/syscollector/ports`, { params: this.buildFilter() });
      const { affected_items, total_affected_items } = ((rawRules || {}).data || {}).data;

      this._isMount &&
        this.setState({
          listItems: affected_items,
          totalItems: total_affected_items,
          isLoading: false
        });
    } catch (error) {
      this.setState({ isLoading: false });
      this.showToast(
        'danger',
        '警告',
        '网络端口列表获取失败: ' + error,
        3000
      );
    }
  }
  async getItems2() { // 获取packages列表
    try {
      this._isMount && this.setState({ isLoading2: true });
      const rawRules = await WzRequest.apiReq('GET', `/experimental/syscollector/packages`, { params: this.buildFilter2() });
      const { affected_items, total_affected_items } = ((rawRules || {}).data || {}).data;

      this._isMount &&
        this.setState({
          listItems2: affected_items,
          totalItems2: total_affected_items,
          isLoading2: false
        });
    } catch (error) {
      this.setState({ isLoading2: false });
      this.showToast(
        'danger',
        '警告',
        '程序包列表获取失败: ' + error,
        3000
      );
    }
  }

  renderTime(time) {
    return formatUIDate(time);
  }

  columns() {
    return [
      {
        field: 'agent_id',
        name: '代理ID',
        align: 'left'
      },
      {
        field: 'local.ip',
        name: '本地IP',
        align: 'left',
        sortable: true
      },
      {
        field: 'local.port',
        name: '本地端口',
        align: 'left',
        sortable: true
      },
      {
        field: 'state',
        name: '状态',
        align: 'left',
        sortable: true
      },
      {
        field: 'protocol',
        name: '协议',
        align: 'left',
        sortable: true
      },
      {
        field: 'scan.time',
        name: '扫描时间',
        align: 'left',
        sortable: true,
        render: this.renderTime
      }
    ];
  }
  columns2() {
    return [
      {
        field: 'agent_id',
        name: '代理ID',
        align: 'left'
      },
      {
        field: 'name',
        name: '名称',
        align: 'left',
        sortable: true
      },
      {
        field: 'architecture',
        name: '体系结构',
        align: 'left',
        sortable: true
      },
      {
        field: 'version',
        name: '版本',
        align: 'left',
        sortable: true
      },
      {
        field: 'description',
        name: '描述',
        align: 'left',
        sortable: true
      },
    ];
  }
  tableRender() {
    const {
      listItems,
      isLoading,
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
      totalItems,
    } = this.state;
    const columns = this.columns();
    const pagination = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalItemCount: totalItems,
      pageSizeOptions: [15, 25, 50, 100]
    }
    const onTableChange = ({ page = {}, sort = {} }) => {
      const { index: pageIndex, size: pageSize } = page;
      const { field: sortField, direction: sortDirection } = sort;
      this._isMount && this.setState({
        pageIndex,
        pageSize,
        sortField,
        sortDirection
      });
    };
    const sorting = {
      sort: {
        field: sortField,
        direction: sortDirection
      }
    };

    return (
      <EuiBasicTable
        items={listItems}
        itemId="id"
        columns={columns}
        sorting={sorting}
        pagination={pagination}
        onChange={onTableChange}
        loading={isLoading}
        noItemsMessage="无数据"
      />
    );
  }
  tableRender2() {
    const {
      listItems2,
      isLoading2,
      pageIndex2,
      pageSize2,
      sortField2,
      sortDirection2,
      totalItems2,
    } = this.state;
    const columns = this.columns2();
    const pagination = {
      pageIndex: pageIndex2,
      pageSize: pageSize2,
      totalItemCount: totalItems2,
      pageSizeOptions: [15, 25, 50, 100]
    }
    const onTableChange = ({ page = {}, sort = {} }) => {
      const { index: pageIndex2, size: pageSize2 } = page;
      const { field: sortField2, direction: sortDirection2 } = sort;
      this._isMount && this.setState({
        pageIndex2,
        pageSize2,
        sortField2,
        sortDirection2
      });
    };
    const sorting = {
      sort: {
        field: sortField2,
        direction: sortDirection2
      }
    };

    return (
      <EuiBasicTable
        items={listItems2}
        itemId="id"
        columns={columns}
        sorting={sorting}
        pagination={pagination}
        onChange={onTableChange}
        loading={isLoading2}
        noItemsMessage="无数据"
      />
    );
  }

  render() {
    const table = this.tableRender();
    const table2 = this.tableRender2();
		const tabs = this.renderTabs();
    const { selectView } = this.state;
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
              <h2>检测结果</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="s"
              onClick={() => this.props.toList()}
              iconType="cross"
            >
              关闭
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs"></EuiSpacer>
        <EuiFlexGroup>
          {tabs}
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        { selectView === 'ports' && (
          <EuiPanel>{table}</EuiPanel>
        )}
        { selectView === 'packages' && (
          <EuiPanel>{table2}</EuiPanel>
        )}
      </div>
    )
  }
}