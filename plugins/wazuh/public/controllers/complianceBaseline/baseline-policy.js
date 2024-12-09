import React, { Component, Fragment } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
  EuiToolTip,
  EuiPanel,
  EuiSpacer,
  EuiConfirmModal,
  EuiOverlayMask,
  EuiInMemoryTable,
  EuiBasicTable,
  EuiButton,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getToasts, getHttp } from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { formatUIDate } from '../../react-services/time-service';
import { PolicyEdit } from './baselinePolicy/policy-edit';
import { PolicyResult } from './baselinePolicy/policy-result';
import { AppState } from '../../react-services/app-state';

export const BaselinePolicy = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '合规基线' }, { text: '检查策略' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class BaselinePolicy extends Component {
  _isMount = false;
  constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      isLoading: false,
      listType: 'list',
      selectItem: {},
      isDestroyModalVisible: false,
      isExecuteModalVisible: false,
    };
	}
  async componentDidMount() {
    this._isMount = true;

    await this.getItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize) {
      await this.getItems();
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
    try {
      this._isMount && this.setState({ isLoading: true });
      const rawItems = await WzRequest.apiReq('GET', `/sca_check_policies?pretty=true`, { params: this.buildFilter() });
      const { affected_items, total_affected_items } = ((rawItems || {}).data || {}).data || {}
      this.setState({ listItems: affected_items, totalItems: total_affected_items, isLoading: false })
    } catch (error) {
      this.setState({ isLoading: false });
      console.log(error);
    }
  }
  buildFilter() {
    const { pageIndex, pageSize } = this.state;

    const filter = {
      offset: (pageIndex * pageSize) || 0,
      limit: pageSize,
    };

    return filter;
  }

  columns() {
    return [
      {
        field: 'id',
        name: 'ID',
        width: "100px",
      },
      {
        field: 'name',
        name: '名称',
      },
      {
        field: 'agents',
        name: '主机ID',
      },
      {
        field: 'sca_policies',
        name: '基线',
      },
      {
        field: 'description',
        name: '描述',
      },
      {
        field: 'last_m_user',
        name: '上次编辑人',
      },
      {
        field: 'last_m_time',
        name: '上次编辑时间',
        render: last_m_time => {
          return (
            <span>{last_m_time ? formatUIDate(last_m_time) : '-'}</span>
          )
        },
      },
      {
        align: 'right',
        width: '100',
        name: '操作',
        render: item => this.actionButtonsRender(item)
      }
    ]
  }

  actionButtonsRender(item) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content={"编辑策略"}
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toDetails(item);
            }}
            iconType="indexEdit"
            color={'primary'}
            aria-label="编辑策略"
          />
        </EuiToolTip>
        &nbsp;
        <EuiToolTip
          content="立即执行"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toShowExecuteModal(item);
            }}
            iconType="play"
            color={'primary'}
            aria-label="立即执行"
          />
        </EuiToolTip>
        &nbsp;
        <EuiToolTip
          content="查看检查结果"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toResult(item);
            }}
            iconType="document"
            color={'primary'}
            aria-label="查看检查结果"
          />
        </EuiToolTip>
        &nbsp;
        <EuiToolTip content={"删除策略"} position="left">
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toShowDestroyModal(item);
            }}
            color={'danger'}
            iconType="trash"
            aria-label="删除策略"
          />
        </EuiToolTip>
      </div>
    );
  };

  toDetails(item) {
    this.setState({ selectItem: item, listType: 'details' });
  };

  toResult(item) {
    this.setState({ selectItem: item, listType: 'result' });
  };

  toShowDestroyModal(item) {
    this.setState({ selectItem: item });
    this.setDestroyModal(true);
  }
  setDestroyModal(type) {
    this.setState({isDestroyModalVisible: type});
    if (!type) this.setState({ selectItem: {} });
  };

  toShowExecuteModal(item) {
    this.setState({ selectItem: item });
    this.setExecuteModal(true);
  }
  setExecuteModal(type) {
    this.setState({isExecuteModalVisible: type});
    if (!type) this.setState({ selectItem: {} });
  };

  async toDelete() {
    try {
      const { selectItem } = this.state;
      const rawItems = await WzRequest.apiReq('DELETE', `/sca_check_policies?pretty=true&sca_checks_list=${selectItem.id}`, {});
      const items_message = ((rawItems || {}).data || {}).message;
      if (items_message.includes('deleted')) {
        this.showToast(
          'success',
          '成功',
          '策略删除成功',
          3000
        );
        this.getItems();
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '策略删除失败',
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '策略删除失败: ' + error,
        3000
      );
    }
    this.setDestroyModal(false);
  }

  async toExecute() {
    try {
      const { selectItem } = this.state;
      await WzRequest.apiReq('PUT', `/sca_run${selectItem.agents === 'all' ? '' : `?agents_list=${selectItem.agents.split('|').join(',')}`}`, {});
      this.showToast(
        'success',
        '成功',
        '策略立即执行成功，执行需要一定时间，请稍后查看检查结果',
        3000
      );
      this.getItems();
    } catch (error) {
      if (error.includes('1601')) {
        this.showToast(
          'danger',
          '警告',
          '策略立即执行失败: 检查范围存在代理离线，请检查代理状态或调整策略检查范围',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '策略立即执行失败: ' + error,
          3000
        );
      }
    }
    this.setExecuteModal(false);
  }
  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    this._isMount && this.setState({
      pageIndex,
      pageSize
    });
  };

  tableRender() {
    const {
      listItems,
      isLoading,
      totalItems,
      pageIndex,
      pageSize,
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
    return (
      // <EuiInMemoryTable
      //   itemId="id"
      //   items={listItems}
      //   loading={isLoading}
      //   columns={columns}
      //   {...(pagination && { pagination })}
      //   onTableChange={(change) => this.onTableChange(change)}
      //   sorting={true}
      //   message={message}
      //   search={{ box: { incremental: true, placeholder: '过滤策略列表' } }}
      // />
      <EuiBasicTable
        items={listItems}
        itemId="id"
        loading={isLoading}
        columns={columns}
        onChange={this.onTableChange}
        noItemsMessage="暂无数据"
        {...(pagination && { pagination })}
      />
    )
  }

  renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'}>
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['baselinePolicy'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['baselinePolicy'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
						</EuiFlexItem>
          </EuiFlexGroup>
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
                  <h2>策略列表 ({this.state.totalItems})</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.setState({ listType: 'add' })}
            >
              新增策略
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

  toList() {
    this.setState({ listType: 'list', selectItem: {} });
    this.getItems();
  };

  render() {
    const { listType, selectItem, isDestroyModalVisible, isExecuteModalVisible } = this.state;
    const title = this.renderTitle();
    const table = this.tableRender();
    const head = this.headRender();
    let destroyModal, executeModal;
    if (isDestroyModalVisible) {
      destroyModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认删除该策略吗？"
            onCancel={() => this.setDestroyModal(false)}
            onConfirm={() => this.toDelete()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
          </EuiConfirmModal>
        </EuiOverlayMask>
      );
    }
    if (isExecuteModalVisible) {
      executeModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认立即执行该策略吗？"
            onCancel={() => this.setExecuteModal(false)}
            onConfirm={() => this.toExecute()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
          </EuiConfirmModal>
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
                <EuiPanel paddingSize="m">
                { listType === 'list' && (
                  <div>
                    {head}
                    {table}
                  </div>
                )}
                { (listType === 'add' || listType === 'details') && (
                  <PolicyEdit listType={listType} detailsItem={selectItem}  toList={() => this.toList()} />
                )}
                { listType === 'result' && (
                  <PolicyResult detailsItem={selectItem}  toList={() => this.toList()} />
                )}
                </EuiPanel>
							</EuiPage>
						</div>
            {destroyModal}
            {executeModal}
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
  }

})