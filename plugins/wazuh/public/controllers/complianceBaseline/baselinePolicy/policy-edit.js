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
  EuiComboBox,
  EuiSelect,
  EuiSuperSelect,
  EuiTextColor,
  EuiTextArea,
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

export class PolicyEdit extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      formParams: {
        showname: '',
        rule_mode: 'app',
        app_baseline: [],
        system_type: [],
        system_baseline: [],
        description: '',
      },
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
      ruleOptions: [
        { id: 'app', label: '应用基线' },
        { id: 'system', label: '系统基线' },
      ],
      currentUserInfo: {},
      departmentGroups: [],
      appOptions: [],
      systemTypeOptions: [],
      systemOptions: [],
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
    await this.getAppOptions();
    await this.getSystemTypeOptions();

    // 如果是编辑，在这里赋值
    if (this.props.listType !== 'add') {
      const { detailsItem } = this.props;
      const { agentsListItems, formParams, appOptions, systemTypeOptions } = this.state;

      formParams.showname = detailsItem.name;
      formParams.description = detailsItem.description;
      formParams.rule_mode = detailsItem.sca_type  === 'app' ? 'app' : 'system';
      if (detailsItem.sca_type === 'app') {
        let baseline = detailsItem.sca_policies.split('|');
        let app_baseline = appOptions.filter(k => baseline.indexOf(k.id) !== -1);
        formParams.app_baseline = app_baseline;
      }
      else {
        let baseline = detailsItem.sca_policies.split('|');
        let system_type = systemTypeOptions.filter(k =>  detailsItem.sca_type === k.id);
        await this.getSystemOptions(detailsItem.sca_type);
        const { systemOptions } = this.state;
        let system_baseline = systemOptions.filter(k => baseline.indexOf(k.id) !== -1);
        formParams.system_type = system_type;
        formParams.system_baseline = system_baseline;
      }
      let selectedAgents = []
      if (detailsItem.agents === 'all') {
        selectedAgents = agentsListItems
      }
      else {
        let agentArr = detailsItem.agents.split('|')
        selectedAgents = agentsListItems.filter(k => agentArr.indexOf(k.id) !== -1)
      }

      this.setState({ selectedAgents, formParams })
    }
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

  getInitSelect() {
    const { detailsItem } = this.props;
    const { agentsListItems } = this.state;
    let agentInitialSelected = []
    if (this.props.listType !== 'add') {
      if (detailsItem.agents === 'all') {
        agentInitialSelected = agentsListItems
      }
      else {
        let agentArr = detailsItem.agents.split('|')
        agentInitialSelected = agentsListItems.filter(k => agentArr.indexOf(k.id) !== -1)
      }
    }

    return {
      agentInitialSelected
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
      this.showToast(
        'danger',
        '警告',
        '代理列表查询失败',
        3000
      );
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
          <EuiText textAlign="right">{'检查范围'}:</EuiText>
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

  async getAppOptions() {
    try {
      const rawResult = await WzRequest.apiReq(
        'GET',
        '/sca_sys_templates?pretty=true&sca_type=app',
        {}
      );

      const { affected_items } = ((rawResult || {}).data || {}).data || {}
      let appOptions = affected_items.map(item => {
        return {
          id: item.id,
          label: item.name
        }
      })

      this.setState({ appOptions });
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '应用基线查询失败',
        3000
      );
      console.log(error)
    }
  }

  async getSystemTypeOptions() {
    try {
      const rawResult = await WzRequest.apiReq(
        'GET',
        '/sca_sys_templates/sca_os_summary?pretty=true',
        {}
      );

      const { affected_items } = ((rawResult || {}).data || {}).data || {}
      let systemTypeOptions = affected_items.map(item => {
        return {
          id: item.type,
          label: item.type,
        }
      })

      this.setState({ systemTypeOptions });
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '系统类型查询失败',
        3000
      );
      console.log(error)
    }
  }

  async getSystemOptions(type) {
    try {
      const rawResult = await WzRequest.apiReq(
        'GET',
        `/sca_sys_templates?pretty=true&sca_type=${type}`,
        {}
      );

      const { affected_items } = ((rawResult || {}).data || {}).data || {}
      let systemOptions = affected_items.map(item => {
        return {
          id: item.id,
          label: item.name,
        }
      })

      this.setState({ systemOptions });
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '系统基线查询失败',
        3000
      );
      console.log(error)
    }
  }

  changeValue(e, type) {
    const { formParams } = this.state;
    formParams[type] = e.target.value;
    this.setState({ formParams });
  }

  changeRule(type) {
    const { formParams } = this.state;
    formParams['rule_mode'] = type;
    formParams['app_baseline'] = [];
    formParams['system_type'] = [];
    formParams['system_baseline'] = [];
    let systemOptions = []
    this.setState({ formParams, systemOptions });
  }

  changeBaseline(value, type) {
    const { formParams } = this.state;
    formParams[type] = value;
    this.setState({ formParams });
  }

  changeSystemType(value) {
    const { formParams } = this.state;
    formParams['system_type'] = value;
    formParams['system_baseline'] = [];
    this.setState({ formParams });
    if (value.length !== 0) this.getSystemOptions(value[0].id);
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
      const { formParams, selectedAgents, agentsTotalItems } = this.state;
      if (!formParams.showname) {
        this.showToast(
          'danger',
          '警告',
          '保存失败: 策略名称为必填',
          3000
        );
        return;
      }
      if (formParams.rule_mode === 'app' && formParams.app_baseline.length === 0) {
        this.showToast(
          'danger',
          '警告',
          '保存失败: 请选择至少一条应用基线',
          3000
        );
        return;
      }
      if (formParams.rule_mode === 'system' && formParams.system_type.length === 0) {
        this.showToast(
          'danger',
          '警告',
          '保存失败: 请选择系统类型',
          3000
        );
        return;
      }
      if (formParams.rule_mode === 'system' && formParams.system_baseline.length === 0) {
        this.showToast(
          'danger',
          '警告',
          '保存失败: 请选择至少一条系统基线',
          3000
        );
        return;
      }
      if (!formParams.description) {
        this.showToast(
          'danger',
          '警告',
          '保存失败: 描述为必填',
          3000
        );
        return;
      }
      if (selectedAgents.length === 0) {
        this.showToast(
          'danger',
          '警告',
          '保存失败: 请选择至少一条代理',
          3000
        );
        return;
      }
      let params = {
        showname: encodeURIComponent(formParams.showname),
        sca_type: formParams.rule_mode === 'app' ? 'app' : formParams.system_type[0].id,
        description: encodeURIComponent(formParams.description),
      }
      if (selectedAgents.length !== agentsTotalItems) {
        params.agents_list = selectedAgents.map(k => k.id).join(',')
      }
      if (formParams.rule_mode === 'app') {
        params.sca_policies = formParams.app_baseline.map((item) => item.id).join(',')
      }
      else {
        params.sca_policies = formParams.system_baseline.map((item) => item.id).join(',')
      }
      let method = 'POST'
      if (this.props.listType !== 'add') {
        method = 'PUT'
      }
      let url = `/sca_check_policies?pretty=true`
      Object.keys(params).forEach(k => {
        url += `&${k}=${params[k]}`
      })
      const rawItems = await WzRequest.apiReq(method, url, {});
      const items_message = ((rawItems || {}).data || {}).message;
      if (items_message.includes('failed')) {
        this.showToast(
          'danger',
          '警告',
          '保存失败',
          3000
        );
      }
      else {
        this.showToast(
          'success',
          '成功',
          '保存成功',
          3000
        );
        this.props.toList();
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
    const { formParams, ruleOptions, appOptions, systemTypeOptions, systemOptions } = this.state;
    const { listType } = this.props;
    let agentsList = this.agentsRender();
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
          <EuiFlexItem grow={false} style={{ minWidth: 105 }}>
            <EuiText textAlign="right">
              名称:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 270 }}>
            <EuiFieldText
              value={formParams['showname']}
              disabled={listType !== 'add'}
              onChange={(e) => this.changeValue(e, 'showname')}
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiTextColor color="subdued">{'指定唯一的名称。一旦创建成功，就不能编辑该名称。为了更清晰地了解基线检查内容，建议在名称中备注业务组或者IP，如: MySQL应用基线检查'}</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        {agentsList}
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <EuiText textAlign="right">{'基线规则'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 270 }}>
            <EuiRadioGroup
              className='planTask_vuldetScan_radioGroup'
              options={ruleOptions}
              idSelected={formParams['rule_mode']}
              onChange={(id) => this.changeRule(id)}
              name="modeRadio"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        { formParams['rule_mode'] === 'app' && (
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiText textAlign="right">{'应用基线'}:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ width: 270 }}>
              <EuiComboBox
                placeholder="选择应用基线"
                options={appOptions}
                selectedOptions={formParams['app_baseline']}
                onChange={(value) => this.changeBaseline(value, 'app_baseline')}
                isDisabled={!appOptions.length}
                isClearable={true}
                noSuggestions={appOptions.length === formParams['app_baseline'].length}
                data-test-subj="demoComboBox"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        { formParams['rule_mode'] === 'system' && (
          <div>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false} style={{ width: 100 }}>
                <EuiText textAlign="right">{'系统类型'}:</EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ width: 270 }}>
                <EuiComboBox
                  placeholder="选择系统类型"
                  options={systemTypeOptions}
                  selectedOptions={formParams['system_type']}
                  onChange={(value) => this.changeSystemType(value)}
                  isDisabled={!systemTypeOptions.length}
                  isClearable={true}
                  singleSelection={{ asPlainText: true }}
                  data-test-subj="demoComboBox"
                />
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false} style={{ width: 100 }}>
                <EuiText textAlign="right">{'系统基线'}:</EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ width: 270 }}>
                <EuiComboBox
                  placeholder="选择系统基线"
                  options={systemOptions}
                  selectedOptions={formParams['system_baseline']}
                  onChange={(value) => this.changeBaseline(value, 'system_baseline')}
                  isDisabled={!systemOptions.length}
                  isClearable={true}
                  noSuggestions={systemOptions.length === formParams['system_baseline'].length}
                  data-test-subj="demoComboBox"
                />
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiTextColor color="subdued">{'先选择系统类型，再选择相应类型下的系统基线'}</EuiTextColor>
              </EuiFlexItem>
            </EuiFlexGroup>
          </div>
        )}
        <EuiFlexGroup alignItems="stretch">
          <EuiFlexItem grow={false} style={{ width: 100, marginTop: '20px' }}>
            <EuiText textAlign="right">{'描述'}:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 270 }}>
            <EuiTextArea
              value={formParams['description']}
              onChange={(e) => this.changeValue(e, 'description')}
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