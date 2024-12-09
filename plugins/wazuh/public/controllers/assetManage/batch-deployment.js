import React, { Component, Fragment } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
  EuiBasicTable,
  EuiToolTip,
  EuiPanel,
  EuiSpacer,
  EuiButton,
  EuiOverlayMask,
  EuiConfirmModal,
  EuiButtonEmpty,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiText,
  EuiSelect,
  EuiModalFooter,
  EuiComboBox,
} from '@elastic/eui';
import { withReduxProvider } from '../../components/common/hocs';
import { compose } from 'redux';
import { WzButtonPermissions } from '../../components/common/permissions/button';
import { Tasks } from './probe/tasks';
import { TaskLogs } from './probe/task-logs';
import { getToasts } from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { AppState } from '../../react-services/app-state';

export const BatchDeployment = compose(
	withReduxProvider
)(class BatchDeployment extends Component {
  _isMount = false;
  constructor(props) {
		super(props);
		this.state = {
      totalItems: 0,
      tasks: [],
      isLoading: false,
      detailsTasks: '',
      uninstallTask: '',
      isUninstallModalVisible: false,
      delTask: '',
      isDelModalVisible: false,
      isInstallModalVisible: false,
      runTask: {},
      version: '',
      versionOptions: [],
      groupsOptions: [],
      groupSelect: [],
    };
	}
  async componentDidMount() {
    this._isMount = true;
    let departmentGroups = await AppState.getDepartmentGroups();
    let groupsOptions = departmentGroups.map(k => ({ id: k.name, label: k.name }))
    this.setState({ groupsOptions })
    await this.getVersions();
    await this.getItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }

  toList() {
    this.setState({ detailsTasks: '' });
    this.props.changeBatchDeploymentType('list');
    this.getItems();
  };

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

  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });
      const rawRules = await WzRequest.apiReq('GET', '/manager/agentmanage?pretty=true', {});
      const tasksItems = (
        ((rawRules || {}).data || {}).data || {}
      ).affected_items
      this._isMount &&
        this.setState({
          tasks: tasksItems,
          totalItems: tasksItems.length,
          isLoading: false
        });
    } catch (error) {
      this.setState({ isLoading: false });
      console.log(error)
    }
  }

  columns() {
    return [
      {
        field: 'task',
        name: '任务名称'
      },
      {
        field: 'createtime',
        name: '创建时间'
      },
      {
        name: '运行状态',
        field: 'status',
        width: '15%',
        render: status => this.statusRender(status)
      },
      {
        align: 'right',
        name: '操作',
        render: item => this.actionButtonsRender(item)
      }
    ];
  }
  statusRender(status) {
    return (
      <div>
        { status === 'ready' && (
          <span>未运行</span>
        )}
        { status === 'doing' && (
          <span>运行中</span>
        )}
        { status === 'done' && (
          <span>运行完成</span>
        )}
      </div> 
    )
  }
  actionButtonsRender(item) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content="任务详情"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toDetails(item.task);
            }}
            iconType="eye"
            color={'primary'}
            aria-label="任务详情"
          />
        </EuiToolTip>
        &nbsp;
        { item.status === 'ready' && (
        <div>
          <EuiToolTip
            content="安装探针"
            position="left"
          >
            <EuiButtonIcon
              onClick={ev => {
                ev.stopPropagation();
                this.toShowInstallModal(item);
                // this.toRun(item.task);
              }}
              iconType="play"
              color={'primary'}
              aria-label="安装探针"
            />
          </EuiToolTip>
          &nbsp;
        </div>
        )}
        { item.status === 'done' && (
        <div>
          <EuiToolTip
            content="重新安装"
            position="left"
          >
            <EuiButtonIcon
              onClick={ev => {
                ev.stopPropagation();
                this.toShowInstallModal(item);
                // this.toRun(item.task);
              }}
              iconType="play"
              color={'primary'}
              aria-label="重新安装"
            />
          </EuiToolTip>
          &nbsp;
          <EuiToolTip
            content="卸载探针"
            position="left"
          >
            <EuiButtonIcon
              onClick={ev => {
                ev.stopPropagation();
                this.toShowUninstallModal(item.task);
              }}
              iconType="indexFlush"
              color={'primary'}
              aria-label="卸载探针"
            />
          </EuiToolTip>
          &nbsp;
          <EuiToolTip
            content="查看运行结果"
            position="left"
          >
            <EuiButtonIcon
              onClick={ev => {
                ev.stopPropagation();
                this.toResult(item.task);
              }}
              iconType="document"
              color={'primary'}
              aria-label="查看运行结果"
            />
          </EuiToolTip>
          &nbsp;
          
        </div>
        )}
        <EuiToolTip
          content="删除任务"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toShowDelModal(item.task);
            }}
            iconType="trash"
            color={'danger'}
            aria-label="删除任务"
          />
        </EuiToolTip>
        &nbsp;
      </div>
    );
  };
  toDetails(task) {
    this.setState({detailsTasks: task});
    this.props.changeBatchDeploymentType('details');
  };
  async toRun() {
    try {
      const { runTask, version, groupSelect } = this.state;
      if (!version) {
        this.showToast(
          'danger',
          '警告',
          '探针安装失败: 请选择安装版本',
          3000
        );
        return;
      }
      if (runTask.status !== 'done' && groupSelect.length === 0) {
        this.showToast(
          'danger',
          'Error',
          '探针安装失败: 请选择安装分组',
          3000
        );
        return;
      }
      await WzRequest.apiReq('PUT', `/manager/agentmanage?pretty=true&login_alias=${encodeURIComponent(runTask.task)}&login_operation=install&version=${version}&address=${document.location.hostname}${runTask.status !== 'done' ? `&groups_list=${groupSelect.map(k => k.id).join(',')}` : ''}`, {});
      this.showToast(
        'success',
        '成功',
        '探针开始安装，请稍后刷新列表查看任务状态',
        3000
      );
      this.getItems();
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '探针安装失败: ' + error,
        3000
      );
    }
    this.setInstallModal(false);
  };

  toShowUninstallModal(task) {
    this.setState({ uninstallTask: task });
    this.setUninstallModal(true);
  }

  setUninstallModal(flag) {
    this.setState({isUninstallModalVisible: flag});
    if (!flag) this.setState({ uninstallTask: '' });
  }

  async toUninstall() {
    try {
      const { uninstallTask } = this.state;
      await WzRequest.apiReq('PUT', `/manager/agentmanage?pretty=true&login_alias=${encodeURIComponent(uninstallTask)}&login_operation=uninstall`, {});
      this.showToast(
        'success',
        '成功',
        '探针开始卸载，请稍后刷新列表查看任务状态',
        3000
      );
      this.getItems();
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '探针卸载失败: ' + error,
        3000
      );
    }
    this.setUninstallModal(false)
  }

  toShowDelModal(task) {
    this.setState({ delTask: task });
    this.setDelModal(true);
  }

  setDelModal(flag) {
    this.setState({isDelModalVisible: flag});
    if (!flag) this.setState({ delTask: '' });
  }

  toShowInstallModal(task) {
    this.setState({ runTask: task });
    this.setInstallModal(true);
  }

  setInstallModal(flag) {
    this.setState({isInstallModalVisible: flag});
    if (!flag) this.setState({ version: '', runTask: {}, groupSelect: [] });
  }

  async toDel() {
    try {
      const { delTask } = this.state;
      await WzRequest.apiReq('PUT', `/manager/agentmanage?pretty=true&login_alias=${encodeURIComponent(delTask)}&login_operation=del`, {});
      this.showToast(
        'success',
        '成功',
        '任务删除成功',
        3000
      );
      this.getItems();
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '任务删除失败: ' + error,
        3000
      );
    }
    this.setDelModal(false)
  }

  async toResult(task) {
    this.setState({detailsTasks: task});
    this.props.changeBatchDeploymentType('logs');
  };
  
  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };
  tableRender() {
    const getRowProps = item => {
      const { id } = item;
      return {
        'data-test-subj': `row-${id}`,
        className: 'customRowClass',
        onClick: () => { }
      };
    };

    const {
      tasks,
      isLoading
    } = this.state;
    const columns = this.columns();

    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiBasicTable
            items={tasks}
            itemId="id"
            columns={columns}
            loading={isLoading}
            rowProps={getRowProps}
            noItemsMessage="没有找到任务"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
  headRender() {
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>批量部署任务列表 ({this.state.totalItems})</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem>
                <EuiButton
                  size="s"
                  onClick={() => this.props.changeBatchDeploymentType('add')}
                >
                  部署任务
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiButton
                  size="s"
                  onClick={() => this.getItems()}
                >
                  刷新
                </EuiButton>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiButtonEmpty
                  size="s"
                  onClick={() => this.props.batchDeploymentChange(false)}
                  iconType="cross"
                >
                  关闭
                </EuiButtonEmpty>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
      </div>
    );
  }

  setUpdateVersion(e) {
		let version = e.target.value;
		this.setState({ version });
	}

  setGroupName(groupSelect) {
    this.setState({ groupSelect });
  }

	render() {
    const table = this.tableRender();
    const head = this.headRender();
    const { batchDeploymentType } = this.props;
    const { detailsTasks, isUninstallModalVisible, isDelModalVisible, isInstallModalVisible, version, versionOptions, runTask, groupsOptions, groupSelect } = this.state;
    let uninstallModal, delModal, installModal;
    if (isUninstallModalVisible) {
      uninstallModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认卸载该探针吗？"
            onCancel={() => this.setUninstallModal(false)}
            onConfirm={() => this.toUninstall()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          />
        </EuiOverlayMask>
      );
    }
    if (isDelModalVisible) {
      delModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认删除该任务吗？"
            onCancel={() => this.setDelModal(false)}
            onConfirm={() => this.toDel()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          />
        </EuiOverlayMask>
      );
    }
    if (isInstallModalVisible) {
      installModal = (
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setInstallModal(false)} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>选择安装信息</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <div style={{ padding: '4px 0'}}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false} style={{ width: 80 }}>
                    <EuiText textAlign="right">版本:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ width: 200 }}>
                    <EuiSelect
                      options={versionOptions}
                      value={version}
                      onChange={(e) => this.setUpdateVersion(e)}
                    />
                  </EuiFlexItem>
                </EuiFlexGroup>
                {runTask.status !== 'done' && (
                  <EuiFlexGroup alignItems="center">
                    <EuiFlexItem grow={false} style={{ width: 80 }}>
                      <EuiText textAlign="right">{'安装分组'}:</EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false} style={{ width: 200 }}>
                      <EuiComboBox
                        placeholder="选择安装分组"
                        options={groupsOptions}
                        selectedOptions={groupSelect}
                        onChange={group => {
                          this.setGroupName(group);
                        }}
                        noSuggestions={groupsOptions.length === groupSelect.length}
                        isDisabled={!groupsOptions.length}
                        isClearable={true}
                        data-test-subj="demoComboBox"
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                )}
              </div>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={() => this.setInstallModal(false)}>取消</EuiButtonEmpty>
              <EuiButton onClick={() => this.toRun()} fill>保存</EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }

		return (
			<div>
				<EuiPage>
          <EuiPanel paddingSize="m">
          { batchDeploymentType === 'list' && (
            <div>
              {head}
              {table}
            </div>
          )}
          { (batchDeploymentType === 'details' || batchDeploymentType === 'add') && <Tasks {...this.props} detailsTasks={detailsTasks} toList={() => this.toList()} /> }
          { batchDeploymentType === 'logs' && <TaskLogs {...this.props} detailsTasks={detailsTasks} toList={() => this.toList()} /> }
          </EuiPanel>
          {uninstallModal}
          {delModal}
          {installModal}
        </EuiPage>
			</div>
		);
	}
});