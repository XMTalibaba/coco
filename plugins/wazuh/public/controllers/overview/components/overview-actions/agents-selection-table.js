import React, { Component, Fragment } from 'react';

import {
  EuiBadge,
  EuiHealth,
  EuiButton,
  EuiCheckbox,
  EuiFieldSearch,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiTable,
  EuiTableBody,
  EuiTableFooterCell,
  EuiTableHeader,
  EuiTableHeaderCell,
  EuiTableHeaderCellCheckbox,
  EuiTablePagination,
  EuiTableRow,
  EuiTableRowCell,
  EuiTableRowCellCheckbox,
  EuiTableSortMobile,
  EuiKeyPadMenu,
  EuiKeyPadMenuItem,
  EuiTableHeaderMobile,
  EuiButtonIcon,
  EuiIcon,
  EuiPopover,
  EuiText,
  EuiToolTip
} from '@elastic/eui';

import { WzRequest } from '../../../../react-services/wz-request';
import { LEFT_ALIGNMENT, RIGHT_ALIGNMENT, SortableProperties } from '@elastic/eui/lib/services';
import {  updateCurrentAgentData } from '../../../../redux/actions/appStateActions';
import  store  from '../../../../redux/store';
import { GroupTruncate } from '../../../../components/common/util/agent-group-truncate/'
import { WzSearchBar, filtersToObject } from '../../../../components/wz-search-bar';
import { getAgentFilterValues } from '../../../../controllers/management/components/management/groups/get-agents-filters-values';
import GroupsHandler from '../../../management/components/management/groups/utils/groups-handler';
import { TableSearch } from '../../../agent/components/table-search';
import { AppState } from '../../../../react-services/app-state';
import _ from 'lodash';

const checkField = field => {
  return field !== undefined ? field : '-';
};

