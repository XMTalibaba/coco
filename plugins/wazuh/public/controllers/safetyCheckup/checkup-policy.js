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
  EuiBadge,
  EuiText,
  EuiButton,
  EuiIcon,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getToasts, getHttp } from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { formatUIDate } from '../../react-services/time-service';
import { PolicyEdit } from './checkupPolicy/policy-edit';
import { RowDetails } from './checkupPolicy/row-details';
import { AppState } from '../../react-services/app-state';

export const CheckupPolicy = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '安全体检' }, { text: '安全体检策略' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class CheckupPolicy extends Component {
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
      itemIdToExpandedRowMap: {},
      isCheckModalVisible: false,
      checkTitle: '',
    };
	}
  async componentDidMount() {
    this._isMount = true;

    await this.getItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {}

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
      this._isMount && this.setState({ isLoading: true, itemIdToExpandedRowMap: {} });
      const rawItems = await WzRequest.apiReq('GET', `/manager/health_check_policy?pretty=true`, {});
      const { affected_items, total_affected_items } = ((rawItems || {}).data || {}).data || {}
      this.setState({ listItems: affected_items, totalItems: total_affected_items, isLoading: false })
    } catch (error) {
      this.setState({ isLoading: false });
      console.log(error);
    }
  }

  columns() {
    return [
      {
        width: "25px",
        isExpander: true,
        render: item => {
          return (
            <EuiIcon size="s" type={this.state.itemIdToExpandedRowMap[item.id] ? "arrowDown" : "arrowRight"} />
          )
        },
      },
      {
        field: 'id',
        name: 'ID',
        width: "100px",
      },
      {
        field: 'task_mode',
        name: '任务模式',
        render: task_mode => {
          const options = {
            'immediate': '及时体检',
            'period': '定时体检'
          }
          return (
            <span>{options[task_mode] ? options[task_mode] : '-'}</span>
          )
        },
      },
      {
        field: 'health_check_status',
        name: '任务状态',
        render: health_check_status => {
          const options = {
            'doing': '正在执行',
            'waiting': '等待执行',
            'done': '执行完成',
          }
          return (
            <span>{options[health_check_status] ? options[health_check_status] : '-'}</span>
          )
        },
      },
      {
        field: 'last_time',
        name: '上次检查时间',
        render: last_time => {
          return (
            <span>{last_time === 'empty' ? '未检查' : formatUIDate(last_time)}</span>
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
          content={item.health_check_status === 'doing' ? "正在执行中的任务不可编辑" : "编辑策略"}
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toDetails(item);
            }}
            isDisabled={item.health_check_status === 'doing'}
            iconType="indexEdit"
            color={'primary'}
            aria-label="编辑策略"
          />
        </EuiToolTip>
        &nbsp;
        {item.task_mode === 'immediate' && item.health_check_status !== 'doing' &&
          <span>
            <EuiToolTip
              content={"执行任务"}
              position="left"
            >
              <EuiButtonIcon
                onClick={ev => {
                  ev.stopPropagation();
                  this.toShowCheckModal(item, '执行');
                }}
                iconType="play"
                color={'primary'}
                aria-label="执行任务"
              />
            </EuiToolTip>
            &nbsp;
          </span>
        }
        {item.task_mode === 'period' && item.health_check_status !== 'doing' &&
          <span>
            <EuiToolTip
              content={`${item.health_check_enable === 'False' ? '开启' : '关闭'}任务`}
              position="left"
            >
              <EuiButtonIcon
                onClick={ev => {
                  ev.stopPropagation();
                  this.toShowCheckModal(item, item.health_check_enable === 'False' ? '开启' : '关闭');
                }}
                iconType={item.health_check_enable === 'False' ? 'play' : 'stop'}
                color={'primary'}
                aria-label={`${item.health_check_enable === 'False' ? '开启' : '关闭'}任务`}
              />
            </EuiToolTip>
            &nbsp;
          </span>
        }
        <EuiToolTip content={item.health_check_status === 'doing' ? "正在执行中的任务不可删除" : "删除策略"} position="left">
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toShowDestroyModal(item);
            }}
            isDisabled={item.health_check_status === 'doing'}
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

  toShowDestroyModal(item) {
    this.setState({ selectItem: item });
    this.setDestroyModal(true);
  }
  setDestroyModal(type) {
    this.setState({isDestroyModalVisible: type});
    if (!type) this.setState({ selectItem: {} });
  };

  toShowCheckModal(item, checkTitle) {
    this.setState({ selectItem: item, checkTitle });
    this.setCheckModal(true);
  }
  setCheckModal(type) {
    this.setState({isCheckModalVisible: type});
    if (!type) this.setState({ selectItem: {}, checkTitle: '' });
  };

  async toDelete() {
    try {
      const { selectItem } = this.state;
      const rawItems = await WzRequest.apiReq('DELETE', `/manager/health_check_policy?tasks_list=${selectItem.id}`, {});
      const items_message = ((rawItems || {}).data || {}).message;
      if (items_message.includes('success')) {
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

  async toCheck() {
    const { selectItem, checkTitle } = this.state;
    try {
      const toEnable = selectItem.task_mode === 'period' && selectItem.health_check_enable === 'True' ? false : true
      const rawItems = await WzRequest.apiReq('PUT', `/manager/health_check_policy/state?tasks_list=${selectItem.id}&health_check_enable=${toEnable}`, {});
      const items_message = ((rawItems || {}).data || {}).message;
      if (items_message.includes('success')) {
        this.showToast(
          'success',
          '成功',
          `任务${checkTitle}成功`,
          3000
        );
        this.getItems();
      }
      else {
        this.showToast(
          'danger',
          '警告',
          `任务${checkTitle}失败`,
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        `任务${checkTitle}失败: ` + error,
        3000
      );
    }
    this.setCheckModal(false);
  }

  toggleDetails = item => {
    const itemIdToExpandedRowMap = { ...this.state.itemIdToExpandedRowMap };
    if (itemIdToExpandedRowMap[item.id]) {
      delete itemIdToExpandedRowMap[item.id];
      this.setState({ itemIdToExpandedRowMap });
    } else {
      const newItemIdToExpandedRowMap = {};
      newItemIdToExpandedRowMap[item.id] = (
        (<div style={{ width: "100%" }}><RowDetails selectItem={item} /></div>)
      );
      this.setState({ itemIdToExpandedRowMap: newItemIdToExpandedRowMap });
    }
  };

  tableRender() {
    const {
      listItems,
      isLoading,
      itemIdToExpandedRowMap,
    } = this.state;
    const columns = this.columns();
    const message = isLoading ? false : '没有结果...';
    const getRowProps = item => {
      const { id } = item;
      return {
        'data-test-subj': `row-${id}`,
        className: 'customRowClass',
        onClick: () => this.toggleDetails(item),
      };
    };
    return (
      <EuiInMemoryTable
        itemId="id"
        items={listItems}
        loading={isLoading}
        columns={columns}
        rowProps={getRowProps}
        isExpandable={true}
        itemIdToExpandedRowMap={itemIdToExpandedRowMap}
        pagination={{ pageSizeOptions: [10, 15] }}
        sorting={true}
        message={message}
        search={{ box: { incremental: true, placeholder: '过滤策略列表' } }}
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
                    <span>&nbsp;{WAZUH_MODULES['checkupPolicy'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['checkupPolicy'].description}
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
    const { listType, selectItem, isDestroyModalVisible, isCheckModalVisible, checkTitle } = this.state;
    const title = this.renderTitle();
    const table = this.tableRender();
    const head = this.headRender();
    let destroyModal, checkModal;
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
    if (isCheckModalVisible) {
      checkModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title={`确认${checkTitle}该任务吗？`}
            onCancel={() => this.setCheckModal(false)}
            onConfirm={() => this.toCheck()}
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
                { listType !== 'list' && (
                  <PolicyEdit listType={listType} detailsItem={selectItem}  toList={() => this.toList()} />
                )}
                </EuiPanel>
							</EuiPage>
						</div>
            {destroyModal}
            {checkModal}
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
  }

})