import React, { Component } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiButtonIcon,
  EuiToolTip,
  EuiPanel,
  EuiBasicTable,
  EuiSpacer,
  EuiOverlayMask,
  EuiConfirmModal,
} from '@elastic/eui';
import { WzRequest } from '../../../react-services/wz-request';
import { AppState } from '../../../react-services/app-state';
import { getToasts }  from '../../../kibana-services';
import { LogDetail }  from './log-detail';
import { WzButtonPermissions } from '../../../components/common/permissions/button';

export class KillLIst extends Component {
  constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      pageIndex: 0,
      pageSize: 15,
      totalItems: 0,
      listItems: [],
      isLoading: false,
      currentUserInfo: {},
      departmentGroups: [],
      listType: 'list',
      selectItem: {},
      isModalVisible: false,
    };
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
  }
  async componentDidUpdate(prevProps, prevState) {
    if (prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize) {
      await this.getItems();
    }
  }
  componentWillUnmount() {
    this._isMount = false;
  }

  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });
      const { currentUserInfo, departmentGroups } = this.state;
      if (currentUserInfo.department && departmentGroups.length === 0) {
        this.setState({ isLoading: false });
        return
      }

      let url = `/malware/summary?pretty=true`
      if (currentUserInfo.department) url += `&groups_list=${departmentGroups.map(k => `${k.name}`).join(',')}`
      const rawItems = await WzRequest.apiReq( 'GET', url, { params: this.buildFilter() } );

      const { affected_items, total_affected_items } = ((rawItems || {}).data || {}).data || {};

      this._isMount &&
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
    const { pageIndex, pageSize } = this.state;

    const filter = {
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
                  <h2>查杀列表 ({this.state.totalItems})</h2>
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

  actionButtonsRender(item) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content="查杀详情"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation()
              this.toDetail(item);
            }}
            iconType="eye"
            color={'primary'}
            aria-label="查杀详情"
          />
        </EuiToolTip>
        &nbsp;
        <EuiToolTip
          content="删除记录"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toShowDelModal(item);
            }}
            iconType="trash"
            color={'danger'}
            aria-label="删除记录"
          />
        </EuiToolTip>
      </div>
    )
  }
  columns() {
    return [
      {
        field: 'agent_id',
        name: '主机ID',
        width: '80'
      },
      {
        field: 'agent_name',
        name: '主机名'
      },
      {
        field: 'agent_ip',
        name: '主机IP'
      },
      {
        field: 'scanned_directories',
        name: '扫描目录',
      },
      {
        field: 'scanned_files',
        name: '扫描文件',
        width: '80'
      },
      {
        field: 'infected_files',
        name: '感染文件 ',
        width: '80'
      },
      {
        field: 'start_scan',
        name: '扫描开始',
        width: '150'
      },
      {
        field: 'end_scan',
        name: '扫描结束',
        width: '150'
      },
      {
        field: 'costtime',
        name: '扫描用时',
      },
      {
        align: 'right',
        width: '80',
        name: '操作',
        render: agent => this.actionButtonsRender(agent)
      }
    ];
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
      <EuiBasicTable
        items={listItems}
        itemId="scan_id"
        loading={isLoading}
        columns={columns}
        onChange={this.onTableChange}
        noItemsMessage="暂无数据"
        {...(pagination && { pagination })}
      />
    )
  }

  toDetail(item) {
    this.setState({ selectItem: item, listType: 'detail' });
  };

  toList() {
    this.setState({ listType: 'list', selectItem: {} });
    this.getItems();
  };

  toShowDelModal(item) {
    this.setState({ selectItem: item });
    this.setModalVisible(true);
  }

  setModalVisible(flag) {
    this.setState({isModalVisible: flag});
    if (!flag) this.setState({  selectItem: {} });
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  async toDelRecord() {
    try {
      const { selectItem } = this.state;
 
      await WzRequest.apiReq('DELETE', `/malware/summary?pretty=true&scan_id=${selectItem.scan_id}`, {});
 
      this.getItems();
      this.showToast(
        'success',
        '成功',
        '删除记录成功',
        3000
      );
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '删除记录失败: ' + error,
        3000
      );
    }
    this.setModalVisible(false)
  }

  render() {
    const { listType, selectItem, isModalVisible } = this.state;
    const table = this.tableRender();
    const head = this.headRender();

    let model;
    if (isModalVisible) {
      model = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title={'确认删除该记录吗？'}
            onCancel={() => this.setModalVisible(false)}
            onConfirm={() => this.toDelRecord()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          ></EuiConfirmModal>
        </EuiOverlayMask>
      )
    }

    return (
      <EuiPage>
        <EuiPanel paddingSize="m">
          { listType === 'list' && (
            <div>
              {head}
              {table}
            </div>
          )}
          { listType === 'detail' && (
            <LogDetail detailsItem={selectItem} toList={() => this.toList()} />
          )}
        </EuiPanel>
        {model}
      </EuiPage>
    )
  }
}