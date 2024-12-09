import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiButtonEmpty,
	EuiFieldText,
	EuiText,
  EuiButton,
  EuiSelect,
  EuiTextColor,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
	EuiBasicTable,
  EuiHealth,
  EuiRadioGroup,
  EuiDatePicker,
  EuiCheckboxGroup,
} from '@elastic/eui';
import { getToasts, getHttp } from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import GroupsHandler from '../../management/components/management/groups/utils/groups-handler';
import { filtersToObject } from '../../../components/wz-search-bar';
import { formatUIDate } from '../../../react-services/time-service';
import { GroupTruncate } from '../../../components/common/util';
import { AppState } from '../../../react-services/app-state';
import moment from 'moment';
import './row-details.scss';

export class PolicyEdit extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      formParams: {
        task_mode: 'immediate',
        period_time: null,
      },
      selectType: '',
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
      modeOptions: [
        { id: 'immediate', label: '及时体检' },
        { id: 'period', label: '定时体检' },
      ],
      selectedGroup: {},
      checkboxOptions: [
        {
					id: 'risk_password_enable',
					label: '高危账号'
				},
        {
					id: 'sca_enable',
					label: '缺陷配置'
				},
        {
					id: 'virus_enable',
					label: '木马病毒'
				},
        {
					id: 'webshell_enable',
					label: '网页后门'
				},
        {
					id: 'shell_process_enable',
					label: '反弹shell'
				},
        {
					id: 'abnormal_account_enable',
					label: '异常账号'
				},
        {
					id: 'log_delete_enable',
					label: '日志删除'
				},
        {
					id: 'abnormal_process_enable',
					label: '异常进程'
				},
        {
					id: 'system_cmd_enable',
					label: '系统命令校验'
				}
      ],
      checkboxSelected: {
        risk_password_enable: false,
        sca_enable: false,
        virus_enable: false,
        webshell_enable: false,
        shell_process_enable: false,
        abnormal_account_enable: false,
        log_delete_enable: false,
        abnormal_process_enable: false,
        system_cmd_enable: false,
      },
      keyMap: {
        risk_password: 'risk_password_enable',
        sca: 'sca_enable',
        virus: 'virus_enable',
        webshell: 'webshell_enable',
        shell_process: 'shell_process_enable',
        abnormal_account: 'abnormal_account_enable',
        log_delete: 'log_delete_enable',
        abnormal_process: 'abnormal_process_enable',
        system_cmd: 'system_cmd_enable',
      },
      currentUserInfo: {},
      departmentGroups: [],
    }
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
    let selectType = 'agent'

    // 如果是编辑，在这里赋值
    if (this.props.listType !== 'add') {
      const { detailsItem } = this.props;
      const { agentsListItems, groupListItems, keyMap, checkboxSelected } = this.state;

      if (detailsItem.agent_group !== 'empty') selectType = 'group'
      let selectedAgents = [], selectedGroup = {}
      if (selectType === 'agent') {
        let agentArr = detailsItem.agent_list.split(',')
        selectedAgents = agentsListItems.filter(k => agentArr.indexOf(k.id) !== -1)
      }
      else {
        selectedGroup = groupListItems.find(k => detailsItem.agent_group === k.name)
      }
      let formParams = {};
      formParams.task_mode = detailsItem.task_mode
      if (detailsItem.task_mode === 'period') {
        formParams.period_time = moment(detailsItem.period_time, 'HH:mm:ss')
      }
      Object.keys(keyMap).forEach(k => {
        if (detailsItem[k] === 'True') checkboxSelected[keyMap[k]] = true
      })

      this.setState({ selectedAgents, selectedGroup, formParams, checkboxSelected })
    }
    this.setState({ selectType });
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

  getInitSelect() {
    const { detailsItem } = this.props;
    const { agentsListItems, groupListItems } = this.state;
    let agentInitialSelected = [], groupInitialSelected = []
    if (this.props.listType !== 'add') {
      let selectType = 'agent'
      if (detailsItem.agent_group !== 'empty') selectType = 'group'
      if (selectType === 'agent') {
        let agentArr = detailsItem.agent_list.split(',')
        agentInitialSelected = agentsListItems.filter(k => agentArr.indexOf(k.id) !== -1)
      }
      else {
        let selectedGroup = groupListItems.find(k => detailsItem.agent_group === k.name)
        groupInitialSelected = [selectedGroup]
      }
    }

    return {
      agentInitialSelected,
      groupInitialSelected
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
    const { groupInitialSelected } = this.getInitSelect();
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
    const { agentInitialSelected } = this.getInitSelect();
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
    const { agentInitialSelected } = this.getInitSelect();
    const selection = {
      selectable: () => true,
      onSelectionChange: onSelectionChange,
      initialSelected: agentInitialSelected
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
    const { groupInitialSelected } = this.getInitSelect()
    const selection = {
      selectable: () => true,
      onSelectionChange: onSelectionChange,
      initialSelected: groupInitialSelected
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

  changeMode(type) {
    const { formParams } = this.state;
    formParams['task_mode'] = type;
    this.setState({ formParams })
  }

  changeDate(date) {
    const { formParams } = this.state;
    formParams['period_time'] = date;
    this.setState({ formParams })
  }

  onChangeCheckbox(id) {
		const { checkboxSelected } = this.state;
		checkboxSelected[id] = !checkboxSelected[id];
		this.setState({ checkboxSelected });
	}

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  async saveDate() {
    try {
      const { formParams, selectType, selectedAgents, selectedGroup, checkboxSelected } = this.state;
      const { detailsItem } = this.props;
      let params = {}
      if (selectType === 'agent') {
        if (selectedAgents.length === 0) {
          this.showToast(
            'danger',
            '警告',
            '保存失败: 请选择至少一条代理',
            3000
          );
          return;
        }
        params.agents_list = selectedAgents.map(k => k.id).join(',')
      }
      else {
        if (!selectedGroup.name) {
          this.showToast(
            'danger',
            '警告',
            '保存失败: 请选择一条代理分组',
            3000
          );
          return;
        }
        params.group = selectedGroup.name
      }
      params.task_mode = formParams.task_mode
      if (formParams.task_mode === 'period') {
        if (!formParams.period_time) {
          this.showToast(
            'danger',
            '警告',
            '保存失败: 请选择每日体检时间',
            3000
          );
          return;
        }
        params.period_time = formParams.period_time.format('HH:mm') + ':00'
      }
      let selectedKey = [];
      Object.keys(checkboxSelected).forEach(k => {
        if (checkboxSelected[k]) selectedKey.push(k)
      })
      if (selectedKey.length === 0) {
        this.showToast(
          'danger',
          '警告',
          '保存失败: 请至少选择一条体检项目',
          3000
        );
        return;
      }
      let method = 'POST'
      if (this.props.listType !== 'add') {
        params.tasks_list = detailsItem.id
        method = 'PUT'
      }
      let url = `/manager/health_check_policy?pretty=true`
      Object.keys(params).forEach(k => {
        url += `&${k}=${params[k]}`
      })
      selectedKey.forEach(k => {
        url += `&${k}=True`
      })
      const rawItems = await WzRequest.apiReq(method, url, {});
      const items_message = ((rawItems || {}).data || {}).message;
      if (items_message.includes('success')) {
        this.showToast(
          'success',
          '成功',
          '保存成功',
          3000
        );
        this.props.toList();
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '保存失败',
          3000
        );
      }

    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '策略保存失败: ' + error,
        3000
      );
    }
  }

  render() {
    const { formParams, selectType, typeOptions, modeOptions, checkboxOptions, checkboxSelected } = this.state;
    const { listType } = this.props;
    let monObj;
    if (selectType === 'agent') {
      monObj = this.vuldetAgentsRender();
    }
    else if (selectType === 'group') {
      monObj = this.vuldetGroupRender();
    }
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h3>{listType === 'add' ? '新增策略' : '编辑策略'}</h3>
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
        <EuiSpacer></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <EuiText textAlign="right">{'监控对象'}:</EuiText>
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
        {monObj}
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <EuiText textAlign="right">{'任务模式'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 520 }}>
            <EuiRadioGroup
              className='planTask_vuldetScan_radioGroup'
              options={modeOptions}
              idSelected={formParams['task_mode']}
              onChange={(id) => this.changeMode(id)}
              name="modeRadio"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        { formParams['task_mode'] === 'period' && (
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiText textAlign="right">{'每日体检时间'}:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ width: 520 }}>
              <EuiDatePicker
                showTimeSelect
                showTimeSelectOnly
                selected={formParams['period_time']}
                onChange={(date) => this.changeDate(date)}
                dateFormat="HH:mm"
                timeFormat="HH:mm"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        <EuiFlexGroup alignItems="stretch">
          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <EuiText textAlign="right">{'体检项目'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCheckboxGroup
              options={checkboxOptions}
              idToSelectedMap={checkboxSelected}
              onChange={(id) => this.onChangeCheckbox(id)}
              className="wz-checkup-toggle"
            />
          </EuiFlexItem>
        </EuiFlexGroup>

        <EuiSpacer></EuiSpacer>
        <EuiButton
          size="s"
          onClick={() => this.saveDate()}
        >
          保存
        </EuiButton>
      </div>
    )
  }

}