export class AgentSelectionTable extends Component {
  constructor(props) {
    super(props);

    // const selectedOptions = JSON.parse(
    //   sessionStorage.getItem('agents_preview_selected_options')
    // );
    this.state = {
      itemIdToSelectedMap: {},
      itemIdToOpenActionsPopoverMap: {},
      sortedColumn: 'title',
      itemsPerPage: 10,
      pageIndex: 0,
      totalItems: 0,
      isLoading: false,
      sortDirection: 'asc',
      sortField: 'id',
      agents: [],
      selectedOptions: [],
      filters: [],
      paramsOptions: [
        {
          label: '状态',
          type: 'status',
          inputType: 'select',
          selectOptions: [
            { value: '', text: '所有状态' },
            { value: 'active', text: '已连接' },
            { value: 'disconnected', text: '未连接' },
            { value: 'never_connected', text: '从未连接' },
          ]
        },
        {
          label: '组',
          type: 'group',
          inputType: 'select',
          selectOptions: []
        },
        {
          label: 'IP',
          type: 'ip', // 参数字段
          inputType: 'text',
        },
        {
          label: '操作系统',
          type: 'os.platform',
          inputType: 'select',
          selectOptions: []
        },
        {
          label: '名称',
          type: 'name',
          inputType: 'text',
        },
      ],
      searchParams: {},
      currentUserInfo: {},
      departmentGroups: [],
    };

    this.columns = [
      {
        id: 'id',
        label: 'ID',
        alignment: LEFT_ALIGNMENT,
        width: '60px',
        mobileOptions: {
          show: true,
        },
        isSortable: true,
      },
      {
        id: 'ip',
        label: 'IP',
        alignment: LEFT_ALIGNMENT,
        mobileOptions: {
          show: true,
        },
        isSortable: true
      },
      {
        id: 'name',
        label: '主机名',
        alignment: LEFT_ALIGNMENT,
        // width: '60px',
        mobileOptions: {
          show: true,
        },
        isSortable: true,
      },
      {
        id: 'group',
        label: '组',
        alignment: LEFT_ALIGNMENT,
        mobileOptions: {
          show: false,
        },
        isSortable: true,
        render: groups => this.renderGroups(groups)
      },
      {
        id: 'tag',
        label: '标签',
        alignment: LEFT_ALIGNMENT,
        mobileOptions: {
          show: true,
        },
        isSortable: true
      },
      {
        id: 'version',
        label: '版本',
        width: '80px',
        alignment: LEFT_ALIGNMENT,
        mobileOptions: {
          show: true,
        },
        isSortable: true,
      },
      {
        id: 'os',
        label: '操作系统',
        alignment: LEFT_ALIGNMENT,
        mobileOptions: {
          show: false,
        },
        isSortable: true,
        render: os => this.addIconPlatformRender(os)
      },
      {
        id: 'status',
        label: '状态',
        alignment: LEFT_ALIGNMENT,
        mobileOptions: {
          show: true,
        },
        isSortable: true,
        width: 'auto',
        render: status => this.addHealthStatusRender(status),
      },
    ];
    this.suggestions = [
      { type: 'q', key: 'status', label: '状态', description: '按代理连接状态过滤', operators: ['=', '!=',], values: ['active', 'disconnected', 'never_connected'] },
      { type: 'q', key: 'os.platform', label: '操作系统平台', description: '按操作系统平台过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('os.platform', value, { q: 'id!=000'})},
      { type: 'q', key: 'ip', label: 'ip', description: '按代理IP过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('ip', value, { q: 'id!=000'})},
      { type: 'q', key: 'name', label: '名称', description: '按代理名称过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('name', value, { q: 'id!=000'})},
      { type: 'q', key: 'id', label: 'id', description: '按代理id过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('id', value, { q: 'id!=000'})},
      { type: 'q', key: 'group', label: '组', description: '按代理所在组过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('group', value, { q: 'id!=000'})},
      { type: 'q', key: 'node_name', label: '节点名称', description: '按节点名称过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('node_name', value, { q: 'id!=000'})},
      { type: 'q', key: 'manager', label: '管理员', description: '按管理员过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('manager', value, { q: 'id!=000'})},
      { type: 'q', key: 'version', label: '版本', description: '按代理版本过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('version', value, { q: 'id!=000'})},
      { type: 'q', key: 'configSum', label: '配置校验和', description: '按代理配置校验和过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('configSum', value, { q: 'id!=000'})},
      { type: 'q', key: 'mergedSum', label: '组校验和', description: '按代理组校验和过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('mergedSum', value, { q: 'id!=000'})},
      // { type: 'q', key: 'dateAdd', label: '添加日期', description: '按添加日期过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('dateAdd', value, { q: 'id!=000'})},
      // { type: 'q', key: 'lastKeepAlive', label: '上次连接', description: '按上次连接过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('lastKeepAlive', value, { q: 'id!=000'})},
    ];
    this.groupsHandler = GroupsHandler;
  }

  onChangeItemsPerPage = async itemsPerPage => {
    this._isMounted && this.setState({ itemsPerPage }, async () => await this.getItems());
  };

  onChangePage = async pageIndex => {
    this._isMounted && this.setState({ pageIndex }, async () => await this.getItems());
  };

  async componentDidMount() {
    this._isMounted = true;
    const tmpSelectedAgents = {};
    if(!store.getState().appStateReducers.currentAgentData.id){
      tmpSelectedAgents[store.getState().appStateReducers.currentAgentData.id] = true;
    }

    let res = await AppState.getCurrentUserInfo();

    let { paramsOptions } = this.state;
    let groupIndex = paramsOptions.findIndex(k => k.type === 'group');
    let osIndex = paramsOptions.findIndex(k => k.type === 'os.platform');
    paramsOptions[groupIndex].selectOptions = await this.getGroupsOptions();
    paramsOptions[osIndex].selectOptions = await this.getOsOptions();

    this._isMounted && this.setState({itemIdToSelectedMap: this.props.selectedAgents, paramsOptions, currentUserInfo: res});
    try{
      await this.getItems();
    }catch(error){}
  }

  componentWillUnmount(){
    this._isMounted = false;
  }

  async componentDidUpdate(prevProps, prevState) {
    if(!(_.isEqual(prevState.filters,this.state.filters))){
      await this.getItems();
    }
  }

  async getGroupsOptions() {
    try {
      let departmentGroups = await AppState.getDepartmentGroups();
      this.setState({ departmentGroups });
      let groupsOptions = departmentGroups.map(k => {
				let item = {
					value: k.name,
					text: k.name
				}
				return item;
			});
      groupsOptions.unshift({ value: '', text: '所有组' })
      return groupsOptions;
    } catch (error) {
      console.log(error)
    }
  }

  async getOsOptions() {
    try {
      const rawOsItems = await WzRequest.apiReq(
        'GET',
        '/agents/stats/distinct',
        { params: { fields: "os.platform", q: "id!=000" } }
      );
      let rawOs = ((rawOsItems || {}).data || {}).data.affected_items;
      let osOptions = rawOs.map(k => {
				let item = {
					value: k.os.platform,
					text: k.os.platform
				}
				return item;
			});
      osOptions.unshift({ value: '', text: '所有操作系统' })
      return osOptions;
    } catch (error) {
      console.log(error)
    }
  }

  getArrayFormatted(arrayText) {
    try {
      const stringText = arrayText.toString();
      const splitString = stringText.split(',');
      const resultString = splitString.join(', ');
      return resultString;
    } catch (err) {
      return arrayText;
    }
  }

  async getItems() {
    try{
      this._isMounted && this.setState({isLoading: true});
      const { searchParams, departmentGroups, currentUserInfo } = this.state;
      if (currentUserInfo.department && departmentGroups.length === 0) {
        this.setState({ isLoading: false });
        return
      }
      let params = this.buildFilter();
      Object.keys(searchParams).forEach(k => {
        if (searchParams[k]) {
          params.q = `${params.q};(${k}=${searchParams[k]})`
        }
      })
      const rawData = await WzRequest.apiReq('GET', '/agents', { params });
      const data = (((rawData || {}).data || {}).data || {}).affected_items;
      const totalItems = (((rawData || {}).data || {}).data || {}).total_affected_items;
      const formattedData = data.map((item, id) => {
        return {
          id: item.id,
          name: item.name,
          version: item.version !== undefined ? item.version.split(' ')[1] : '-',
          os: item.os || '-',
          status: item.status,
          group: item.group || '-',
          ip: item.ip || '-',
          tag: item.tag || '-'
        };
      });
      this._isMounted && this.setState({ agents: formattedData, totalItems, isLoading: false });
    }catch(err){
      this._isMounted && this.setState({ isLoading: false });
    }
  }

  agentStatusColor(status){
    if (status.toLowerCase() === 'active') {
      return 'success';
    } else if (status.toLowerCase() === 'disconnected') {
      return 'danger';
    } else if (status.toLowerCase() === 'never_connected') {
      return 'subdued';
    }
  }

  addHealthStatusRender(status) {
    const statusText = {
      never_connected: '从未连接',
      disconnected: '未连接',
      active: '已连接',
      pending: '挂起'
    }
    return (
      <EuiHealth color={this.agentStatusColor(status)} style={{ whiteSpace: 'no-wrap' }}>
        {/* {status === 'never_connected' ? 'never connected' : status} */}
        {statusText[status] ? statusText[status] : status}
      </EuiHealth>
    );
  }

  buildFilter() {
    const { itemsPerPage, pageIndex, filters, searchParams, departmentGroups, currentUserInfo } = this.state;
    const filter = {
      ...filtersToObject(filters),
      offset: (pageIndex * itemsPerPage) || 0,
      limit: pageIndex * itemsPerPage + itemsPerPage,
      ...this.buildSortFilter()
    };
    filter.q = !filter.q ? `id!=000` : `id!=000;${filter.q}`;
    if (currentUserInfo.department && !searchParams.group) {
      filter.q = `${filter.q};(${departmentGroups.map(k => `group=${k.name}`).join(',')})`
    }
    return filter;
  }

  buildSortFilter() {
    const { sortDirection, sortField } = this.state;
    const sortFilter = {};
    if (sortField) {
      const direction = sortDirection === 'asc' ? '+' : '-';
      sortFilter['sort'] = direction + (sortField === 'os'? 'os.name,os.version' : sortField);
    }

    return sortFilter;
  }

  onSort = async prop => {
    const sortField = prop;
    const sortDirection =
      this.state.sortField === prop && this.state.sortDirection === 'asc'
        ? 'desc'
        : this.state.sortDirection === 'asc'
        ? 'desc'
        : 'asc';

    this._isMounted && this.setState({ sortField, sortDirection }, async () => await this.getItems());
  };

  toggleItem = itemId => {
    this._isMounted && this.setState(previousState => {
      const newItemIdToSelectedMap = {
        [itemId]: !previousState.itemIdToSelectedMap[itemId],
      };

      return {
        itemIdToSelectedMap: newItemIdToSelectedMap,
      };
    });
  };

  toggleAll = () => {
    const allSelected = this.areAllItemsSelected();
    const newItemIdToSelectedMap = {};
    this.state.agents.forEach(item => (newItemIdToSelectedMap[item.id] = !allSelected));
    this._isMounted && this.setState({
      itemIdToSelectedMap: newItemIdToSelectedMap,
    });
  };

  isItemSelected = itemId => {
    return this.state.itemIdToSelectedMap[itemId];
  };

  areAllItemsSelected = () => {
    const indexOfUnselectedItem = this.state.agents.findIndex(item => !this.isItemSelected(item.id));
    return indexOfUnselectedItem === -1;
  };

  areAnyRowsSelected = () => {
    return (
      Object.keys(this.state.itemIdToSelectedMap).findIndex(id => {
        return this.state.itemIdToSelectedMap[id];
      }) !== -1
    );
  };

  togglePopover = itemId => {
    this._isMounted && this.setState(previousState => {
      const newItemIdToOpenActionsPopoverMap = {
        ...previousState.itemIdToOpenActionsPopoverMap,
        [itemId]: !previousState.itemIdToOpenActionsPopoverMap[itemId],
      };

      return {
        itemIdToOpenActionsPopoverMap: newItemIdToOpenActionsPopoverMap,
      };
    });
  };

  closePopover = itemId => {
    // only update the state if this item's popover is open
    if (this.isPopoverOpen(itemId)) {
      this._isMounted && this.setState(previousState => {
        const newItemIdToOpenActionsPopoverMap = {
          ...previousState.itemIdToOpenActionsPopoverMap,
          [itemId]: false,
        };

        return {
          itemIdToOpenActionsPopoverMap: newItemIdToOpenActionsPopoverMap,
        };
      });
    }
  };

  isPopoverOpen = itemId => {
    return this.state.itemIdToOpenActionsPopoverMap[itemId];
  };

  renderSelectAll = mobile => {
    if (!this.state.isLoading && this.state.agents.length) {
      return (
        <EuiCheckbox
          id="selectAllCheckbox"
          label={mobile ? '全选' : null}
          checked={this.areAllItemsSelected()}
          onChange={this.toggleAll.bind(this)}
          type={mobile ? null : 'inList'}
        />
      );
    }
  };

  getTableMobileSortItems() {
    const items = [];
    this.columns.forEach(column => {
      if (column.isCheckbox || !column.isSortable) {
        return;
      }
      items.push({
        name: column.label,
        key: column.id,
        onSort: this.onSort.bind(this, column.id),
        isSorted: this.state.sortField === column.id,
        isSortAscending: this.state.sortDirection === 'asc',
      });
    });
    return items.length ? items : null;
  }

  renderHeaderCells() {
    const headers = [];

    this.columns.forEach((column, columnIndex) => {
      if (column.isCheckbox) {
        headers.push(
          <EuiTableHeaderCellCheckbox key={column.id} width={column.width}>
          </EuiTableHeaderCellCheckbox>
        );
      } else {
        headers.push(
          <EuiTableHeaderCell
            key={column.id}
            align={this.columns[columnIndex].alignment}
            width={column.width}
            onSort={column.isSortable ? this.onSort.bind(this, column.id) : undefined}
            isSorted={this.state.sortField === column.id}
            isSortAscending={this.state.sortDirection === 'asc'}
            mobileOptions={column.mobileOptions}
          >
            {column.label}
          </EuiTableHeaderCell>
        );
      }
    });
    return headers.length ? headers : null;
  }

  renderRows() {
    const renderRow = item => {
      const cells = this.columns.map(column => {
        const cell = item[column.id];

        let child;

        if (column.isCheckbox) {
          return (
            <EuiTableRowCellCheckbox key={column.id}>
              <EuiCheckbox
                id={`${item.id}-checkbox`}
                checked={this.isItemSelected(item.id)}
                onChange={() => {}}
                type="inList"
              />
            </EuiTableRowCellCheckbox>
          );
        }

        if (column.render) {
          child = column.render(item[column.id]);
        } else {
          child = cell;
        }

        return (
          <EuiTableRowCell
            key={column.id}
            align={column.alignment}
            truncateText={cell && cell.truncateText}
            textOnly={cell ? cell.textOnly : true}
            mobileOptions={{
              header: column.label,
              ...column.mobileOptions,
            }}
          >
            {child}
          </EuiTableRowCell>
        );
      });

      return (
        <EuiTableRow
          key={item.id}
          isSelected={this.isItemSelected(item.id)}
          isSelectable={true}
          onClick={async () => await this.selectAgentAndApply(item.id)}
          hasActions={true}
        >
          {cells}
        </EuiTableRow>
      );
    };

    const rows = [];

    for (
      let itemIndex = (this.state.pageIndex * this.state.itemsPerPage) % this.state.itemsPerPage;
      itemIndex <
        ((this.state.pageIndex * this.state.itemsPerPage) % this.state.itemsPerPage) +
          this.state.itemsPerPage && this.state.agents[itemIndex];
      itemIndex++
    ) {
      const item = this.state.agents[itemIndex];
      rows.push(renderRow(item));
    }

    return rows;
  }

  renderFooterCells() {
    const footers = [];

    const items = this.state.agents;
    const pagination = {
      pageIndex: this.state.pageIndex,
      pageSize: this.state.itemsPerPage,
      totalItemCount: this.state.totalItems,
    };

    this.columns.forEach(column => {
      const footer = this.getColumnFooter(column, { items, pagination });
      if (column.mobileOptions && column.mobileOptions.only) {
        return; // exclude columns that only exist for mobile headers
      }

      if (footer) {
        footers.push(
          <EuiTableFooterCell key={`footer_${column.id}`} align={column.alignment}>
            {footer}
          </EuiTableFooterCell>
        );
      } else {
        footers.push(
          <EuiTableFooterCell key={`footer_empty_${footers.length - 1}`} align={column.alignment}>
            {undefined}
          </EuiTableFooterCell>
        );
      }
    });
    return footers;
  }

  getColumnFooter = (column, { items, pagination }) => {
    if (column.footer === null) {
      return null;
    }
    if (column.footer) {
      return column.footer;
    }

    return undefined;
  };

  async onQueryChange(result){
    // sessionStorage.setItem(
    //   'agents_preview_selected_options',
    //   JSON.stringify(result.selectedOptions)
    // );
    this._isMounted && this.setState({ isLoading: true, ...result}, async () => {
      try{
        await this.getItems()
      }catch(error){
        this._isMounted && this.setState({ isLoading: false});
      }
    });
  }

  getSelectedItems(){
    return Object.keys(this.state.itemIdToSelectedMap).filter(x => {
      return (this.state.itemIdToSelectedMap[x] === true)
    })
  }

  unselectAgents(){
    this._isMounted && this.setState({itemIdToSelectedMap: {}});
    store.dispatch(updateCurrentAgentData({}));
    this.props.removeAgentsFilter();      
  }

  getSelectedCount(){
    return this.getSelectedItems().length;
  }

  async selectAgentAndApply(agentID){
    try{
      const data = await WzRequest.apiReq('GET', '/agents', { params: { q: 'id=' + agentID}});
      const formattedData = data.data.data.affected_items[0] //TODO: do it correctly
      store.dispatch(updateCurrentAgentData(formattedData));
      this.props.updateAgentSearch([agentID]);
    }catch(error){
      store.dispatch(updateCurrentAgentData({}));
      this.props.removeAgentsFilter(true);      
    }
  }

  showContextMenu(id){
    this._isMounted && this.setState({contextMenuId: id})
  }

  addIconPlatformRender(os) {
    if(typeof os === "string" ){ return os};
    let icon = false;

    if (((os || {}).uname || '').includes('Linux')) {
      icon = 'linux';
    } else if ((os || {}).platform === 'windows') {
      icon = 'windows';
    } else if ((os || {}).platform === 'darwin') {
      icon = 'apple';
    }
    const os_name =
      checkField((os || {}).name) +
      ' ' +
      checkField((os || {}).version);
    return (
      <span className="euiTableCellContent__text euiTableCellContent--truncateText">
        <i
          className={`fa fa-${icon} AgentsTable__soBadge AgentsTable__soBadge--${icon}`}
          aria-hidden="true"
        ></i>{' '}
        {os_name === '--' ? '-' : os_name}
      </span>
    );
  }

  filterGroupBadge = (group) => {
    const { filters } = this.state;
    let auxFilters = filters.map( filter => filter.value.match(/group=(.*S?)/)[1] );
    if (filters.length > 0) {
      !auxFilters.includes(group) ? 
      this.setState({
        filters: [...filters, {field: "q", value: `group=${group}`}],
      }) : false;
    } else {
      this.setState({
        filters: [...filters, {field: "q", value: `group=${group}`}],
      })
    }
  }

  renderGroups(groups){
    return Array.isArray(groups) ? (
      <GroupTruncate
        groups={groups}
        length={20}
        label={'more'}
        action={'filter'}
        filterAction={this.filterGroupBadge}
        {...this.props} /> 
    ) : groups
  }

  getList(searchParams) {
    this.setState({ searchParams, pageIndex: 0 }, this.getItems);
  }

  render() {
    const { paramsOptions } = this.state;
    const pagination = {
      pageIndex: this.state.pageIndex,
      pageSize: this.state.itemsPerPage,
      totalItemCount: this.state.totalItems,
      pageCount:
        this.state.totalItems % this.state.itemsPerPage === 0
          ? this.state.totalItems / this.state.itemsPerPage
          : parseInt(this.state.totalItems / this.state.itemsPerPage) + 1,
    };
    const selectedAgent = store.getState().appStateReducers.currentAgentData;

    return (
      <div>
        {/* <EuiFlexGroup gutterSize="m">
          <EuiFlexItem>
            <WzSearchBar
              filters={this.state.filters}
              suggestions={this.suggestions}
              keyName="key"
              onFiltersChange={filters => this.setState({filters, pageIndex: 0})}
              placeholder="筛选或查询代理"
            />
          </EuiFlexItem>
        </EuiFlexGroup> */}
        <TableSearch paramsOptions={paramsOptions} getList={(searchParams) => this.getList(searchParams)} />
        <EuiSpacer size="m" />
        {selectedAgent && Object.keys(selectedAgent).length > 0 && (
          <Fragment>
            <EuiFlexGroup responsive={false} justifyContent="flexEnd">
              {/* agent name (agent id) Unpin button right aligned, require justifyContent="flexEnd" in the EuiFlexGroup */}
              <EuiFlexItem grow={false} style={{marginRight: 0}}>
                <EuiHealth color={this.agentStatusColor(selectedAgent.status)} style={{ whiteSpace: 'no-wrap' }}>
                  {selectedAgent.name} ({selectedAgent.id})
                </EuiHealth>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{marginTop: 10, marginLeft: 4}}>
                <EuiToolTip position='top' content='取消固定代理'>
                  <EuiButtonIcon
                    color='danger'
                    onClick={() => this.unselectAgents()}
                    iconType="pinFilled"
                    aria-label="取消固定代理"
                  />
                </EuiToolTip> 
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="m" />
          </Fragment>
        )}

        <EuiTableHeaderMobile>
          <EuiFlexGroup responsive={false} justifyContent="spaceBetween" alignItems="baseline">
            <EuiFlexItem grow={false}></EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiTableSortMobile items={this.getTableMobileSortItems()} />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiTableHeaderMobile>

        <EuiTable>
          <EuiTableHeader>{this.renderHeaderCells()}</EuiTableHeader>
          {(this.state.agents.length && (
            <EuiTableBody className={this.state.isLoading ? 'agent-selection-table-loading' : ''}>
              {this.renderRows()}
            </EuiTableBody>
          )) || (
            <EuiTableBody className={this.state.isLoading ? 'agent-selection-table-loading' : ''}>
              <EuiTableRow key={0}>
                <EuiTableRowCell colSpan="10" isMobileFullWidth={true} align="center">
                  {this.state.isLoading ? '加载代理' : '没有找到结果'}
                </EuiTableRowCell>
              </EuiTableRow>
            </EuiTableBody>
          )}
        </EuiTable>

        <EuiSpacer size="m" />

        <EuiTablePagination
          activePage={pagination.pageIndex}
          itemsPerPage={pagination.pageSize}
          itemsPerPageOptions={[10]}
          pageCount={pagination.pageCount}
          onChangeItemsPerPage={this.onChangeItemsPerPage}
          onChangePage={this.onChangePage}
        />
      </div>
    );
  }
}