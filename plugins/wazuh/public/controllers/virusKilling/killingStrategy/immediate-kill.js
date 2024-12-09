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
  EuiText,
  EuiFieldText,
} from '@elastic/eui';
import { filtersToObject } from '../../../components/wz-search-bar';
import { formatUIDate } from '../../../react-services/time-service';
import { GroupTruncate } from '../../../components/common/util';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import GroupsHandler from '../../management/components/management/groups/utils/groups-handler';
import { AppState } from '../../../react-services/app-state';

export class ImmediateKill extends Component {
  _isMount = false;
	constructor(props) {
		super(props);
		this.state = {
			isKillModalVisible: false,
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
      scanPath: '',
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
  }

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
      os: agent.os,
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

	toSetKillModal(flag) {
		this.setState({isKillModalVisible: flag});
	}

	async toKill() {
		try {
      const { selectedAgents, agentsTable, agentsTotalItems, scanPath } = this.state;
      let urlRegex = /^\/.*/; // 可以指向文件夹，也可以指向文件名。/开头

      if (!scanPath) {
        this.showToast(
          'danger',
          '警告',
          '立即查杀启动失败: 扫描文件路径为必填',
          3000
        );
        return;
      }
      if (selectedAgents.length === 0) {
        this.showToast(
          'danger',
          '警告',
          '立即查杀启动失败: 请选择至少一条代理',
          3000
        );
        return;
      }

      let url = `/active-response?pretty=true`;
      let agents_list_Linux = selectedAgents.filter(k => k.os?.uname?.includes('Linux'));
      let agents_list_Windows = selectedAgents.filter(k => k.os?.uname?.includes('Windows'));
      let isError = false

      let paramsLinux = {
        command: 'clamscan.sh',
        arguments: [scanPath],
        custom: true
      }
      let paramsWindows = {
        command: 'clamscan.cmd',
        arguments: [scanPath],
        custom: true
      }

      if (agents_list_Linux.length > 0) {
        try {
          await WzRequest.apiReq('PUT', `${url}&agents_list=${agents_list_Linux.map(k => k.id).join(',')}`, paramsLinux);
        } catch (error) {
          isError = true
          if (error.includes('Agent is not active')) {
            this.showToast(
              'danger',
              '警告',
              `立即查杀失败: 以下未连接状态的Linux操作系统代理不可进行立即查杀: ${error.split('ids:')[1]}`,
              3000
            );
          }
          else if (error.includes('active-response')) {
            this.showToast(
              'danger',
              '警告',
              `立即查杀失败: 以下Linux操作系统代理失去了连接不可进行立即查杀: ${error.split('ids:')[1]}`,
              3000
            );
          }
          else {
            this.showToast(
              'danger',
              '警告',
              '立即查杀失败: ' + error,
              3000
            );
          }
        }
      }
      if (agents_list_Windows.length > 0) {
        try {
          await WzRequest.apiReq('PUT', `${url}&agents_list=${agents_list_Windows.map(k => k.id).join(',')}`, paramsWindows);
        } catch (error) {
          isError = true
          if (error.includes('Agent is not active')) {
            this.showToast(
              'danger',
              '警告',
              `立即查杀失败: 以下未连接状态的Windows操作系统代理不可进行立即查杀: ${error.split('ids:')[1]}`,
              3000
            );
          }
          else if (error.includes('active-response')) {
            this.showToast(
              'danger',
              '警告',
              `立即查杀失败: 以下Linux操作系统代理失去了连接不可进行立即查杀: ${error.split('ids:')[1]}`,
              3000
            );
          }
          else {
            this.showToast(
              'danger',
              '警告',
              '立即查杀失败: ' + error,
              3000
            );
          }
        }
      }

      if (!isError) {
        this.showToast(
          'success',
          '成功',
          '立即查杀启动成功',
          3000
        );
      }
      this.setState({ selectedAgents: [], scanPath: '' })
      agentsTable.current && agentsTable.current.setSelection([]);
    } catch (error) {
      if (error.includes('Agent is not active')) {
        this.showToast(
          'danger',
          '警告',
          '立即查杀启动失败: 未连接状态的代理不可进行查杀',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '立即查杀启动失败:' + error,
          3000
        );
      }
    }
		this.toSetKillModal(false);
	}

	showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  agentsRender() {
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
        <EuiFlexItem grow={false} style={{ width: 130, marginTop: '20px' }}>
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

  render() {
		const { isKillModalVisible, scanPath } = this.state;
		let killModal, agentsRender;

		if (isKillModalVisible) {
			killModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="toSetKill？"
            onCancel={() => this.toSetKillModal(false)}
            onConfirm={() => this.toKill()}
            cancelButtonText="cancel"
            confirmButtonText="confirm"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          ></EuiConfirmModal>
        </EuiOverlayMask>
      );
		}
    agentsRender = this.agentsRender();

    return (
      <EuiPanel>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h3>{'Immediately investigate and kill'}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
          <EuiTextColor color="subdued">{'Actively triggering virus killing operations'}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        {agentsRender}
        <EuiFlexGroup alignItems="stretch">
          <EuiFlexItem grow={false} style={{ width: 130, marginTop: '20px' }}>
            <EuiText textAlign="right">{'Scan file path'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 205 }}>
            <EuiFieldText
              value={scanPath}
              onChange={(e) => this.setState({ scanPath: e.target.value })}
            />
            {/* 不可输入空格 */}
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiTextColor color="subdued" style={{ lineHeight: '40px' }}>The path can point to a folder or file name</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
        <EuiSpacer size="m" />
        <EuiButton
          size="s"
          onClick={() => this.toSetKillModal(true)}
        >
Immediately investigate and kill
        </EuiButton>
        {killModal}
      </EuiPanel>
    );
  }
}