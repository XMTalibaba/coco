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
  EuiConfirmModal,
  EuiOverlayMask,
  EuiHealth,
  EuiModal,
  EuiProgress,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButtonEmpty,
  EuiInMemoryTable,
  EuiBadge,
  EuiText,
  EuiButton,
} from '@elastic/eui';
import { map } from 'lodash';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { filtersToObject } from '../../components/wz-search-bar';
import { formatUIDate } from '../../react-services/time-service';
import { GroupTruncate } from '../../components/common/util';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getToasts, getHttp } from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { UserEdit } from './userManage/user-edit';
import { AppState } from '../../react-services/app-state';

export const UserManage = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '系统管理' }, { text: '用户管理' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class UserManage extends Component {
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
      currentUsername: '',
      listType: 'list',
      selectItem: {},
      isDestroyModalVisible: false,
      roleOptions: {
        'adminuser': '用户管理员',
        'audit': '审计管理员',
        'system': '系统管理员',
        'wazuh': '操作用户'
      },
      initUser: ['system', 'audit', 'adminuser']
    };
	}
  async componentDidMount() {
    this._isMount = true;

    let res = await AppState.getCurrentUserInfo();
    let currentUsername = res.userName;
    this.setState({ currentUsername });

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

  transformUserData(rawData) {
    return map(rawData, (value, key) => ({
      username: key || '',
      attributes: value.attributes,
      backend_roles: value.backend_roles,
    }));
  }

  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });
      let res = await getHttp().get('/api/v1/configuration/internalusers');
      let listItems = this.transformUserData(res.data);
      let totalItems = listItems.length;
      this.setState({ listItems, totalItems, isLoading: false })
    } catch (error) {
      this.setState({ isLoading: false });
      console.log(error);
    }
  }

  onTableChange = ({ page = {}, sort = {} }) => {
    const { index: pageIndex, size: pageSize } = page;
    this._isMount && this.setState({
      pageIndex,
      pageSize
    });
  };

  columns() {
    const { currentUsername, roleOptions } = this.state;
    return [
      {
        field: '',
        name: '用户名',
        render: item => (
          <>
            <span>{item.username}</span>
            {item.username === currentUsername && (
              <>
                &nbsp;
                <EuiBadge>当前用户</EuiBadge>
              </>
            )}
          </>
        ),
        sortable: true,
      },
      {
        field: 'backend_roles',
        name: '角色',
        render: items => {
          if (items === undefined || items.length === 0) {
            return (
              <EuiFlexGroup direction="column" style={{ margin: '1px' }}>
                <EuiText key={'-'} className={'table-items'}>
                  <span>-</span>
                </EuiText>
              </EuiFlexGroup>
            );
          }
          return (
            <EuiFlexGroup direction="column" style={{ margin: '1px' }}>
              {items.slice(0, 3).map((item) => (
                <span key={item} className={'table-items'}>
                  {roleOptions[item]}
                </span>
              ))}
              {items.length > 3 && (
                <span key={'...'} className={'table-items'}>
                  ...
                </span>
              )}
            </EuiFlexGroup>
          )
        },
      },
      {
        align: 'right',
        width: '5%',
        name: '操作',
        render: item => this.actionButtonsRender(item)
      }
    ]
  }

  actionButtonsRender(item) {
    const { initUser } = this.state;
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content={"编辑用户"}
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toDetails(item);
            }}
            iconType="indexEdit"
            color={'primary'}
            aria-label="编辑用户"
          />
        </EuiToolTip>
        &nbsp;
        <EuiToolTip content={initUser.indexOf(item.username) !== -1 ? "内置用户无法删除" : "删除用户"} position="left">
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.toShowDestroyModal(item);
            }}
            disabled={initUser.indexOf(item.username) !== -1}
            color={'danger'}
            iconType="trash"
            aria-label="删除用户"
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

  async toDelete() {
    try {
      const { selectItem } = this.state;
      await getHttp().delete(`/api/v1/configuration/internalusers/${selectItem.username}`);
      await WzRequest.apiReq('POST', `/manager/sso`, {
     
          name:selectItem.username,
        
         
      });
      this.showToast(
        'success',
        '成功',
        '用户删除成功',
        3000
      );
      this.getItems();
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '用户删除失败: ' + error,
        3000
      );
    }
    this.setDestroyModal(false);
  }

  tableRender() {
    const {
      listItems,
      isLoading,
    } = this.state;
    const columns = this.columns();
    const message = isLoading ? false : '没有结果...';
    return (
      <EuiInMemoryTable
        itemId="id"
        items={listItems}
        loading={isLoading}
        columns={columns}
        pagination={{ pageSizeOptions: [10, 15] }}
        sorting={true}
        message={message}
        search={{ box: { incremental: true, placeholder: '过滤用户列表' } }}
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
                    <span>&nbsp;{WAZUH_MODULES['userManage'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['userManage'].description}
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
                  <h2>用户列表 ({this.state.totalItems})</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton
              size="s"
              onClick={() => this.setState({ listType: 'add' })}
            >
              新增用户
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
    const { listType, selectItem, isDestroyModalVisible, currentUsername } = this.state;
    const title = this.renderTitle();
    const table = this.tableRender();
    const head = this.headRender();
    let destroyModal;
    if (isDestroyModalVisible) {
      destroyModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认删除该用户吗？"
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
                  <UserEdit listType={listType} detailsItem={selectItem} currentUsername={currentUsername} toList={() => this.toList()} />
                )}
                </EuiPanel>
							</EuiPage>
						</div>
            {destroyModal}
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
  }

})