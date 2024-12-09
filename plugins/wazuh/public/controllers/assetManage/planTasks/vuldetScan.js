import React, { Component } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiTextColor,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
	EuiPanel,
	EuiBasicTable,
	EuiSpacer,
	EuiToolTip,
	EuiOverlayMask,
	EuiConfirmModal,
	EuiButton,
  EuiHealth,
  EuiText,
  EuiRadioGroup,
  EuiFieldText,
} from '@elastic/eui';
import { filtersToObject } from '../../../components/wz-search-bar';
import { formatUIDate } from '../../../react-services/time-service';
import { GroupTruncate } from '../../../components/common/util';
import { WAZUH_MODULES } from '../../../../common/wazuh-modules';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import GroupsHandler from '../../management/components/management/groups/utils/groups-handler';
import { AppState } from '../../../react-services/app-state';
import './vuldetScan.scss';

export class VuldetScan extends Component {
  _isMount = false;
	constructor(props) {
		super(props);
		this.state = {
			isVuldetModalVisible: false,
      selectType: 'all',
      typeOptions: [
        { id: 'all', label: '全局扫描' },
        { id: 'agent', label: '指定代理扫描' },
        { id: 'group', label: '指定代理分组扫描' },
        { id: 'cve', label: '指定漏洞扫描' },
      ],
      agentsPageIndex: 0,
      agentsPageSize: 15,
      agentsTotalItems: 0,
      agentsListItems: [],
      agentsSortField: 'name',
      agentsSortDirection: 'asc',
      filters: sessionStorage.getItem('agents_preview_selected_options') ? JSON.parse(sessionStorage.getItem('agents_preview_selected_options')) : [],
      isAgentsLoading: false,
      agentsTable: React.createRef(),
      selectedAgents: [],
      groupPageIndex: 0,
      groupPageSize: 15,
      groupTotalItems: 0,
      groupListItems: [],
      groupSortField: 'name',
      groupSortDirection: 'asc',
      isGroupLoading: false,
      groupTable: React.createRef(),
      selectedGroup: {},
      cveId: '',
      currentUserInfo: {},
      departmentGroups: [],
    };
    this.groupsHandler = GroupsHandler;
	}

