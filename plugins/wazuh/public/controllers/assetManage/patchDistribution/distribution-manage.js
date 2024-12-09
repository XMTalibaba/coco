import React, { Component, Fragment } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
	EuiPanel,
  EuiBasicTable,
  EuiSpacer,
  EuiToolTip,
  EuiFilePicker,
  EuiInMemoryTable,
  EuiText,
  EuiButton,
  EuiFieldText,
  EuiButtonEmpty,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiHealth,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { filtersToObject } from '../../../components/wz-search-bar';
import { formatUIDate } from '../../../react-services/time-service';
import { WzRequest } from '../../../react-services/wz-request';
import { AppState } from '../../../react-services/app-state';
import GroupsHandler from '../../management/components/management/groups/utils/groups-handler';
import '../../hostProtection/blackWhiteList/blackWhiteList.scss';

export class DistributionManage extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      isLoading: false,
      saveParams: {
        agents: '',
        file: '',
        command: ''
      },
      isDistribution: false,
      isModalVisible: false,
      filters: sessionStorage.getItem('agents_preview_selected_options') ? JSON.parse(sessionStorage.getItem('agents_preview_selected_options')) : [],
      agentPageIndex: 0,
      agentPageSize: 15,
      agentTotalItems: 0,
      agentListItems: [],
      agentsTable: React.createRef(),
      selectedAgents: [],
      fileListItems: [],
      fileTable: React.createRef(),
      selectedFile: [],
      resultListItems: [],
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
    await this.getItems();
    await this.getAgentItems();
    await this.getFiletems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }

  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });

      const rawItems = await WzRequest.apiReq( 'GET', `/agents/patch?pretty=true`, {} );
      let listItems = (
        ((rawItems || {}).data || {}).data || {}
      ).affected_items.map(k => {
        k.agentlist = JSON.parse(k.agent.replaceAll('\'', '\"')).join('，');
        return k;
      })
      const { total_affected_items } = ((rawItems || {}).data || {}).data || {};

      this._isMount &&
        this.setState({
          listItems,
          totalItems: total_affected_items,
          isLoading: false
        });
    } catch (error) {
      console.log(error)
      this.setState({ isLoading: false });
    }
  }

  async getAgentItems() {
    try {
      const { agentPageIndex, agentPageSize, filters, departmentGroups, currentUserInfo } = this.state;
      if (currentUserInfo.department && departmentGroups.length === 0) {
        return
      }
      const filter = {
        ...filtersToObject(filters),
        offset: (agentPageIndex * agentPageSize) || 0,
        limit: agentPageSize,
        q: 'id!=000'
      };
      if (currentUserInfo.department) {
        filter.q = `${filter.q};(${departmentGroups.map(k => `group=${k.name}`).join(',')})`
      }
      const rawAgents = await WzRequest.apiReq(
        'GET',
        '/agents',
        { params: filter }
      );

      const formatedAgents = (
        ((rawAgents || {}).data || {}).data || {}
      ).affected_items.map(this.formatAgent.bind(this));

      this._isMount &&
        this.setState({
          agentListItems: formatedAgents,
          agentTotalItems: (((rawAgents || {}).data || {}).data || {}).total_affected_items
        });
    } catch (error) {
      console.log(error)
    }
  }

  async getFiletems() {
    try {
      const rawItems = await WzRequest.apiReq( 'GET', `/manager/uploadfile?pretty=true`, {} );
      const { affected_items, total_affected_items } = ((rawItems || {}).data || {}).data || {}

      this._isMount &&
        this.setState({
          fileListItems: affected_items
        });
    } catch (error) {
      console.log(error)
    }
  }

  formatAgent(agent) {
    const lastKeepAlive = (date) => {
      return date !== undefined ? formatUIDate(date) : '-';
    };
    const node_name = agent.node_name && agent.node_name !== 'unknown' ? agent.node_name : '-';
    
    return {
      id: agent.id,
      name: agent.name,
      ip: agent.ip,
      tag: agent.tag,
      status: agent.status,
      node_name: node_name,
      dateAdd: formatUIDate(agent.dateAdd),
      lastKeepAlive: lastKeepAlive(agent.lastKeepAlive),
      actions: agent,
      upgrading: false
    };
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    this._isMount && this.setState({
      pageIndex,
      pageSize
    });
  };

  columns() {
    return [
      {
        field: 'agentlist',
        name: '代理',
      },
      {
        field: 'filename',
        name: '补丁',
      },
      {
        field: 'cmd',
        name: '命令',
        render: cmd => cmd === 'None' ? '-' : cmd
      },
      {
        field: 'time',
        name: '时间',
      },
      {
        name: '分发结果',
        render: item => item.result.length === 0 ? '分发中' : '分发完成'
      },
      {
        align: 'right',
        field: 'result',
        width: '80',
        name: '操作',
        render: result => this.actionButtonsRender(result)
      }
    ]
  }

  actionButtonsRender(result) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content={`${result.length === 0 ? '分发中，请稍后查看分发结果' : '查看分发结果'}`}
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              this.setState({ resultListItems: result, isModalVisible: 'result' })
              ev.stopPropagation()
            }}
            iconType="eye"
            color={'primary'}
            aria-label="查看分发结果"
            disabled={result.length === 0}
          />
        </EuiToolTip>
        &nbsp;
      </div>
    )
  }

  tableRender() {
    const {
      listItems,
      isLoading,
      totalItems,
    } = this.state;
    const columns = this.columns();
    const message = isLoading ? false : '没有结果...';
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>分发历史 ({totalItems})</h2>
                </EuiTitle>
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
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
        <EuiInMemoryTable
          itemId="id"
          items={listItems}
          loading={isLoading}
          columns={columns}
          pagination={{ pageSizeOptions: [10, 15] }}
          sorting={true}
          message={message}
          search={{ box: { incremental: true, placeholder: '过滤' }}}
        />
      </div>
    )
  }

  onChangeData(value, type) {
    const { saveParams } = this.state;
    saveParams[type] = value;
    this.setState({ saveParams });
  }

  distributionRender() {
    const { saveParams, isDistribution } = this.state;
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>补丁分发</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 50 }}>
            <EuiText textAlign="right">代理:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFieldText
              value={saveParams.agents}
              disabled
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={() => this.setState({ isModalVisible: 'agent' })}>
              选择代理
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 50 }}>
            <EuiText textAlign="right">补丁:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFieldText
              value={saveParams.file}
              disabled
            />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={() => this.setState({ isModalVisible: 'file' })}>
              选择补丁
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 50 }}>
            <EuiText textAlign="right">命令:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
          <EuiFieldText
              value={saveParams.command}
              onChange={(e) => this.onChangeData(e.target.value, 'command')}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiButton
          size="s"
          onClick={() => this.toDistribution()}
          isLoading={isDistribution}
        >
          分发
        </EuiButton>
      </div>
    );
  }

  selectAgents() {
    const { selectedAgents, saveParams } = this.state;
    if (selectedAgents.length === 0) {
      this.showToast(
        'danger',
        '警告',
        '请至少选择一条代理',
        3000
      );
      return;
    }
    saveParams.agents = selectedAgents.map(k => k.id).join(',');
    this.setState({ saveParams, isModalVisible: false })
  }

  selectFile() {
    const { selectedFile, saveParams } = this.state;
    if (selectedFile.length === 0) {
      this.showToast(
        'danger',
        '警告',
        '请选择一条补丁',
        3000
      );
      return;
    }
    saveParams.file = selectedFile[0].name;
    this.setState({ saveParams, isModalVisible: false })
  }

  async toDistribution() {
    try {
      const { saveParams } = this.state;
      if (!saveParams.agents || !saveParams.file) {
        this.showToast(
          'danger',
          '警告',
          '分发失败: 代理、补丁为必选',
          3000
        );
        return;
      }
      this.setState({ isDistribution: true });
      const rawItems = await WzRequest.apiReq('PUT', `/agents/patch?pretty=true&agents_list=${saveParams.agents}&send_file=${encodeURIComponent(saveParams.file)}${saveParams.command ? `&send_command=${saveParams.command}` : ''}`, {});
			const { total_affected_items } = ((rawItems || {}).data || {}).data;
			if (total_affected_items === 1) {
				this.showToast(
          'success',
          '成功',
          '分发成功',
          3000
        );
        this.setState({ saveParams: { agents: '', file: '', command: ''}, selectAgents: [], selectFile: [], isDistribution: false });
        this.getItems();
			}
      else {
				this.showToast(
          'danger',
          '警告',
          '分发失败',
          3000
        );
        this.setState({ isDistribution: false });
			}
    } catch (error) {
      this.showToast(
				'danger',
				'警告',
				'分发失败:' + error,
				3000
			);
    }
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

  onAgentTableChange({ page = {} }) {
    const { index: agentPageIndex, size: agentPageSize } = page;
    this._isMount && this.setState({
      agentPageIndex,
      agentPageSize,
      selectedAgents: []
    }, this.getAgentItems);
  }

  agentModalRender() {
    const {
      agentListItems,
      agentTotalItems,
      agentPageIndex,
      agentPageSize,
      agentsTable,
      saveParams,
    } = this.state;
    const columns = [
      {
        field: 'id',
        name: 'ID',
        width: '50'
      },
      {
        field: 'ip',
        name: 'IP',
        width: '15%',
        truncateText: true,
      },
      {
        field: 'name',
        name: '主机名',
        width: '15%',
        truncateText: true
      },
      {
        field: 'tag',
        name: '标签',
        width: '10%',
        sortable: true
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
    ]
    const onSelectionChange = (selectedItems) => {
      this.setState({ selectedAgents: selectedItems });
    };
    let selectAgentId = saveParams.agents.split(',');
    let initSelectAgents = agentListItems.filter(k => selectAgentId.indexOf(k.id) !== -1);
    const selection = {
      selectable: () => true,
      onSelectionChange: onSelectionChange,
      initialSelected: initSelectAgents,
    };
    const pagination =
    agentTotalItems > 15
        ? {
          pageIndex: agentPageIndex,
          pageSize: agentPageSize,
          totalItemCount: agentTotalItems,
          pageSizeOptions: [15, 25, 50, 100]
        }
        : false;
    return (
      <EuiOverlayMask>
        <EuiModal onClose={() => this.setState({ selectedAgents: [], isModalVisible: false })}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h1>选择代理</h1>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiBasicTable
              ref={agentsTable}
              itemId="id"
              items={agentListItems}
              columns={columns}
              selection={selection}
              {...(pagination && { pagination })}
              onChange={this.onAgentTableChange}
              noItemsMessage="没有找到代理"
            />
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButtonEmpty onClick={() => this.setState({ selectedAgents: [], isModalVisible: false })}>取消</EuiButtonEmpty>
            <EuiButton onClick={() => this.selectAgents()} fill>确认</EuiButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }

  fileModalRender() {
    const {
      fileListItems,
      fileTable,
      saveParams,
    } = this.state;
    const columns = [
      {
        field: 'name',
        name: '名称',
      },
      {
        field: 'size',
        name: '大小',
        width: '80',
      },
      {
        field: 'ctime',
        name: '上传时间',
        width: '150',
      }
    ];
    const message = '没有找到补丁';
    const onSelectionChange = (selectedItems) => {
      const { selectedFile } = this.state;
      if (selectedItems.length > 1) {
        fileTable.current.setSelection(selectedFile);
        this.showToast(
          'danger',
          '警告',
          '只能选择一条补丁',
          3000
        );
      }
      else {
        this.setState({ selectedFile: selectedItems });
      }
    };
    let initSelectFile = fileListItems.filter(k => k.name === saveParams.file);
    const selection = {
      selectable: () => true,
      onSelectionChange: onSelectionChange,
      initialSelected: initSelectFile,
    };

    return (
      <EuiOverlayMask>
        <EuiModal onClose={() => this.setState({ selectedFile: [], isModalVisible: false })}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h1>选择补丁</h1>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiInMemoryTable
              itemId="name"
              style={{ margin: '8px 0' }}
              ref={fileTable}
              items={fileListItems}
              columns={columns}
              selection={selection}
              pagination={{ pageSizeOptions: [10, 15] }}
              sorting={true}
              message={message}
              search={{ box: { incremental: true, placeholder: '过滤' }}}
            />
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButtonEmpty onClick={() => this.setState({ selectedFile: [], isModalVisible: false })}>取消</EuiButtonEmpty>
            <EuiButton onClick={() => this.selectFile()} fill>确认</EuiButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    )
  }

  resultModalRender() {
    const {
      resultListItems
    } = this.state;
    const columns = [
      {
        field: 'agent',
        name: '分发代理',
        width: '80'
      },
      {
        field: 'fileresult',
        name: '补丁分发结果',
        render: fileresult => {
          let resultText = {
            'SUCCESS': '分发成功',
            'ERROR': '分发失败',
            'file not exist': '文件不存在',
            'send failed! agent may not active': '目标代理可能未连接',
            'err Maximum attempts exceeded': '尝试多次失败',
            'err Response timeout': '响应超时',
            'file with same name in progress': '同名文件正在上传',
            'exceed limit of upload file': '相同代理同时上传文件数量超过限制'
          }
          Object.keys(resultText).forEach(k => {
            fileresult = fileresult.replace(k, resultText[k])
          })
          return fileresult;
        }
      },
      {
        field: 'cmdresult',
        name: '命令执行结果',
      }
    ];
    const message = '没有分发结果';

    return (
      <EuiOverlayMask>
        <EuiModal onClose={() => this.setState({ resultListItems: [], isModalVisible: false })}>
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <h1>分发结果</h1>
            </EuiModalHeaderTitle>
          </EuiModalHeader>
          <EuiModalBody>
            <EuiInMemoryTable
              itemId="name"
              style={{ margin: '8px 0' }}
              items={resultListItems}
              columns={columns}
              pagination={{ pageSizeOptions: [10, 15] }}
              sorting={true}
              message={message}
              search={{ box: { incremental: true, placeholder: '过滤' }}}
            />
          </EuiModalBody>
          <EuiModalFooter>
            <EuiButton onClick={() => this.setState({ resultListItems: [], isModalVisible: false })} fill>确认</EuiButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    )
  }

  render() {
    const { isModalVisible } = this.state;
    const distribution = this.distributionRender();
    const table = this.tableRender();
    let modal;
    if (isModalVisible === 'agent') {
      modal = this.agentModalRender();
    }
    else if (isModalVisible === 'file') {
      modal = this.fileModalRender();
    }
    else if (isModalVisible === 'result') {
      modal = this.resultModalRender();
    }

    return (
      <EuiPage>
        <EuiPanel>
          {distribution}
          <EuiSpacer size="m" />
          <EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
          <EuiSpacer size="m" />
          {table}
        </EuiPanel>
        {modal}
      </EuiPage>
    )
  }

}