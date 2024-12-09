import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiTextColor,
	EuiPanel,
	EuiBasicTable,
	EuiSpacer,
	EuiOverlayMask,
	EuiConfirmModal,
	EuiButton,
  EuiHealth,
} from '@elastic/eui';
import { filtersToObject } from '../../../components/wz-search-bar';
import { formatUIDate } from '../../../react-services/time-service';
import { GroupTruncate } from '../../../components/common/util';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import { AppState } from '../../../react-services/app-state';

export class AgentsTasks extends Component {
  _isMount = false;
	constructor(props) {
    super(props);
		this.state = {
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      sortField: 'name',
      sortDirection: 'asc',
      filters: sessionStorage.getItem('agents_preview_selected_options') ? JSON.parse(sessionStorage.getItem('agents_preview_selected_options')) : [],
      isLoading: false,
			isScaModalVisible: false,
			isSyscheckModalVisible: false,
      agentsTable: React.createRef(),
      selectedAgents: [],
      currentUserInfo: {},
      departmentGroups: [],
    }
  }

  async componentDidMount() {
    this._isMount = true;

    let currentUserInfo = await AppState.getCurrentUserInfo();
    this.setState({ currentUserInfo });
    if (currentUserInfo.department) {
      let departmentGroups = await AppState.getDepartmentGroups();
      this.setState({ departmentGroups })
    }

    await this.getItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {
    if (!(_.isEqual(prevState.filters, this.state.filters))
      || prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize
      || prevState.sortField !== this.state.sortField
      || prevState.sortDirection !== this.state.sortDirection) {
      await this.getItems();
    }
  }

  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });
      const { departmentGroups, currentUserInfo } = this.state;
      if (currentUserInfo.department && departmentGroups.length === 0) {
        this.setState({ isLoading: false });
        return
      }
      const rawAgents = await WzRequest.apiReq(
        'GET',
        '/agents',
        { params: this.buildFilter() }
      );

      const formatedAgents = (
        ((rawAgents || {}).data || {}).data || {}
      ).affected_items.map(this.formatAgent.bind(this));

      this._isMount &&
        this.setState({
          listItems: formatedAgents,
          totalItems: (((rawAgents || {}).data || {}).data || {}).total_affected_items,
          isLoading: false
        });
    } catch (error) {
      this.setState({ isLoading: false });
    }
  }
  buildFilter() {
    const { pageIndex, pageSize, filters, currentUserInfo, departmentGroups } = this.state;

    const filter = {
      ...filtersToObject(filters),
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize,
      sort: this.buildSortFilter()
    };
    filter.q = !filter.q ? `id!=000` : `id!=000;${filter.q}`;
    if (currentUserInfo.department) {
      filter.q = `${filter.q};(${departmentGroups.map(k => `group=${k.name}`).join(',')})`
    }

    return filter;
  }

  buildSortFilter() {
    const { sortField, sortDirection } = this.state;

    const field = sortField === 'os_name' ? 'os.name,os.version' : sortField;
    const direction = sortDirection === 'asc' ? '+' : '-';

    return direction + field;
  }

  formatAgent(agent) {       
    const checkField = field => {
      return field !== undefined ? field : '-';
    };
    const lastKeepAlive = (date, timeService) => {
      return date !== undefined ? formatUIDate(date) : '-';
    };
    const agentVersion =
    agent.version !== undefined ? agent.version.split(' ')[1] : '-';
    const { timeService } = this.props;
    const node_name = agent.node_name && agent.node_name !== 'unknown' ? agent.node_name : '-';
    
    return {
      id: agent.id,
      name: agent.name,
      ip: agent.ip,
      tag: agent.tag,
      cpu: agent.cpu,
      mem: agent.mem,
      disk: agent.disk,
      net: agent.net,
      netbor: agent.netbor,
      status: agent.status,
      group: checkField(agent.group),
      os_name: agent,
      version: agentVersion,
      node_name: node_name,
      dateAdd: formatUIDate(agent.dateAdd),
      lastKeepAlive: lastKeepAlive(agent.lastKeepAlive, timeService),
      actions: agent,
      upgrading: false
    };
  }

	filterGroupBadge = (group) => {
    const { filters } = this.state;
    let auxFilters = filters.map(filter => filter.value.match(/group=(.*S?)/)[1]);
    if (filters.length > 0) {
      !auxFilters.includes(group) ?
        this.setState({
          filters: [...filters, { field: "q", value: `group=${group}` }],
        }) : false;
    } else {
      this.setState({
        filters: [...filters, { field: "q", value: `group=${group}` }],
      })
    }
  }
  renderGroups(groups) {
    return (
      <GroupTruncate groups={groups} length={25} label={'more'} action={'filter'} filterAction={this.filterGroupBadge} {...this.props} />
    )
  }
  addIconPlatformRender(agent) {
    let icon = false;
    const checkField = field => {
      return field !== undefined ? field : '-';
    };
    const os = (agent || {}).os;

    if (((os || {}).uname || '').includes('Linux')) {
      icon = 'linux';
    } else if ((os || {}).platform === 'windows') {
      icon = 'windows';
    } else if ((os || {}).platform === 'darwin') {
      icon = 'apple';
    }
    const os_name =
      checkField(((agent || {}).os || {}).name) +
      ' ' +
      checkField(((agent || {}).os || {}).version);

    return (
      <span className="euiTableCellContent__text euiTableCellContent--truncateText">
        <i
          className={`fa fa-${icon} AgentsTable__soBadge AgentsTable__soBadge--${icon}`}
          aria-hidden="true"
        ></i>{' '}
        {os_name === '- -' ? '-' : os_name}
      </span>
    );
  }
  addHealthStatusRender(status) {
    const color = status => {
      if (status.toLowerCase() === 'active') {
        return 'success';
      } else if (status.toLowerCase() === 'disconnected') {
        return 'danger';
      } else if (status.toLowerCase() === 'never_connected') {
        return 'subdued';
      }
    };
    const statusText = {
      never_connected: '从未连接',
      disconnected: '未连接',
      active: '已连接',
      pending: '挂起'
    }

    return <EuiHealth color={color(status)}><span className={'hide-agent-status'}>{statusText[status] ? statusText[status] : status}</span></EuiHealth>;
  }
  columns() {
    return [
      {
        field: 'id',
        name: 'ID',
        sortable: true,
        width: '50'
      },
      {
        field: 'ip',
        name: 'IP',
        width: '15%',
        truncateText: true,
        sortable: true
      },
      {
        field: 'name',
        name: '主机名',
        sortable: true,
        width: '15%',
        truncateText: true
      },
      {
        field: 'group',
        name: '组',
        width: '15%',
        truncateText: true,
        sortable: true,
        render: groups => groups !== '-' ? this.renderGroups(groups) : '-'
      },
      {
        field: 'tag',
        name: '标签',
        width: '10%',
        sortable: true
      },
      {
        field: 'os_name',
        name: '操作系统',
        sortable: true,
        width: '15%',
        truncateText: true,
        render: this.addIconPlatformRender
      },
      {
        field: 'node_name',
        name: '集群节点',
        width: '10%',
        truncateText: true,
        sortable: true
      },
      {
        field: 'dateAdd',
        name: '注册日期',
        width: '10%',
        truncateText: true,
        sortable: true
      },
      {
        field: 'lastKeepAlive',
        name: '上次连接时间',
        width: '10%',
        truncateText: true,
        sortable: true
      },
      {
        field: 'status',
        name: '状态',
        truncateText: true,
        sortable: true,
        width: '15%',
        render: this.addHealthStatusRender
      },
    ];
  }
  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    const { field: sortField, direction: sortDirection } = sort;
    this._isMount && this.setState({
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
      selectedAgents: []
    });
  };

  tableRender() {
    const {
      listItems,
      totalItems,
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
      isLoading,
      agentsTable,
    } = this.state;
    const columns = this.columns();
    const onSelectionChange = (selectedItems) => {
      this.setState({ selectedAgents: selectedItems });
    };
    const selection = {
      selectable: () => true,
      onSelectionChange: onSelectionChange,
    };

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
      <EuiBasicTable
        ref={agentsTable}
        itemId="id"
        items={listItems}
        columns={columns}
        selection={selection}
        {...(pagination && { pagination })}
        onChange={this.onTableChange}
        loading={isLoading}
        sorting={sorting}
        noItemsMessage="没有找到代理"
      />
    )
  }

  toShowScaModal() {
		const { selectedAgents } = this.state;
    if (selectedAgents.length === 0) {
      this.showToast(
        'danger',
        '警告',
        '请至少选择一条代理，执行基线检测',
        3000
      );
    }
    else {
      this.setScaModal(true);
    }
	}

	setScaModal(flag) {
    this.setState({isScaModalVisible: flag});
  }

  toShowSyscheckModal() {
    const { selectedAgents } = this.state;
    if (selectedAgents.length === 0) {
      this.showToast(
        'danger',
        '警告',
        '请至少选择一条代理，执行一致性检测',
        3000
      );
    }
    else {
      this.setSyscheckModal(true);
    }
	}

	setSyscheckModal(flag) {
    this.setState({isSyscheckModalVisible: flag});
  }

	async toScaAgent() {
		try {
      const { selectedAgents } = this.state;
      let agents = selectedAgents.map(item => item.id).join(',');
      const rawItems = await WzRequest.apiReq('PUT', `/sca_run?agents_list=${agents}`, {});
			const { total_failed_items } = ((rawItems || {}).data || {}).data;
			if (total_failed_items === 0) {
				this.showToast(
          'success',
          '成功',
          '基线检测启动成功',
          3000
        );
        this.setState({ selectedAgents: [] });
        this.state.agentsTable.current.setSelection([]);
			}
      else {
				this.showToast(
          'danger',
          '警告',
          '基线检测启动失败',
          3000
        );
			}
    } catch (error) {
      if (error.includes('Agent is not active')) {
        this.showToast(
          'danger',
          '警告',
          '基线检测启动失败: 该代理为未连接状态，不可启动基线检测',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '基线检测启动失败:' + error,
          3000
        );
      }
    }
		this.setScaModal(false);
	}

	async toSyscheckAgent() {
		try {
      const { selectedAgents } = this.state;
      let agents = selectedAgents.map(item => item.id).join(',');
      const rawItems = await WzRequest.apiReq('PUT', `/syscheck?agents_list=${agents}`, {});
			const { total_failed_items } = ((rawItems || {}).data || {}).data;
			if (total_failed_items === 0) {
				this.showToast(
          'success',
          '成功',
          '一致性检测启动成功',
          3000
        );
        this.setState({ selectedAgents: [] });
        this.state.agentsTable.current.setSelection([]);
			}
      else {
				this.showToast(
          'danger',
          '警告',
          '一致性检测启动失败',
          3000
        );
			}
    } catch (error) {
      if (error.includes('Agent is not active')) {
        this.showToast(
          'danger',
          '警告',
          '一致性检测启动失败: 该代理为未连接状态，不可启动一致性检测',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '一致性检测启动失败:' + error,
          3000
        );
      }
    }
		this.setSyscheckModal(false);
	}

	showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  render() {
    const { isScaModalVisible, isSyscheckModalVisible } = this.state;
    const table = this.tableRender();
		let scaModal, syscheckModal;
    if (isScaModalVisible) {
      scaModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认启动选中代理的基线检测吗？"
            onCancel={() => this.setScaModal(false)}
            onConfirm={() => this.toScaAgent()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          ></EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

		if (isSyscheckModalVisible) {
      syscheckModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认启动选中代理的一致性检测吗？"
            onCancel={() => this.setSyscheckModal(false)}
            onConfirm={() => this.toSyscheckAgent()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          ></EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

    return (
      <EuiPanel>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h3>{'代理任务'}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiTextColor color="subdued">{'可在代理列表中手动触发检测操作'}</EuiTextColor>
          </EuiFlexItem>
          <EuiFlexItem />
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.toShowScaModal()}
            >
              基线检测
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.toShowSyscheckModal()}
            >
              一致性检测
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
        {table}
        {scaModal}
        {syscheckModal}
      </EuiPanel>
    );
  }
};