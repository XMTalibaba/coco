import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiBasicTable,
  EuiFieldSearch,
  EuiButton,
  EuiToolTip,
  EuiButtonIcon,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiText,
  EuiModalFooter,
  EuiSelect,
} from '@elastic/eui';
import { WzRequest } from '../../../../react-services/wz-request';
import { formatUIDate } from '../../../../react-services/time-service';
import { AppState } from '../../../../react-services/app-state';

export class WeakPassword extends Component {
  constructor(props) {
		super(props);
		this.state = {
      pageIndex: 0,
      pageSize: 15,
      sortField: '',
      sortDirection: 'asc',
      list: [],
      total: 0,
      isLoading: false,
      showPassword: '',
      isPasswordModalVisible: false,
      passwordObj: 'system',
      passwordType: 'all'
    };
    this.textSearchTimer = null;
	}

  async componentDidMount() {
    this._isMount = true;
    if (this.props.selectView === 'weakPassword') this.getItems();
  }
  async componentDidUpdate(prevProps, prevState) {
    if ((this.props.selectAgent.id && this.props.selectView === 'weakPassword')
      && (prevState.pageIndex !== this.state.pageIndex
      || prevState.pageSize !== this.state.pageSize
      || prevState.sortField !== this.state.sortField
      || prevState.sortDirection !== this.state.sortDirection
      || prevState.passwordObj !== this.state.passwordObj
      || prevState.passwordType !== this.state.passwordType)) {
      await this.getItems();
    }
  }

