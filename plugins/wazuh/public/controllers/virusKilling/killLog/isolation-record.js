import React, { Component } from 'react';
import {
  EuiPage,
  EuiFlexGroup,
  EuiFlexItem,
  EuiTitle,
  EuiButtonIcon,
  EuiSpacer,
  EuiPanel,
  EuiBasicTable,
  EuiToolTip,
  EuiOverlayMask,
  EuiConfirmModal
} from '@elastic/eui';
import { AppState } from '../../../react-services/app-state';
import { getToasts }  from '../../../kibana-services';
import { WzButtonPermissions } from '../../../components/common/permissions/button';
import { WzRequest } from '../../../react-services/wz-request';
import { RulesetHandler, RulesetResources } from '../../management/components/management/ruleset/utils/ruleset-handler';
import { formatUIDate } from '../../../react-services/time-service';
 
export class IsolationRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDescPopoverOpen: false,
      currentUserInfo: {},
      departmentGroups: [],
      totalItems: 0,
      listItems: [],
      pageIndex: 0,
      pageSize: 10,
      isLoading: false,
      actionFile: {},
      isModalVisible: false,
      actionType: ''
    };
    
    this.rulesetHandler = new RulesetHandler(RulesetResources.LISTS);
  }
 
  async componentDidMount() {
    let currentUserInfo = await AppState.getCurrentUserInfo();
    this.setState({ currentUserInfo });
    if (currentUserInfo.department) {
      let departmentGroups = await AppState.getDepartmentGroups();
      this.setState({ departmentGroups })
    }
 
    await this.getItems();
  }
 
  async componentDidUpdate(prevProps, prevState) {
 
    if (['pageIndex', 'pageSize'].some(field => this.state[field] !== prevState[field])) {
      try {
        await this.getItems();
      } catch (err) {
        console.log(err);
      };
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
 
  async getItems() {
    const { isLoading, currentUserInfo, departmentGroups } = this.state;
    if (isLoading) return;
    if (currentUserInfo.department && departmentGroups.length === 0) return;
    this.setState({ isLoading: true });
    try {
      const rawItems = await WzRequest.apiReq('GET', `/manager/isolated-files?pretty=true${currentUserInfo.department ? `&groups_list=${departmentGroups.map(k => `${k.name}`).join(',')}` : ''}`, { params: this.buildFilter() });
      const { affected_items, total_affected_items } = ((rawItems || {}).data || {}).data;
 
      this.setState({
        listItems: affected_items,
        totalItems: total_affected_items,
        isLoading: false
      });
    } catch (error) {
      this.setState({ isLoading: false });
    }
  }
 
  buildFilter() {
    const { pageIndex, pageSize} = this.state;
 
    let filter = {
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize,
    };
 
    return filter;
  }
 
  headRender() {
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>隔离记录 ({this.state.totalItems})</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem>
                <WzButtonPermissions
                  buttonType='empty'
                  iconType="refresh"
                  onClick={() => this.getItems()}
                >
                  刷新
                </WzButtonPermissions>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
      </div>
    );
  }
 
  toShowDelModal(item) {
    this.setState({ actionFile: item, actionType: 'del' });
    this.setModalVisible(true);
  }
 
  toShowRestoreModal(item) {
    this.setState({ actionFile: item, actionType: 'restore' });
    this.setModalVisible(true);
  }
 
  setModalVisible(flag) {
    this.setState({isModalVisible: flag});
    if (!flag) this.setState({
      actionFile: {},
      actionType: ''
    });
  }
 
  toAction() {
    const { actionType } = this.state;
    if (actionType === 'del') {
      this.toDelFile();
    }
    else {
      this.toRestoreFile();
    }
  }
 
  async toDelFile() {
    try {
      const { actionFile } = this.state;
 
      let paramsLinux = {
        command: 'delete_isolated_file.sh',
        arguments: [actionFile.filename],
        custom: true
      }
      let paramsWindows = {
        command: 'delete_isolated_file.cmd',
        arguments: [actionFile.filename],
        custom: true
      }
      await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${actionFile.agent_id}`, paramsLinux);
      await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${actionFile.agent_id}`, paramsWindows);
 
      this.getItems();
      this.showToast(
        'success',
        '成功',
        '删除文件成功，隔离记录列表需要几秒钟延迟更新，请稍后刷新列表。',
        3000
      );
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '删除文件失败: ' + error,
        3000
      );
    }
    this.setModalVisible(false)
  }
 
  async toRestoreFile() {
    try {
      const { actionFile } = this.state;
 
      const result = await WzRequest.apiReq('GET', `/groups/${actionFile.agent_group}/files/virus_ignored/xml?pretty=true`, { });
      let res = result.data.length > 4 ? result.data.substring(1, result.data.length-1).split(', ') : [];
      res.length > 0 && res.forEach((k, i) => {
        res[i] = k.substring(1, k.length-1)
      })
      if (res.indexOf(actionFile.md5) === -1) {
        this.showToast(
          'danger',
          '警告',
          '不可恢复该文件: 请先到 病毒查杀-查杀策略-隔离策略 页面中，将隔离文件的MD5添加进病毒白名单列表中，防止后续该文件重复触发隔离。',
          3000
        );
      }
      else {
        let paramsLinux = {
          command: 'recover_isolated_file.sh',
          arguments: [actionFile.isolate_src_path],
          custom: true
        }
        let paramsWindows = {
          command: 'recover_isolated_file.cmd',
          arguments: [actionFile.isolate_src_path],
          custom: true
        }
        await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${actionFile.agent_id}`, paramsLinux);
        await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${actionFile.agent_id}`, paramsWindows);
    
        this.getItems();
        this.showToast(
          'success',
          '成功',
          '恢复文件成功，隔离记录列表需要几秒钟延迟更新，请稍后刷新列表。',
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '恢复文件失败: ' + error,
        3000
      );
    }
    this.setModalVisible(false)
  }
 
  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
 
    this.setState({
      pageIndex,
      pageSize
    });
  };
 
  actionButtonsRender(item) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content="恢复文件"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toShowRestoreModal(item);
            }}
            iconType="returnKey"
            color={'primary'}
            aria-label="恢复文件"
          />
        </EuiToolTip>
        &nbsp;
        <EuiToolTip
          content="删除文件"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toShowDelModal(item);
            }}
            iconType="trash"
            color={'danger'}
            aria-label="删除文件"
          />
        </EuiToolTip>
      </div>
    )
  }
 
  tableRender() {
    const {
      listItems,
      isLoading,
      pageIndex,
      pageSize,
      totalItems,
    } = this.state;
    const columns = [
      {
        field: 'agent_id',
        name: '代理',
        align: 'left'
      },
      {
        field: 'agent_name',
        name: '代理名称',
        align: 'left'
      },
      {
        field: 'agent_ip',
        name: '代理IP',
        align: 'left'
      },
      {
        field: 'filename',
        name: '文件名称',
        align: 'left'
      },
      {
        field: 'isolate_src_path',
        name: '隔离路径',
        align: 'left'
      },
      {
        field: 'md5',
        name: 'MD5',
        align: 'left'
      },
      {
        field: 'timestamp',
        name: '隔离时间',
        align: 'left',
        render: timestamp => formatUIDate(timestamp)
      },
      {
        name: '操作',
        width: '60',
        align: 'right',
        render: item => this.actionButtonsRender(item)
      }
    ]
    const pagination = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalItemCount: totalItems > 10000 ? 10000 : totalItems,
      pageSizeOptions: [10, 25, 50],
    };
    return (
      <EuiBasicTable
        items={listItems}
        columns={columns}
        loading={isLoading}
        pagination={pagination}
        onChange={this.onTableChange}
        noItemsMessage="没有找到文件列表"
      />
    )
  }
 
    render() {
    const { isModalVisible, actionType } = this.state;
    const head = this.headRender();
    const table = this.tableRender();
 
    let model;
    if (isModalVisible) {
      model = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title={actionType === 'del' ? '确认删除该文件吗？' : '确认恢复该文件吗？'}
            onCancel={() => this.setModalVisible(false)}
            onConfirm={() => this.toAction()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
            { actionType === 'restore' && (
              <p>在恢复文件前，请先到 病毒查杀-查杀策略-隔离策略 页面中，将隔离文件的MD5添加进病毒白名单列表中，防止后续该文件重复触发隔离。</p>
            )}
          </EuiConfirmModal>
        </EuiOverlayMask>
      )
    }
 
    return (
      <EuiPage>
        <EuiPanel paddingSize="m">
          {head}
          {table}
        </EuiPanel>
        {model}
      </EuiPage>
    );
  }
}