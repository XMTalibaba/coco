/*
 * Wazuh app - React component for building the agents table.
 *
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  EuiBasicTable,
  EuiButton,
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiToolTip,
  EuiTitle,
  EuiHealth,
  EuiSpacer,
  EuiCallOut,
  EuiOverlayMask,
  EuiConfirmModal,
  EuiLoadingSpinner,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiFieldText,
  EuiModalFooter,
  EuiForm,
  EuiFormRow,
  EuiProgress,
  EuiText,
  EuiSelect,
} from '@elastic/eui';
import { CheckUpgrade } from './checkUpgrade';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import { ActionAgents } from '../../../react-services/action-agents';
import { AppNavigate } from '../../../react-services/app-navigate';
import { GroupTruncate } from '../../../components/common/util';
import { WzSearchBar, filtersToObject } from '../../../components/wz-search-bar';
import { getAgentFilterValues } from '../../../controllers/management/components/management/groups/get-agents-filters-values';
import { WzButtonPermissions } from '../../../components/common/permissions/button';
import { formatUIDate } from '../../../react-services/time-service';
import { AppState } from '../../../react-services/app-state';
import { GenericRequest } from '../../../react-services/generic-request';
import GroupsHandler from '../../management/components/management/groups/utils/groups-handler';
import { TableSearch } from './table-search';

export class AgentsTable extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin();
    this.state = {
      agents: [],
      isLoading: false,
      pageIndex: 0,
      pageSize: 15,
      sortDirection: 'asc',
      sortField: 'id',
      totalItems: 0,
      selectedItems: [],
      allSelected: false,
      purgeModal: false,
      filters: sessionStorage.getItem('agents_preview_selected_options') ? JSON.parse(sessionStorage.getItem('agents_preview_selected_options')) : [],
      editAgent: '',
      isEditModalVisible: false,
      editTag: '',
      isOffliineCauseModalVisible: false,
      offlineCause: '',
      isOffliineCauseLoading: false,
      isDelModalVisible: false,
      delAgent: {},
      restartAgent: {},
      isRestartModalVisible: false,
      isCluster: false,
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
      currentUsername: '',
      currentPassword: '',
      isCurrentPasswordInvalid: false,
      valueAgent: '',
      valueCalibration: '',
      isValueModalVisible: false,
      currentUserInfo: {},
      departmentGroups: [],
    };
    this.suggestions = [
      { type: 'q', key: 'status', label: '状态', description: '按代理连接状态过滤', operators: ['=', '!=',], values: ['active', 'disconnected', 'never_connected'] },
      { type: 'q', key: 'os.platform', label: '操作系统平台', description: '按操作系统平台过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('os.platform', value, { q: 'id!=000' }) },
      { type: 'q', key: 'ip', label: 'ip', description: '按代理IP过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('ip', value, { q: 'id!=000' }) },
      { type: 'q', key: 'name', label: '名称', description: '按代理名称过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('name', value, { q: 'id!=000' }) },
      { type: 'q', key: 'id', label: 'id', description: '按代理ID过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('id', value, { q: 'id!=000' }) },
      { type: 'q', key: 'group', label: '组', description: '按代理所在组过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('group', value, { q: 'id!=000' }) },
      { type: 'q', key: 'node_name', label: '节点名称', description: '按节点名称过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('node_name', value, { q: 'id!=000' }) },
      { type: 'q', key: 'manager', label: '管理员', description: '按管理员过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('manager', value, { q: 'id!=000' }) },
      { type: 'q', key: 'version', label: '版本', description: '按代理版本过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('version', value, { q: 'id!=000' }) },
      { type: 'q', key: 'configSum', label: '配置校验和', description: '按代理配置校验和过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('configSum', value, { q: 'id!=000' }) },
      { type: 'q', key: 'mergedSum', label: '组校验和', description: '按代理组校验和过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('mergedSum', value, { q: 'id!=000' }) },
      // { type: 'q', key: 'dateAdd', label: '添加日期', description: '按添加日期过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('dateAdd', value, { q: 'id!=000' }) },
      // { type: 'q', key: 'lastKeepAlive', label: '上次连接', description: '按上次连接过滤', operators: ['=', '!=',], values: async (value) => getAgentFilterValues('lastKeepAlive', value, { q: 'id!=000' }) },
    ];
    this.downloadCsv.bind(this);
    this.groupsHandler = GroupsHandler;
  }

  async UNSAFE_componentWillMount() {
    const managerVersion = await WzRequest.apiReq('GET', '//', {});
    const totalAgent = await WzRequest.apiReq('GET', '/agents', {});
    const agentActive = await WzRequest.apiReq('GET', '/agents', {
      params: {
        q: 'status=active'
      }
    });

    this.setState({
      managerVersion: managerVersion.data.data.api_version,
      agentActive: agentActive.data.data.totalItems,
      avaibleAgents: totalAgent.data.data.affected_items
    });
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    const { field: sortField, direction: sortDirection } = sort;
    this._isMount && this.setState({
      pageIndex,
      pageSize,
      sortField,
      sortDirection
    });
  };

  async componentDidMount() {
    this._isMount = true;

    const clusterStatus = await WzRequest.apiReq('GET', `/cluster/status`, {});
    const clusterData = ((clusterStatus || {}).data || {}).data || {};
    const isCluster = clusterData.enabled === 'yes' && clusterData.running === 'yes';

    this.indexPattern = {...await this.KibanaServices.indexPatterns.get(AppState.getCurrentPattern())};

    let res = await AppState.getCurrentUserInfo();
    let currentUsername = res.userName;
    
    let { paramsOptions } = this.state;
    let groupIndex = paramsOptions.findIndex(k => k.type === 'group');
    let osIndex = paramsOptions.findIndex(k => k.type === 'os.platform');
    paramsOptions[groupIndex].selectOptions = await this.getGroupsOptions();
    paramsOptions[osIndex].selectOptions = await this.getOsOptions();

    this.setState({ isCluster, paramsOptions, currentUsername, currentUserInfo: res });

    await this.getItems();
  }

  componentWillUnmount() {
    this._isMount = false;
    if(sessionStorage.getItem('agents_preview_selected_options')){
      sessionStorage.removeItem('agents_preview_selected_options');
    }
  }

  async reloadAgents() {
    // const totalAgent = await WzRequest.apiReq('GET', '/agents', {});
    // this._isMount && this.setState({
    //   isLoading: true,
    //   avaibleAgents: totalAgent.data.data.items
    // });
    await this.getItems();
    await this.props.reload();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (!(_.isEqual(prevState.filters, this.state.filters))
      || prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize
      || prevState.sortField !== this.state.sortField
      || prevState.sortDirection !== this.state.sortDirection) {
      await this.getItems();
    } else if (!(_.isEqual(prevProps.filters, this.props.filters)) && this.props.filters && this.props.filters.length) {
      this.setState({ filters: this.props.filters, pageIndex: 0 });
      this.props.removeFilters();
    }
    // if (prevState.allSelected === false && this.state.allSelected === true) {
    //   this._isMount && this.setState({ loadingAllItem: true });
    //   this.getAllItems();
    // }
  }

  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });
      const { searchParams, currentUserInfo, departmentGroups } = this.state;
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
      const rawAgents = await this.props.wzReq(
        'GET',
        '/agents',
        { params }
      );

      const formatedAgents = (
        ((rawAgents || {}).data || {}).data || {}
      ).affected_items.map(this.formatAgent.bind(this));

      this._isMount &&
        this.setState({
          agents: formatedAgents,
          totalItems: (((rawAgents || {}).data || {}).data || {}).total_affected_items,
          isLoading: false
        });
    } catch (error) {
      this.setState({ isLoading: false });
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
      const rawOsItems = await this.props.wzReq(
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

  async getAllItems() {
    const { pageIndex, pageSize } = this.state;
    const filterTable = {
      offset: pageIndex * pageSize,
      limit: pageSize,
      q: this.buildQFilter(),
      sort: this.buildSortFilter()
    };

    const filterAll = {
      q: this.buildQFilter(),
      sort: this.buildSortFilter()
    };

    const rawAgents = await this.props.wzReq('GET', '/agents', filterTable);

    const agentsFiltered = await this.props
      .wzReq('GET', '/agents', filterAll)
      .then(() => {
        this._isMount && this.setState({ loadingAllItem: false });
      });

    const formatedAgents = (
      ((rawAgents || {}).data || {}).data || {}
    ).items.map(this.formatAgent.bind(this));
    this._isMount &&
      this.setState({
        agents: formatedAgents,
        avaibleAgents: agentsFiltered.data.data.items,
        totalItems: (((rawAgents || {}).data || {}).data || {}).totalItems,
        isLoading: false
      });
  }

  buildFilter() {
    const { pageIndex, pageSize, filters, searchParams, departmentGroups, currentUserInfo } = this.state;

    const filter = {
      ...filtersToObject(filters),
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize,
      sort: this.buildSortFilter()
    };
    filter.q = !filter.q ? `id!=000` : `id!=000;${filter.q}`;
    if (currentUserInfo.department && !searchParams.group) {
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

  buildQFilter() {
    const { q } = this.state;
    return q === '' ? `id!=000` : `id!=000;${q}`;
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
      agent_value: agent.agent_value,
      cpu: agent.cpu,
      mem: agent.mem,
      disk: agent.disk,
      net: agent.net,
      netbor: agent.netbor,
      status: agent.status,
      os: agent.os,
      group: checkField(agent.group),
      os_name: agent,
      version: agentVersion,
      node_name: node_name,
      dateAdd: agent.dateAdd,
      lastKeepAlive: agent.lastKeepAlive,
      actions: agent,
      upgrading: false,
      connect_net_balel: agent.connect_net === 'true' ? '连接' :  agent.connect_net === 'false' ? '未连接' : '-'
    };
  }

  actionButtonsRender(agent) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content="代理详情"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              this.props.toAgentDetails(agent)
              ev.stopPropagation()
            }}
            iconType="eye"
            color={'primary'}
            aria-label="代理详情"
          />
        </EuiToolTip>
        &nbsp;
        {/* {agent.status !== 'never_connected' &&
          <span>
            <EuiToolTip content="代理配置" position="left">
              <EuiButtonIcon
                onClick={ev => {
                  ev.stopPropagation();
                  this.props.clickAction(agent, 'configuration');
                }}
                color={'primary'}
                iconType="wrench"
                aria-label="代理配置"
              />
            </EuiToolTip>
            &nbsp;
          </span>
        } */}
        {(agent.status === 'disconnected' || agent.status === 'never_connected') && (agent.os || {}).platform !== 'windows' &&
          <span>
            <EuiToolTip content="启动代理" position="left">
              <EuiButtonIcon
                onClick={ev => {
                  ev.stopPropagation();
                  this.toStart(agent);
                }}
                color={'primary'}
                iconType="play"
                aria-label="启动代理"
              />
            </EuiToolTip>
            &nbsp;
          </span>
        }
        {agent.status === 'disconnected' &&
          <span>
            <EuiToolTip content="查看离线原因" position="left">
              <EuiButtonIcon
                onClick={ev => {
                  ev.stopPropagation();
                  this.toShowOfflineCauseModal(agent);
                }}
                color={'primary'}
                iconType="offline"
                aria-label="查看离线原因"
              />
            </EuiToolTip>
            &nbsp;
          </span>
        }
        {agent.status === 'active' && (agent.os || {}).platform !== 'windows' &&
          <span>
            <EuiToolTip content="关闭代理" position="left">
              <EuiButtonIcon
                onClick={ev => {
                  ev.stopPropagation();
                  this.toStop(agent);
                }}
                color={'primary'}
                iconType="stop"
                aria-label="关闭代理"
              />
            </EuiToolTip>
            &nbsp;
          </span>
        }
        {agent.status === 'active' &&
          <span>
            <EuiToolTip content="重启代理" position="left">
              <EuiButtonIcon
                onClick={ev => {
                  ev.stopPropagation();
                  this.toShowRestartModel(agent);
                }}
                color={'primary'}
                iconType="refresh"
                aria-label="重启代理"
              />
            </EuiToolTip>
            &nbsp;
          </span>
        }
        <EuiToolTip
          content={agent.status === 'active' ? '已连接状态的代理不可删除，请先关闭该代理' : '删除代理'}
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toShowDelModal(agent);
            }}
            iconType="trash"
            color={'danger'}
            aria-label="删除代理"
            disabled={agent.status === 'active'}
          />
        </EuiToolTip>
      </div>
    );
  }

  toShowValueModal(agent) {
    this.setState({ valueAgent: agent.id, valueCalibration: agent.agent_value ? agent.agent_value : '' });
    this.setValueModal(true);
  }

  setValueModal(flag) {
    this.setState({isValueModalVisible: flag});
    if (!flag) this.setState({ valueAgent: '', valueCalibration: '' });
  }

  toShowEditModal(agent) {
    this.setState({ editAgent: agent.id, editTag: agent.tag });
    this.setEditModal(true);
  }

  setEditModal(flag) {
    this.setState({isEditModalVisible: flag});
    if (!flag) this.setState({ editAgent: '', editTag: '' });
  }
  
  toShowDelModal(agent) {
    this.setState({ delAgent: agent });
    this.setDelModal(true);
  }

  setDelModal(flag) {
    this.setState({isDelModalVisible: flag});
    if (!flag) this.setState({ delAgent: {}, currentPassword: '', isCurrentPasswordInvalid: false });
  }

  toShowRestartModel(agent) {
    this.setState({ restartAgent: agent });
    this.setRestartModal(true);
  }

  setRestartModal(flag) {
    this.setState({isRestartModalVisible: flag});
    if (!flag) this.setState({ restartAgent: {} });
  }

  async toShowOfflineCauseModal(agent) {
    this.setState({ isOffliineCauseLoading: true });
    this.setOfflineCauseModal(true);
    const {isCluster} = this.state;

    const messageOptions = [
      { value: 'authcode expired.', text: '授权过期' },
      { value: 'agent sleep.', text: '代理休眠' },
      { value: 'process stop.', text: '代理服务关闭' },
      { value: 'host shut down.', text: '代理关机' },
    ]
    const rawRules = await WzRequest.apiReq('GET', `${isCluster ? '/cluster/' + agent.node_name : ''}/agents/${agent.id}/disconnectreason`, {});
    const message = ((rawRules || {}).data || {}).message;
    let msg = messageOptions.find(k => k.value === message);
    let offlineCause = msg ? msg.text : '程序异常';
    this.setState({
      offlineCause,
      isOffliineCauseLoading: false
    });
  }

  async validateCurrentPassword() {
    try {
      const { currentUsername, currentPassword } = this.state;
      let password = Buffer.from(`${currentPassword}`).toString('base64');
      let params = {
        username: currentUsername,
        password
      }
      await getHttp().post(`/auth/login`, { body: JSON.stringify(params)});
      this.toDelAgent();
      this.setDelModal(false);
    } catch (error) {
      this.setState({ isCurrentPasswordInvalid: true });
    }
  }

  async toDelAgent() {
    const { delAgent } = this.state;
    let affected_items = 0;
    try {
      const rawItems = await WzRequest.apiReq('DELETE', `/agents?pretty=true&agents_list=${delAgent.id}&status=${delAgent.status}&purge=true&older_than=0s`, {});
      const { total_affected_items } = ((rawItems || {}).data || {}).data;
      affected_items = total_affected_items;
    } catch (error) {
      console.log(error)
    }
    if (affected_items === 1) {
      GenericRequest.request(
        'POST',
        `/elastic/delAlerts`,
        {
          pattern: this.indexPattern.title,
          agent: delAgent.id
        }
      );

      this.getItems();
      this.showToast(
        'success',
        '成功',
        '删除代理成功',
        3000
      );
    }
    else {
      this.showToast(
        'danger',
        '警告',
        '删除代理失败',
        3000
      );
    }
    this.setDelModal(false)
  }

  async toRestartAgent() {
    try {
      const { restartAgent } = this.state;
      const rawItems = await WzRequest.apiReq('PUT', `/agents/${restartAgent.id}/restart`, {});
      const { total_affected_items } = ((rawItems || {}).data || {}).data;
      if (total_affected_items === 1) {
        this.showToast(
          'success',
          '成功',
          '重启代理成功，请稍后刷新列表查看执行状态',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '重启代理失败',
          3000
        );
      }
    } catch (error) {
      if (error.includes('1117')) {
        this.showToast(
          'danger',
          '警告',
          '重启代理失败: 无法连接代理',
          3000
        );
      }
      else if (error.includes('1707')) {
        this.showToast(
          'danger',
          '警告',
          '重启代理失败: 代理未连接，请刷新列表更新代理状态',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '重启代理失败: ' + error,
          3000
        );
      }
    }
    this.setRestartModal(false)
  }

  async toStart(agent) {
    try {
      const rawItems = await WzRequest.apiReq('PUT', `/agents/command?pretty=true&agents_list=${agent.id}&send_command=/var/ossec/bin/ossec-control+start`, {});
      const { total_affected_items } = ((rawItems || {}).data || {}).data;
      if (total_affected_items === 1) {
        this.showToast(
          'success',
          '成功',
          '启动代理成功，请稍后刷新列表查看执行状态',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '启动代理失败',
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '启动代理失败: ' + error,
        3000
      );
    }
  }

  async toStop(agent) {
    try {
      const rawItems = await WzRequest.apiReq('PUT', `/agents/command?pretty=true&agents_list=${agent.id}&send_command=/var/ossec/bin/ossec-control+sleep`, {});
      const { total_affected_items } = ((rawItems || {}).data || {}).data;
      if (total_affected_items === 1) {
        this.showToast(
          'success',
          '成功',
          '关闭代理成功，请稍后刷新列表查看执行状态',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '关闭代理失败',
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '关闭代理失败: ' + error,
        3000
      );
    }
  }

  setOfflineCauseModal(flag) {
    this.setState({isOffliineCauseModalVisible: flag});
    if (!flag) this.setState({ offlineCause: '' });
  }

  setUpdateTag(e) {
    let editTag = e.target.value;
    this.setState({ editTag });
  }

  setUpdateValue(e) {
    let valueCalibration = e.target.value;
    this.setState({ valueCalibration });
  }

  async saveTag() {
    try {
      const { editAgent, editTag } = this.state;
      const rawRules = await WzRequest.apiReq('PUT', `/agents?pretty=true&&agents_list=${editAgent}&&agent_tag=${encodeURIComponent(editTag)}`, {});
      // 下方 agent_tag 参数中文，node解析接口路径会报错
      // const rawRules = await WzRequest.apiReq('PUT', `/agents?pretty=true&&agents_list=${editAgent}&&agent_tag=${editTag}`, {});
      const { total_affected_items } = ((rawRules || {}).data || {}).data;
      if (total_affected_items === 1) {
        this.setEditModal(false);
        this.getItems();
        this.showToast(
          'success',
          '成功',
          '代理标签编辑成功',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '代理标签编辑失败',
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '代理标签编辑失败: ' + error,
        3000
      );
    }
  }

  async saveValue() {
    try {
      const { valueAgent, valueCalibration } = this.state;
      if (!valueCalibration) {
        this.showToast(
          'danger',
          '警告',
          '代理价值标定编辑失败: 价值标定不可为空',
          3000
        );
        return;
      }
      const rawRules = await WzRequest.apiReq('PUT', `/agents/value_level?agents_list=${valueAgent}&&agents_level=${valueCalibration}`, {});
      const msg = ((rawRules || {}).data || {}).message;
      if (msg.includes('successfully')) {
        this.setValueModal(false);
        this.getItems();
        this.showToast(
          'success',
          '成功',
          '代理价值标定编辑成功',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '代理价值标定编辑失败',
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '代理价值标定编辑失败: ' + error,
        3000
      );
    }
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
      <span className="euiTableCellContent euiTableCellContent--overflowingContent">
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

  reloadAgent = () => {
    this._isMount && this.setState({
      isLoading: true
    });
    this.props.reload();
  };

  addUpgradeStatus(version, agent) {
    const { managerVersion } = this.state;
    return (
      <CheckUpgrade
        {...agent}
        managerVersion={managerVersion}
        changeStatusUpdate={this.changeUpgradingState}
        reloadAgent={this.reloadAgent}
      />
    );
  }

  downloadCsv = () => {
    const filters = this.buildFilter();
    const formatedFilters = Object.keys(filters)
      .filter(field => !['limit', 'offset', 'sort'].includes(field))
      .map(field => ({name: field, value: filters[field]}))
    this.props.downloadCsv(formatedFilters);
  };
  formattedButton() {
    return (
      <EuiFlexItem grow={false}>
        <EuiButton
          size="s"
          onClick={this.downloadCsv}
        >
          导出
        </EuiButton>
      </EuiFlexItem>
    );
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  /* MULTISELECT TABLE */
  onSelectionChange = selectedItems => {
    const { managerVersion, pageSize } = this.state;

    selectedItems.forEach(item => {
      if (managerVersion > item.version && item.version !== '.') {
        item.outdated = true;
      }
    });

    selectedItems.length !== pageSize
      ? this._isMount && this.setState({ allSelected: false })
      : false;

    this._isMount && this.setState({ selectedItems });
  };

  renderUpgradeButton() {
    const { selectedItems } = this.state;

    if (
      selectedItems.length === 0 ||
      (selectedItems.length > 0 &&
        selectedItems.filter(item => item.outdated).length === 0) ||
      (selectedItems.length > 0 &&
        selectedItems.filter(item => item.upgrading).length > 0) ||
      (selectedItems.length > 0 &&
        selectedItems.filter(item => item.status === 'Active').length === 0) ||
      (selectedItems.length > 0 &&
        selectedItems.filter(item => item.status === 'Active').length === 0 &&
        selectedItems.filter(item => item.status === 'Disconnected').length >
        0) ||
      selectedItems.filter(item => item.outdated && item.status === 'Active')
        .length === 0
    ) {
      return;
    }

    return (
      <EuiFlexItem grow={false}>
        <EuiButton
          color="secondary"
          iconType="sortUp"
          onClick={this.onClickUpgrade}
        >
          更新{' '}
          {
            selectedItems.filter(
              item => item.outdated && item.status === 'Active'
            ).length
          }{' '}
          代理
        </EuiButton>
      </EuiFlexItem>
    );
  }

  renderUpgradeButtonAll() {
    const { selectedItems, avaibleAgents, managerVersion } = this.state;

    if (
      selectedItems.length > 0 &&
      avaibleAgents.filter(
        agent =>
          agent.version !== 'Wazuh ' + managerVersion &&
          agent.status === 'Active'
      ).length === 0
    ) {
      return;
    }

    return (
      <EuiFlexItem grow={false}>
        <EuiButton
          color="secondary"
          iconType="sortUp"
          onClick={this.onClickUpgradeAll}
        >
          更新所有代理
        </EuiButton>
      </EuiFlexItem>
    );
  }

  renderRestartButton() {
    const { selectedItems } = this.state;

    if (
      selectedItems.length === 0 ||
      selectedItems.filter(item => item.status === 'Active').length === 0
    ) {
      return;
    }

    return (
      <EuiFlexItem grow={false}>
        <EuiButton
          color="primary"
          iconType="refresh"
          onClick={this.onClickRestart}
        >
          重启{' '}
          {selectedItems.filter(item => item.status === 'Active').length} 个代理
        </EuiButton>
      </EuiFlexItem>
    );
  }

  renderRestartButtonAll() {
    const { selectedItems, agentActive, avaibleAgents } = this.state;

    if (
      (selectedItems.length > 0 &&
        avaibleAgents.filter(item => item.status === 'Active').length === 0 &&
        selectedItems.length === 0) ||
      agentActive === 0
    ) {
      return;
    }

    return (
      <EuiFlexItem grow={false}>
        <EuiButton
          color="primary"
          iconType="refresh"
          onClick={this.onClickRestartAll}
        >
          重启所有代理
        </EuiButton>
      </EuiFlexItem>
    );
  }

  renderPurgeButton() {
    const { selectedItems } = this.state;

    if (selectedItems.length === 0) {
      return;
    }

    return (
      <EuiFlexItem grow={false}>
        <EuiButton
          iconType="trash"
          color="danger"
          onClick={() => {
            this.setState({ purgeModal: true });
          }}
        >
          删除 {selectedItems.length} 个代理
        </EuiButton>
      </EuiFlexItem>
    );
  }

  renderPurgeButtonAll() {
    const { selectedItems, allSelected } = this.state;

    if (selectedItems.length === 0 && !allSelected) {
      return;
    }

    return (
      <EuiFlexItem grow={false}>
        <EuiButton
          iconType="trash"
          color="danger"
          onClick={() => {
            this._isMount && this.setState({ purgeModal: true });
          }}
        >
          删除所有代理
        </EuiButton>
      </EuiFlexItem>
    );
  }

  callOutRender() {
    const { selectedItems, pageSize, allSelected, totalItems } = this.state;

    if (selectedItems.length === 0) {
      return;
    } else if (selectedItems.length === pageSize) {
      return (
        <div>
          <EuiSpacer size="m" />
          <EuiCallOut
            size="s"
            title={
              !allSelected
                ? `本页已选择 ${selectedItems.length} 个代理`
                : ''
            }
          >
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <EuiButton
                  onClick={() => {
                    this._isMount && this.setState(prevState => ({
                      allSelected: !prevState.allSelected
                    }));
                  }}
                >
                  {allSelected
                    ? `清除所有选择 (${totalItems})`
                    : `选择所有代理 (${totalItems})`}
                </EuiButton>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiCallOut>
          <EuiSpacer size="s" />
        </div>
      );
    }
  }

  setUpgradingState(agentID) {
    const { agents } = this.state;
    agents.forEach(element => {
      element.id === agentID ? (element.upgrading = true) : false;
    });
    this._isMount && this.setState({ agents });
  }

  changeUpgradingState = agentID => {
    const { agents } = this.state;
    agents.forEach(element => {
      element.id === agentID && element.upgrading === true
        ? (element.upgrading = false)
        : false;
    });
    this._isMount && this.setState(() => ({ agents }));
  };

  onClickUpgrade = () => {
    const { selectedItems } = this.state;
    ActionAgents.upgradeAgents(selectedItems);
  };

  onClickUpgradeAll = () => {
    const { avaibleAgents, managerVersion } = this.state;
    ActionAgents.upgradeAllAgents(avaibleAgents, managerVersion);
  };

  onClickRestart = () => {
    const { selectedItems } = this.state;
    ActionAgents.restartAgents(selectedItems);
    this.reloadAgents();
  };

  onClickRestartAll = () => {
    const { avaibleAgents } = this.state;
    ActionAgents.restartAllAgents(avaibleAgents);
    this.reloadAgents();
  };

  onClickPurge = () => {
    const { selectedItems } = this.state;
    const auxAgents = selectedItems
      .map(agent => {
        return agent.id !== '000' ? agent.id : null;
      })
      .filter(agent => agent !== null);

    WzRequest.apiReq('DELETE', `/agents`, {
      purge: true,
      ids: auxAgents,
      older_than: '1s'
    })
      .then(value => {
        value.status === 200
          ? this.showToast(
            'success',
            `选中的代理删除成功`,
            '',
            5000
          )
          : this.showToast(
            'warning',
            `选中的代理删除失败`,
            '',
            5000
          );
      })
      .catch(error => {
        this.showToast(
          'danger',
          `选中的代理删除失败`,
          error,
          5000
        );
      })
      .finally(() => {
        this.getAllItems();
        this.reloadAgents();
      });
    this._isMount && this.setState({ purgeModal: false });
  };

  onClickPurgeAll = () => {
    const { avaibleAgents } = this.state;
    const auxAgents = avaibleAgents
      .map(agent => {
        return agent.id !== '000' ? agent.id : null;
      })
      .filter(agent => agent !== null);

    WzRequest.apiReq('DELETE', `/agents`, {
      purge: true,
      ids: auxAgents,
      older_than: '1s'
    })
      .then(value => {
        value.status === 200
          ? this.showToast(
            'success',
            `所有代理删除成功`,
            '',
            5000
          )
          : this.showToast('warning', `所有代理删除失败`, '', 5000);
      })
      .catch(error => {
        this.showToast('danger', `所有代理删除失败`, error, 5000);
      })
      .finally(() => {
        this.getAllItems();
        this.reloadAgents();
      });

    this._isMount && this.setState({ purgeModal: false });
  };

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
        width: '120',
        // truncateText: true,
        sortable: true
      },
      {
        field: 'name',
        name: '主机名',
        sortable: true,
        width: '120',
        // truncateText: true
      },
      {
        field: 'group',
        name: '组',
        width: '80',
        // truncateText: true,
        sortable: true,
        render: groups => groups !== '-' ? groups.join('，') : '-'
      },
      {
        field: 'actions',
        name: '标签',
        width: '100',
        sortable: true,
        render: actions => (
          <EuiToolTip
            content="编辑代理标签"
            position="left"
          >
            <EuiButtonEmpty size="xs" className='euiTableCellContent--overflowingContent' onClick={() => this.toShowEditModal(actions)}>{actions.tag ? actions.tag : '无'}</EuiButtonEmpty>
          </EuiToolTip>
        )
      },
      {
        field: 'actions',
        name: '价值标定',
        width: '70',
        sortable: true,
        render: actions => {
          const valueOptions = {
            'high': '高',
            'normal': '中',
            'low': '低'
          }
          return (<EuiToolTip
            content="编辑代理价值标定"
            position="left"
          >
            <EuiButtonEmpty size="xs" className='euiTableCellContent--overflowingContent' onClick={() => this.toShowValueModal(actions)}>{actions.agent_value ? valueOptions[actions.agent_value] : '无'}</EuiButtonEmpty>
          </EuiToolTip>)
        }
      },
      {
        field: 'os_name',
        name: '操作系统',
        sortable: true,
        width: '15%',
        // truncateText: true,
        render: this.addIconPlatformRender
      },
      {
        field: 'node_name',
        name: '集群节点',
        width: '10%',
        // truncateText: true,
        sortable: true
      },
      {
        field: 'version',
        name: '版本',
        width: '5%',
        // truncateText: true,
        sortable: true
        /* render: (version, agent) => this.addUpgradeStatus(version, agent), */
      },
      {
        field: 'connect_net_balel',
        name: '外联状态',
        width: '80',
        // truncateText: true,
      },
      {
        field: 'dateAdd',
        name: '注册日期',
        width: '10%',
        // truncateText: true,
        sortable: true,
        render: time => formatUIDate(time)
      },
      {
        field: 'lastKeepAlive',
        name: '上次连接时间',
        width: '10%',
        // truncateText: true,
        sortable: true,
        render: time => formatUIDate(time)
      },
      {
        field: 'status',
        name: '状态',
        // truncateText: true,
        sortable: true,
        width: '80',
        render: this.addHealthStatusRender
      },
      {
        align: 'right',
        width: '150',
        field: 'actions',
        name: '操作',
        render: agent => this.actionButtonsRender(agent)
      }
    ];
  }

  headRender() {
    const { totalItems } = this.state;
    const formattedButton = this.formattedButton();
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                {!!this.state.totalItems && (
                  <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                    <h2>代理 ({this.state.totalItems})</h2>
                  </EuiTitle>
                )}
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.props.addingNewAgent()}
            >
              部署代理
            </EuiButton>
          </EuiFlexItem>
          {totalItems !== 0 && formattedButton}
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.props.toHostFound()}
            >
              主机发现
            </EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.getItems()}
            >
              刷新
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
      </div>
    );
  }

  filterBarRender() {
    return (
      <EuiFlexGroup>
        <EuiFlexItem style={{ marginRight: 0 }}>
          <WzSearchBar
            noDeleteFiltersOnUpdateSuggests
            filters={this.state.filters}
            suggestions={this.suggestions}
            keyName="key"
            onFiltersChange={filters => this.setState({ filters, pageIndex: 0 })}
            placeholder="筛选或查询代理"
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            iconType="refresh"
            fill={true}
            onClick={() => this.reloadAgents()}
          >
            刷新
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  tableRender() {
    const getRowProps = item => {
      const { id } = item;
      return {
        'data-test-subj': `row-${id}`,
        className: 'customRowClass',
        onClick: () => { }
      };
    };

    const getCellProps = (item, column) => {
      if(column.field=="actions"){
        return
      }
      return {
        onMouseDown: (ev) => {
          this.props.toAgentDetails(item);
          // AppNavigate.navigateToModule(ev, 'agents', { "tab": "welcome", "agent": item.id, });
          ev.stopPropagation()
        }
      }
    };

    const {
      pageIndex,
      pageSize,
      totalItems,
      agents,
      sortField,
      sortDirection,
      isLoading
    } = this.state;
    const columns = this.columns();
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

    const selection = {
      selectable: agent => agent.id,
      /* onSelectionChange: this.onSelectionChange */
    };

    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiBasicTable
            items={agents}
            itemId="id"
            columns={columns}
            onChange={this.onTableChange}
            sorting={sorting}
            loading={isLoading}
            rowProps={getRowProps}
            cellProps={getCellProps}
            /*             isSelectable={false}
                        selection={selection} */
            noItemsMessage="没有找到代理"
            {...(pagination && { pagination })}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
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
  
  getList(searchParams) {
    this.setState({ searchParams, pageIndex: 0 }, this.getItems);
  }

  render() {
    const {
      allSelected,
      purgeModal,
      selectedItems,
      loadingAllItem,
      isEditModalVisible,
      editTag,
      isOffliineCauseModalVisible,
      offlineCause,
      isOffliineCauseLoading,
      isDelModalVisible,
      delAgent,
      isRestartModalVisible,
      paramsOptions,
      isCurrentPasswordInvalid,
      isValueModalVisible,
      valueCalibration,
    } = this.state;
    const title = this.headRender();
    const filter = this.filterBarRender();
    const upgradeButton = this.renderUpgradeButton();
    const restartButton = this.renderRestartButton();
    const purgeButton = this.renderPurgeButton();
    const upgradeButtonAll = this.renderUpgradeButtonAll();
    const restartButtonAll = this.renderRestartButtonAll();
    const purgeButtonAll = this.renderPurgeButtonAll();
    const table = this.tableRender();
    const callOut = this.callOutRender();
    let renderPurgeModal, loadItems, barButtons, editModal, offliineCauseModal, delModal, restartModel, valueModal;
    if (isOffliineCauseModalVisible) {
      offliineCauseModal = (
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setOfflineCauseModal(false)} initialFocus="[name=popswitch]">
            { isOffliineCauseLoading && (
              <EuiProgress size="xs" color="primary" />
            )}
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>代理离线原因</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody style={{maxHeight: '450px', overflowY: 'auto'}}>
							<p style={{whiteSpace: 'pre-wrap'}}>{offlineCause}</p>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={() => this.setOfflineCauseModal(false)}>确认</EuiButtonEmpty>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }

    if (isEditModalVisible) {
      editModal = (
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setEditModal(false)} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>编辑代理标签</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <div style={{ padding: '4px 0'}}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">标签:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiFieldText
                      value={editTag}
                      onChange={(e) => this.setUpdateTag(e)}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={() => this.setEditModal(false)}>取消</EuiButtonEmpty>
              <EuiButton onClick={() => this.saveTag()} fill>保存</EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }

    if (isValueModalVisible) {
      const valueOptions = [
        { value: '', text: '请选择价值标定'},
        { value: 'high', text: '高'},
        { value: 'normal', text: '中'},
        { value: 'low', text: '低'},
      ];
      valueModal = (
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setValueModal(false)} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>编辑代理价值标定</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <div style={{ padding: '4px 0'}}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">价值标定:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiSelect
                      options={valueOptions}
                      value={valueCalibration}
                      onChange={(e) => this.setUpdateValue(e)}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={() => this.setValueModal(false)}>取消</EuiButtonEmpty>
              <EuiButton onClick={() => this.saveValue()} fill>保存</EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }

    if (purgeModal) {
      renderPurgeModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title={
              allSelected
                ? '删除所有代理'
                : `删除 ${selectedItems.length} 个代理`
            }
            onCancel={() => {
              this.setState({ purgeModal: false });
            }}
            onConfirm={allSelected ? this.onClickPurgeAll : this.onClickPurge}
            cancelButtonText="取消操作"
            confirmButtonText="确定执行"
            defaultFocusedButton="confirm"
            buttonColor="danger"
          >
            <p>是否确认操作？</p>
          </EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

    if (loadingAllItem) {
      barButtons = (
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiLoadingSpinner size="l" />
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    } else {
      barButtons = (
        <EuiFlexGroup>
          {allSelected ? upgradeButtonAll : upgradeButton}
          {allSelected ? restartButtonAll : restartButton}
          {allSelected ? purgeButtonAll : purgeButton}
        </EuiFlexGroup>
      );
    }

    if (isDelModalVisible) {
      delModal = (
        // <EuiOverlayMask>
        //   <EuiConfirmModal
        //     title="确认删除该代理吗？"
        //     onCancel={() => this.setDelModal(false)}
        //     onConfirm={() => this.toDelAgent()}
        //     cancelButtonText="取消"
        //     confirmButtonText="确认"
        //     buttonColor="danger"
        //     defaultFocusedButton="confirm"
        //   ></EuiConfirmModal>
        // </EuiOverlayMask>
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setDelModal(false)} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>验证用户</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <div style={{ padding: '4px 0'}}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiText textAlign="right">当前密码:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiFieldText
                      type="password"
                      onChange={(e) => {
                        this.setState({ isCurrentPasswordInvalid: false, currentPassword: e.target.value });
                      }}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
              {isCurrentPasswordInvalid && (
                <EuiText id="error" color="danger" textAlign="center">
                  <b>{'当前密码验证失败'}</b>
                </EuiText>
              )}
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={() => this.setDelModal(false)}>取消</EuiButtonEmpty>
              <EuiButton onClick={() => this.validateCurrentPassword()} fill>确认</EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }

    if (isRestartModalVisible) {
      restartModel = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认重启该代理吗？"
            onCancel={() => this.setRestartModal(false)}
            onConfirm={() => this.toRestartAgent()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          ></EuiConfirmModal>
        </EuiOverlayMask>
      )
    }

    return (
      <div>
        {/* {filter}
        <EuiSpacer size="m" /> */}
        <EuiPanel paddingSize="m">
          <TableSearch paramsOptions={paramsOptions} getList={(searchParams) => this.getList(searchParams)} />
          {title}
          {loadItems}
          {selectedItems.length > 0 && barButtons}
          {callOut}
          {table}
          {renderPurgeModal}
          {editModal}
          {offliineCauseModal}
          {delModal}
          {restartModel}
          {valueModal}
        </EuiPanel>
      </div>
    );
  }
}

AgentsTable.propTypes = {
  wzReq: PropTypes.func,
  addingNewAgent: PropTypes.func,
  downloadCsv: PropTypes.func,
  clickAction: PropTypes.func,
  toHostFound: PropTypes.func,
  toAgentDetails: PropTypes.func,
  timeService: PropTypes.func,
  reload: PropTypes.func
};
