import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiButtonEmpty,
	EuiText,
  EuiButton,
  EuiBasicTable,
} from '@elastic/eui';
import { getToasts } from '../../../kibana-services';
import GroupsHandler from '../../management/components/management/groups/utils/groups-handler';

export class GroupAgentList extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      totalItems: 0,
      agentsItems: [],
      agentsTable: React.createRef(),
      sortField: 'id',
      sortDirection: 'asc',
      isLoading: false,
      selectedAgents: [],
      initSelectAgents: [],
    }
    this.groupsHandler = GroupsHandler;
  }

  async componentDidMount() {
    this._isMount = true;
    await this.getItems();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (!(_.isEqual(prevState.filters, this.state.filters))
      || prevState.sortField !== this.state.sortField
      || prevState.sortDirection !== this.state.sortDirection) {
      await this.getItems();
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
    const { sortField, sortDirection } = this.state;
    const field = sortField;
    const direction = sortDirection === 'asc' ? '+' : '-';
    const filter = {
      sort: direction + field
    };

    return filter;
  }

  async getItems() { // 获取规则列表
    try {
      this._isMount && this.setState({ isLoading: true });
      const rawRules = await this.groupsHandler.agentsGroup(this.props.detailsItem.name, { params: this.buildFilter() });
      const { affected_items, total_affected_items } = ((rawRules || {}).data || {}).data;

      this._isMount &&
        this.setState({
          agentsItems: affected_items,
          totalItems: total_affected_items,
          isLoading: false
        });
    } catch (error) {
      this.setState({ isLoading: false });
      this.showToast(
        'danger',
        '警告',
        '代理列表获取失败: ' + error,
        3000
      );
    }
  }

  columns() {
    return [
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
        sortable: true
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
      {
        field: 'version',
        name: '版本',
        align: 'left',
        sortable: true
      }
    ];
  }
  tableRender() {
    const {
      agentsItems,
      isLoading,
      sortField,
      sortDirection,
      agentsTable,
    } = this.state;
    const columns = this.columns();
    const onSelectionChange = (selectedItems) => {
      if (selectedItems.length > 10) {
        this.state.agentsTable.current.setSelection(this.state.selectedAgents);
        this.showToast(
          'danger',
          '警告',
          '最多只能选择10条代理 ',
          3000
        );
      }
      else {
        this.setState({ selectedAgents: selectedItems });
      }
    };
    const selection = {
      selectable: () => true,
      onSelectionChange: onSelectionChange,
      initialSelected: this.state.initSelectAgents,
    };
    const onTableChange = ({ page = {}, sort = {} }) => {
      const { field: sortField, direction: sortDirection } = sort;
      this._isMount && this.setState({
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
        ref={agentsTable}
        items={agentsItems}
        itemId="id"
        columns={columns}
        sorting={sorting}
        isSelectable={true}
        selection={selection}
        onChange={onTableChange}
        loading={isLoading}
        noItemsMessage="无数据"
      />
    );
  }

  async saveDate() {
    let agents = this.state.selectedAgents.map(item => item.id).join(',');
    this.props.toCheck(agents);
  }

  render() {
    const table = this.tableRender();
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
              <h2>选择代理</h2>
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
        {table}
        <EuiSpacer></EuiSpacer>
        <EuiButton
          size="s"
          onClick={() => this.saveDate()}
        >
          查询
        </EuiButton>
      </div>
    )
  }
}