  async getItems() {
    try {
      this.setState({ isLoading: true });
      const { selectAgent } = this.props;
      const { passwordObj, passwordType } = this.state;
      let urlType = passwordObj === 'system' ? passwordType : passwordObj
      const urlOptions = {
        'all': `/syscollector/${selectAgent.id}/accounts?pretty=true&weak_password=yes`,
        'empty': `/syscollector/${selectAgent.id}/account_empty_password?pretty=true`,
        'userName': `/syscollector/${selectAgent.id}/account_username_password?pretty=true`,
        'app': `/syscollector/${selectAgent.id}/app_accounts?pretty=true`
      }
      const rawItems = await WzRequest.apiReq(
        'GET',
        urlOptions[urlType],
        { params: this.buildFilter() }
      );

      const { affected_items, total_affected_items } = ((rawItems || {}).data || {}).data || {};

      this.setState({
        list: affected_items,
        total: total_affected_items,
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
      ...this.buildSortFilter()
    };

    return filter;
  }

  buildSortFilter() {
    const { sortField, sortDirection } = this.state;

    const field = sortField;
    const direction = sortDirection === 'asc' ? '+' : '-';

    return !!field ? { sort: `${direction}${field}` } : {};
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    const { field: sortField, direction: sortDirection } = sort;
    this.setState({
      pageIndex,
      pageSize,
      sortField,
      sortDirection,
    });
  };

  actionButtonsRender(item) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content="查看明文口令"
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              this.toShowPasswordModal(item);
              ev.stopPropagation()
            }}
            iconType="eye"
            color={'primary'}
            aria-label="查看明文口令"
          />
        </EuiToolTip>
      </div>
    );
  }

  toShowPasswordModal(item) {
    this.setState({ showPassword: item.password });
    this.setPasswordModal(true);
  }

  setPasswordModal(flag) {
    this.setState({isPasswordModalVisible: flag});
    if (!flag) this.setState({ showPassword: '' });
  }

  onSelectedChanged(e) {
    this.setState({ passwordType: e.target.value });
  }

  tableRender() {
    const {
      list,
      total,
      pageIndex,
      sortField,
      sortDirection,
      pageSize,
      isLoading,
      passwordObj,
      passwordType,
    } = this.state;
    const columns = [
      {
        field: 'user_name',
        name: '用户名',
        sortable: true
      },
      {
        field: 'group_id',
        name: '用户组ID',
        sortable: true
      },
      {
        field: 'last_login_ip',
        name: '最近登录IP',
        sortable: true
      },
      {
        field: 'last_login_time',
        name: '最近登录时间',
        sortable: true
      },
      {
        field: 'scan_time',
        name: '扫描日期',
        sortable: true,
        render: field => formatUIDate(field)
      },
      {
        align: 'right',
        width: '180',
        name: '操作',
        render: item => this.actionButtonsRender(item)
      }
    ];

    const columnsApp = [
      {
        field: 'user_name',
        name: '用户名',
        sortable: true
      },
      {
        field: 'app_name',
        name: '应用名',
        sortable: true
      },
      {
        field: 'scan_time',
        name: '扫描日期',
        sortable: true,
        render: field => formatUIDate(field)
      },
      {
        align: 'right',
        width: '180',
        name: '操作',
        render: item => this.actionButtonsRender(item)
      }
    ]

    const pagination = {
      pageIndex: pageIndex,
      pageSize: pageSize,
      totalItemCount: total,
      pageSizeOptions: [15, 25, 50, 100]
    };
    const sorting = {
      sort: {
        field: sortField,
        direction: sortDirection
      }
    };

    const passwordTypeOptions = [
			{ value: 'all', text: '全部类型' },
			{ value: 'empty', text: '空口令' },
			{ value: 'userName', text: '账户名称口令' }
		]

    const passwordObjOptions = [
			{ value: 'system', text: '系统弱口令' },
			{ value: 'app', text: '应用弱口令' },
		]

    return (
      <div>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiText textAlign="right">{'弱口令对象'}:</EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ width: 150 }}>
                <EuiSelect
                  options={passwordObjOptions}
                  value={passwordObj}
                  onChange={(e) => this.setState({ passwordObj: e.target.value }) }
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          { passwordObj === 'system' && (
          <EuiFlexItem grow={false}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiText textAlign="right">{'弱口令类型'}:</EuiText>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ width: 150 }}>
                <EuiSelect
                  options={passwordTypeOptions}
                  value={passwordType}
                  onChange={(e) => this.onSelectedChanged(e)}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          )}
        </EuiFlexGroup>
        
        <EuiSpacer size="m" />
        <EuiBasicTable
          items={list}
          columns={passwordObj === 'system' ? columns : columnsApp}
          pagination={pagination}
          loading={isLoading}
          sorting={sorting}
          onChange={this.onTableChange}
          noItemsMessage="未找到数据"
        />
      </div>
    )
  }
  
  async downloadCsv () {
    const { selectAgent } = this.props;
    const { passwordObj, passwordType } = this.state;
    let urlType = passwordObj === 'system' ? passwordType : passwordObj
    const urlOptions = {
      'all': `/syscollector/${selectAgent.id}/accounts?pretty=true&weak_password=yes`,
      'empty': `/syscollector/${selectAgent.id}/account_empty_password?pretty=true`,
      'userName': `/syscollector/${selectAgent.id}/account_username_password?pretty=true`,
      'app': `/syscollector/${selectAgent.id}/app_accounts?pretty=true`
    }
    let csvKey = ['home_dir', 'last_login_time', 'user_info', 'user_id', 'user_name', 'last_login_ip', 'scan_time', 'group_id', 'agent_id', 'agent_ip', 'agent_name'];
    if (urlType === 'app') {
      csvKey = ['user_name', 'app_name', 'scan_time', 'agent_id', 'agent_ip', 'agent_name'];
    }
    await AppState.downloadCsv(
      urlOptions[urlType],
      `${selectAgent.name}-弱口令.csv`,
      [],
      csvKey
    )
  }

  render() {
    const { total, isPasswordModalVisible, showPassword } = this.state;
    const table = this.tableRender();
    let passwordModal;
    if (isPasswordModalVisible) {
      passwordModal = (
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setPasswordModal(false)} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>明文口令</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <div style={{ padding: '4px 0'}}>
                <EuiFlexGroup alignItems="center">
                  <EuiFlexItem grow={false} style={{ width: 100, flexShrink: '0' }}>
                    <EuiText textAlign="right">口令:</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false} style={{ paddingRight: '20px' }}>
                    <EuiText>{showPassword}</EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButton onClick={() => this.setPasswordModal(false)} fill>确认</EuiButton>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }

		return (
			<div>
				<EuiSpacer size="m"></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiTitle size={'xs'} style={{ padding: '6px 0px' }}>
              <h4>{`弱口令`}</h4>
            </EuiTitle>
          </EuiFlexItem>
          { total > 0 && 
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.downloadCsv()}
            >
              导出CSV
            </EuiButton>
          </EuiFlexItem>
          }
        </EuiFlexGroup>
				<EuiSpacer size="s"></EuiSpacer>
        {table}
        {passwordModal}
			</div>
		);
	}

}