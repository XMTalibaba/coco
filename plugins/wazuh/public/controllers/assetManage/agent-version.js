import React, { Component } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
  EuiPanel,
  EuiSpacer,
  EuiButtonEmpty,
	EuiText,
  EuiButton,
	EuiBasicTable,
  EuiHealth,
  EuiRadioGroup,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiSelect,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { AppState } from '../../react-services/app-state';
import { getToasts } from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import GroupsHandler from '../management/components/management/groups/utils/groups-handler';
import { filtersToObject } from '../../components/wz-search-bar';
import { formatUIDate } from '../../react-services/time-service';
import { GroupTruncate } from '../../components/common/util';

export const AgentVersion = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '资产管理' }, { text: '主机版本' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class AgentVersion extends Component {
  _isMount = false;
	constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      selectType: 'agent',
      typeOptions: [
        { id: 'agent', label: '主机' },
        { id: 'group', label: '主机分组' },
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
      currentUserInfo: {},
      departmentGroups: [],
      isInstallModalVisible: false,
      versionOptions: [],
      version: '',
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

    await this.getVersions();
    await this.getAgentsItems();
    await this.getGroupItems();
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
  componentWillUnmount() {
    this._isMount = false;
  }

  async getVersions() {
    try {
      const rawRules = await WzRequest.apiReq('PUT', '/manager/agentmanage?pretty=true&login_operation=version', {});
      let tasksItems = (
        ((rawRules || {}).data || {}).data || {}
      ).affected_items.map(k => {
        return {
          value: k,
          text: k
        }
      })
      tasksItems.unshift({
        value: '',
        text: '请选择安装版本'
      })
      this.setState({
        versionOptions: tasksItems
      });
    } catch (error) {
      console.log(error)
    }
  }

  async getGroupItems() {
    try {
      this._isMount && this.setState({ isGroupLoading: true });
      let res = await AppState.getCurrentUserInfo();
      const rawItems = await this.groupsHandler.listGroups({ params: this.buildGroupFilter() }, res.department);
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
        width: '120',
        truncateText: true,
        sortable: true,
        render: groups => groups !== '-' ? this.renderGroups(groups) : '-'
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
        field: 'version',
        name: '版本',
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
        width: '120',
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

  groupRender() {
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

  changeType(type) {
    this.setState({ selectType: type, selectedAgents: [], selectedGroup: {} })
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  toRefresh() {
    const { selectType } = this.state;
    if (selectType === 'agent') {
      this.getAgentsItems();
    }
    else {
      this.getGroupItems();
    }
  }

  toShowInstallModal() {
    const { selectType, selectedAgents, selectedGroup } = this.state;
    if (selectType === 'agent') {
      if (selectedAgents.length === 0) {
        this.showToast(
          'danger',
          '警告',
          '修改失败: 请选择至少一条代理',
          3000
        );
        return;
      }
    }
    else {
      if (!selectedGroup.name) {
        this.showToast(
          'danger',
          '警告',
          '修改失败: 请选择一条代理分组',
          3000
        );
        return;
      }
    }
    this.setInstallModal(true);
  }

  setInstallModal(flag) {
    this.setState({isInstallModalVisible: flag});
    if (!flag) this.setState({ version: '' })
  }

  setUpdateVersion(e) {
		let version = e.target.value;
		this.setState({ version });
	}

  async toRun() {
    try {
      const { version, selectType, selectedAgents, selectedGroup, agentsTable, groupTable } = this.state;
      if (!version) {
        this.showToast(
          'danger',
          '警告',
          '安装失败: 请选择安装版本',
          3000
        );
        return;
      }
      let agents_list = [];
      if (selectType === 'agent') {
        agents_list = selectedAgents
      }
      else {
        let agentsItems = await WzRequest.apiReq('GET', `/agents`, { params: { limit: 20, q: `id!=000;(group=${selectedGroup.name})` } });
        let { total_affected_items, affected_items } = ((agentsItems || {}).data || {}).data
        agents_list = affected_items
        if (total_affected_items > 20) {
          agentsItems = await WzRequest.apiReq('GET', `/agents`, { params: { limit: total_affected_items, q: `id!=000;(group=${selectedGroup.name})` } });
          agents_list = (((agentsItems || {}).data || {}).data || {}).affected_items
        }
      }

      let paramsLinux = {
        command: 'upgrade-agent.sh',
        arguments: [document.location.hostname, version],
        custom: true
      }
      let paramsWindows = {
        command: 'upgrade-agent.cmd',
        arguments: [document.location.hostname, version],
        custom: true
      }
      let agents_list_Linux = agents_list.filter(k => k.os?.uname?.includes('Linux'));
      let agents_list_Windows = agents_list.filter(k => k.os?.uname?.includes('Windows'));
      let isError = false

      if (agents_list_Linux.length > 0) {
        try {
          await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${agents_list_Linux.map(k => k.id).join(',')}`, paramsLinux);
        } catch (error) {
          isError = true
          if (error.includes('Agent is not active')) {
            this.showToast(
              'danger',
              '警告',
              `安装失败: 以下未连接状态的Linux操作系统代理不可进行安装: ${error.split('ids:')[1]}`,
              3000
            );
          }
          else {
            this.showToast(
              'danger',
              '警告',
              '安装失败: ' + error,
              3000
            );
          }
        }
      }
      if (agents_list_Windows.length > 0) {
        try {
          await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${agents_list_Windows.map(k => k.id).join(',')}`, paramsWindows);
        } catch (error) {
          isError = true
          if (error.includes('Agent is not active')) {
            this.showToast(
              'danger',
              '警告',
              `安装失败: 以下未连接状态的Windows操作系统代理不可进行安装: ${error.split('ids:')[1]}`,
              3000
            );
          }
          else {
            this.showToast(
              'danger',
              '警告',
              '安装失败: ' + error,
              3000
            );
          }
        }
      }
      
      if (!isError) {
        this.showToast(
          'success',
          '成功',
          '开始安装，请稍后在 资产管理-主机管理页 刷新列表查看主机版本',
          3000
        );
      }
      this.setState({ selectedAgents: [], selectedGroup: {} })
      agentsTable.current && agentsTable.current.setSelection([]);
      groupTable.current && groupTable.current.setSelection([]);
      this.setInstallModal(false)
    } catch (error) {
      console.log(error)
    }
    this.setInstallModal(false);
  };

	renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'} alignItems="center">
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['agentVersion'].title}&nbsp;&nbsp;</span>
                  </h1>
                </EuiTitle>
                <EuiPopover
                  button={
                    <EuiButtonIcon
                      iconType="iInCircle"
                      style={{marginTop: 3}}
                      color='primary'
                      aria-label='Open/close'
                      onClick={() => { this.setState({ isDescPopoverOpen: !this.state.isDescPopoverOpen }) }}
                    />
                  }
                  anchorPosition="rightUp"
                  isOpen={this.state.isDescPopoverOpen}
                  closePopover={() => { this.setState({ isDescPopoverOpen: false }) }}>
                  <EuiPopoverTitle>模块说明</EuiPopoverTitle>
                  <div style={{ width: '400px' }}>
                    {WAZUH_MODULES['agentVersion'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}></EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
	}

	render() {
    const { selectType, typeOptions, isInstallModalVisible, versionOptions, version } = this.state;
		const title = this.renderTitle();
    let table, installModal;
    if (selectType === 'agent') {
      table = this.agentsRender();
    }
    else if (selectType === 'group') {
      table = this.groupRender();
    }

    if (isInstallModalVisible) {
      installModal = (
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setInstallModal(false)} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>选择安装版本</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <div style={{ padding: '4px 0'}}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">版本:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiSelect
                      options={versionOptions}
                      value={version}
                      onChange={(e) => this.setUpdateVersion(e)}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={() => this.setInstallModal(false)}>取消</EuiButtonEmpty>
              <EuiButton onClick={() => this.toRun()} fill>安装</EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }

		return (
			<EuiFlexGroup direction="column">
				<EuiFlexItem grow={false}>
					<div className="wz-module">
						<div className='wz-module-header-agent-wrapper'>
							<div className='wz-module-header-agent'>
								{title}
							</div>
						</div>
						<div className='wz-module-body-notab'>
							<EuiPage>
                <EuiPanel>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiTitle size="s">
                        <h3>{'版本管理'}</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiButton
                        size="s"
                        onClick={() => this.toRefresh()}
                      >
                        刷新
                      </EuiButton>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiFlexGroup alignItems="center">
                    <EuiFlexItem grow={false} style={{ width: 100 }}>
                      <EuiText textAlign="right">{'操作对象'}:</EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false} style={{ width: 520 }}>
                      <EuiRadioGroup
                        className='planTask_vuldetScan_radioGroup'
                        options={typeOptions}
                        idSelected={selectType}
                        onChange={(id) => this.changeType(id)}
                        name="objRadio"
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  {table}
                  <EuiSpacer size="m" />
                  <EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
                  <EuiSpacer size="m" />
                  <EuiButton
                    size="s"
                    onClick={() => this.toShowInstallModal()}
                  >
                    修改版本
                  </EuiButton>
                </EuiPanel>
							</EuiPage>
						</div>
            {installModal}
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
	}
});