  async componentDidMount() {
    this._isMount = true;

    let currentUserInfo = await AppState.getCurrentUserInfo();
    this.setState({ currentUserInfo });
    if (currentUserInfo.department) {
      let departmentGroups = await AppState.getDepartmentGroups();
      this.setState({ departmentGroups })
    }

    await this.getAgentsItems();
    await this.getGroupItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {
    if (!(_.isEqual(prevState.filters, this.state.filters))
      || prevState.agentsPageIndex !== this.state.agentsPageIndex
      || prevState.agentsPageSize !== this.state.agentsPageSize
      || prevState.agentsSortField !== this.state.agentsSortField
      || prevState.agentsSortDirection !== this.state.agentsSortDirection) {
      await this.getAgentsItems();
    }
    if (prevState.groupPageIndex !== this.state.groupPageIndex
      || prevState.groupPageSize !== this.state.groupPageSize
      || prevState.groupSortField !== this.state.groupSortField
      || prevState.groupSortDirection !== this.state.groupSortDirection) {
      await this.getGroupItems();
    }
  }

  async getGroupItems() {
    try {
      this._isMount && this.setState({ isGroupLoading: true });
      const { currentUserInfo } = this.state;
      const rawItems = await this.groupsHandler.listGroups({ params: this.buildGroupFilter() }, currentUserInfo.department);
      const { affected_items, total_affected_items } = ((rawItems || {}).data || {}).data;

      this._isMount &&
        this.setState({
          groupListItems: affected_items,
          groupTotalItems: total_affected_items,
          isGroupLoading: false
        });
    } catch (error) {
      this.setState({ isGroupLoading: false });
    }
  }

  buildGroupFilter() {
    const { groupPageIndex, groupPageSize } = this.state;
    const filter = {
      offset: groupPageIndex * groupPageSize,
      limit: groupPageSize,
      sort: this.buildGroupSortFilter()
    };

    return filter;
  }
  
  buildGroupSortFilter() {
    const { groupSortField, groupSortDirection } = this.state;

    const field = groupSortField;
    const direction = groupSortDirection === 'asc' ? '+' : '-';

    return direction + field;
  }

  onGroupTableChange = ({ page = {}, sort = {} }) => {
    const { index: groupPageIndex, size: groupPageSize } = page;
    const { field: groupSortField, direction: groupSortDirection } = sort;
    this._isMount && this.setState({
      groupPageIndex,
      groupPageSize,
      groupSortField,
      groupSortDirection,
      selectedGroup: {}
    });
  };

  async getAgentsItems() {
    try {
      this._isMount && this.setState({ isAgentsLoading: true });
      const { departmentGroups, currentUserInfo } = this.state;
      if (currentUserInfo.department && departmentGroups.length === 0) {
        this.setState({ isAgentsLoading: false });
        return
      }
      const rawAgents = await WzRequest.apiReq(
        'GET',
        '/agents',
        { params: this.buildAgentsFilter() }
      );

      const formatedAgents = (
        ((rawAgents || {}).data || {}).data || {}
      ).affected_items.map(this.formatAgent.bind(this));

      this._isMount &&
        this.setState({
          agentsListItems: formatedAgents,
          agentsTotalItems: (((rawAgents || {}).data || {}).data || {}).total_affected_items,
          isAgentsLoading: false
        });
    } catch (error) {
      this.setState({ isAgentsLoading: false });
    }
  }
  buildAgentsFilter() {
    const { agentsPageIndex, agentsPageSize, filters, currentUserInfo, departmentGroups } = this.state;

    const filter = {
      ...filtersToObject(filters),
      offset: (agentsPageIndex * agentsPageSize) || 0,
      limit: agentsPageSize,
      sort: this.buildAgentsSortFilter()
    };
    filter.q = !filter.q ? `id!=000` : `id!=000;${filter.q}`;
    if (currentUserInfo.department) {
      filter.q = `${filter.q};(${departmentGroups.map(k => `group=${k.name}`).join(',')})`
    }

    return filter;
  }

  buildAgentsSortFilter() {
    const { agentsSortField, agentsSortDirection } = this.state;

    const field = agentsSortField === 'os_name' ? 'os.name,os.version' : agentsSortField;
    const direction = agentsSortDirection === 'asc' ? '+' : '-';

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
  onAgentsTableChange = ({ page = {}, sort = {} }) => {
    const { index: agentsPageIndex, size: agentsPageSize } = page;
    const { field: agentsSortField, direction: agentsSortDirection } = sort;
    this._isMount && this.setState({
      agentsPageIndex,
      agentsPageSize,
      agentsSortField,
      agentsSortDirection,
      selectedAgents: []
    });
  };

	toSetVuldetModal(flag) {
		this.setState({isVuldetModalVisible: flag});
	}

	async toAllVuldet() {
		try {
      const { selectType, selectedAgents, selectedGroup, cveId, agentsTable, groupTable } = this.state;
      let url = `/vuldet_run`;
      if (selectType === 'agent') {
        if (selectedAgents.length === 0) {
          this.showToast(
            'danger',
            '警告',
            '漏洞扫描启动失败: 请选择至少一条代理',
            3000
          );
          return;
        }
        url += `?agents_list=${selectedAgents.map(k => k.id).join(',')}`;
      }
      else if (selectType === 'group') {
        if (!selectedGroup.name) {
          this.showToast(
            'danger',
            '警告',
            '漏洞扫描启动失败: 请选择一条代理分组',
            3000
          );
          return;
        }
        url += `?scan_group=${selectedGroup.name}`;
      }
      else if (selectType === 'cve') {
        if (!cveId) {
          this.showToast(
            'danger',
            '警告',
            '漏洞扫描启动失败: 请输入指定漏洞',
            3000
          );
          return;
        }
        url += `?cve_id=${cveId}`;
      }
      await WzRequest.apiReq('PUT', url, {});
			this.showToast(
				'success',
				'成功',
				'漏洞扫描启动成功',
				3000
			);
      this.setState({ selectType, selectedAgents: [], selectedGroup: {}, cveId: '' })
      agentsTable.current && agentsTable.current.setSelection([]);
      groupTable.current && groupTable.current.setSelection([]);
    } catch (error) {
      this.showToast(
				'danger',
				'警告',
				'漏洞扫描启动失败:' + error,
				3000
			);
    }
		this.toSetVuldetModal(false);
	}

	showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  changeType(type) {
    this.setState({ selectType: type, selectedAgents: [], selectedGroup: {}, cveId: '' })
  }

  vuldetAgentsRender() {
    const {
      agentsListItems,
      agentsTotalItems,
      agentsPageIndex,
      agentsPageSize,
      agentsSortField,
      agentsSortDirection,
      isAgentsLoading,
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
      agentsTotalItems > 15
        ? {
          pageIndex: agentsPageIndex,
          pageSize: agentsPageSize,
          totalItemCount: agentsTotalItems,
          pageSizeOptions: [15, 25, 50, 100]
        }
        : false;
    const sorting = {
      sort: {
        field: agentsSortField,
        direction: agentsSortDirection
      }
    };
    return (
      <EuiFlexGroup alignItems="stretch">
        <EuiFlexItem grow={false} style={{ width: 100, marginTop: '20px' }}>
          <EuiText textAlign="right">{'代理列表'}:</EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiBasicTable
            ref={agentsTable}
            itemId="id"
            items={agentsListItems}
            columns={columns}
            selection={selection}
            {...(pagination && { pagination })}
            onChange={this.onAgentsTableChange}
            loading={isAgentsLoading}
            sorting={sorting}
            noItemsMessage="没有找到代理"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    )
  }

  vuldetGroupRender() {
    const {
      groupListItems,
      groupTotalItems,
      groupPageIndex,
      groupPageSize,
      groupSortField,
      groupSortDirection,
      isGroupLoading,
      groupTable,
    } = this.state;
    const columns = [
      {
        field: 'name',
        name: '名称',
        align: 'left',
        sortable: true
      },
      {
        field: 'count',
        name: '代理',
        align: 'left'
      },
      {
        field: 'configSum',
        name: '配置校验和',
        align: 'left'
      }
    ]
    const onSelectionChange = (selectedItems) => {
      let selectedGroup = selectedItems.length > 0 ? selectedItems[selectedItems.length - 1] : {}
      if (selectedItems.length > 1) {
        this.state.groupTable.current.setSelection([selectedGroup]);
      }
      this.setState({ selectedGroup });
    };
    const selection = {
      selectable: () => true,
      onSelectionChange: onSelectionChange,
    };
    const pagination =
      groupTotalItems > 15
        ? {
          pageIndex: groupPageIndex,
          pageSize: groupPageSize,
          totalItemCount: groupTotalItems,
          pageSizeOptions: [15, 25, 50, 100]
        }
        : false;
    const sorting = {
      sort: {
        field: groupSortField,
        direction: groupSortDirection
      }
    };
    return (
      <EuiFlexGroup alignItems="stretch">
        <EuiFlexItem grow={false} style={{ width: 100, marginTop: '20px' }}>
          <EuiText textAlign="right">{'代理分组列表'}:</EuiText>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiBasicTable
            ref={groupTable}
            itemId="name"
            items={groupListItems}
            columns={columns}
            selection={selection}
            {...(pagination && { pagination })}
            onChange={this.onGroupTableChange}
            loading={isGroupLoading}
            sorting={sorting}
            noItemsMessage="没有找到代理分组"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    )
  }

  vuldetCveRender() {
    const { cveId } = this.state;
    return (
      <EuiFlexGroup alignItems="stretch">
        <EuiFlexItem grow={false} style={{ width: 100, marginTop: '20px' }}>
          <EuiText textAlign="right">{'指定漏洞'}:</EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFieldText
            value={cveId}
            onChange={(e) => this.setState({ cveId: e.target.value.replace(/[^\x00-\xff]/g, '').replace(/[\s+`~!@#$%^&*()_\-+=<>?:"{}|,.\\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/g, '').split(" ").join("") })}
          />
          {/* 不可输入中文、空格、特殊符号 */}
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiTextColor color="subdued" style={{ lineHeight: '40px' }}>不可输入中文、空格、特殊符号</EuiTextColor>
        </EuiFlexItem>
      </EuiFlexGroup>
    )
  }

  render() {
		const { isVuldetModalVisible, selectType, typeOptions } = this.state;
		let vuldetModal, vuldet;

		if (isVuldetModalVisible) {
			vuldetModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认启动漏洞扫描吗？"
            onCancel={() => this.toSetVuldetModal(false)}
            onConfirm={() => this.toAllVuldet()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          ></EuiConfirmModal>
        </EuiOverlayMask>
      );
		}

    if (selectType === 'agent') {
      vuldet = this.vuldetAgentsRender();
    }
    else if (selectType === 'group') {
      vuldet = this.vuldetGroupRender();
    }
    else if (selectType === 'cve') {
      vuldet = this.vuldetCveRender();
    }

    return (
      <EuiPanel>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h3>{'漏洞扫描策略'}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
          <EuiTextColor color="subdued">{'主动触发漏洞扫描操作'}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <EuiText textAlign="right">{'扫描类型'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 520 }}>
            <EuiRadioGroup
              className='planTask_vuldetScan_radioGroup'
              options={typeOptions}
              idSelected={selectType}
              onChange={(id) => this.changeType(id)}
              name="radio group"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        {vuldet}
        <EuiSpacer size="m" />
        <EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
        <EuiSpacer size="m" />
        <EuiButton
          size="s"
          onClick={() => this.toSetVuldetModal(true)}
        >
          漏洞扫描
        </EuiButton>
        {vuldetModal}
      </EuiPanel>
    );
  }
}