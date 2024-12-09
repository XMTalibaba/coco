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
  EuiTextColor,
  EuiText,
  EuiCopy,
  EuiFieldText,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getToasts } from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { restartClusterOrManager } from '../management/components/management/configuration/utils/wz-fetch'
import { updateWazuhNotReadyYet } from '../../redux/actions/appStateActions';
import { AppState } from '../../react-services/app-state';
import store from '../../redux/store';

export const LicenseManage = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '系统管理' }, { text: '授权管理' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class LicenseManage extends Component {
  _isMount = false;
  constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      totalItems: 0,
      items: [],
      isLoading: false,
      activeCode: '',
      authCode: '',
      ssoCode:'isLogin=true',
      isCluster: false,
    };
	}
  async componentDidMount() {
    this._isMount = true;
    let res = await AppState.getCurrentUserInfo();
    let ssoCode = `isLogin=${res.userName}`;
    const clusterStatus = await WzRequest.apiReq('GET', `/cluster/status`, {});
    const clusterData = ((clusterStatus || {}).data || {}).data || {};
    const isCluster = clusterData.enabled === 'yes' && clusterData.running === 'yes';
    this.setState({ isCluster,ssoCode })

    await this.getActiveCode();
    await this.getItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }

  async getActiveCode() {
    try {
      const response = await WzRequest.apiReq('GET','/security/activecode?pretty=true', { });
      const { message } = (response || {}).data || {};

      this._isMount &&
        this.setState({
          activeCode: message
        });
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '激活码查询失败: ' + error,
        3000
      );
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
      const response = await WzRequest.apiReq('GET','/security/authcode?pretty=true', { });
      const { affected_items, total_affected_items } = ((response || {}).data || {}).data;

      this._isMount &&
        this.setState({
          items: affected_items,
          totalItems: total_affected_items,
          isLoading: false
        });
    } catch (error) {
      this.setState({ isLoading: false });
      this.showToast(
        'danger',
        '警告',
        '授权列表查询失败: ' + error,
        3000
      );
    }
  }

  async putAuthCode() {
    try {
      const { activeCode, authCode, isCluster } = this.state;
      if (!authCode) {
        this.showToast(
          'danger',
          '警告',
          '请输入授权密钥',
          3000
        );
        return;
      }
      await WzRequest.apiReq('POST', `/${isCluster ? 'cluster' : 'security'}/authcode?active_code=${activeCode}&auth_code=${authCode}`, { });

      this.showToast(
        'success',
        '成功',
        '授权密钥导入成功，将自动重启管理器，请稍等',
        3000
      );
      this.setState({ authCode: '' })
      await restartClusterOrManager(wazuhNotReadyYet => store.dispatch(updateWazuhNotReadyYet(wazuhNotReadyYet)));
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '授权密钥导入失败: ' + error,
        3000
      );
    }
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
                    <span>&nbsp;{WAZUH_MODULES['licenseManage'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['licenseManage'].description}
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
  columns() {
    return [
      // {
      //   field: 'authnum',
      //   name: '数量',
      //   width: '15%'
      // },
      {
        field: 'authtime',
        name: '到期时间',
        width: '15%',
        render: authtime => authtime.replace(/T/g, ' ')
      },
      // {
      //   field: 'deploynum',
      //   name: '部署数量',
      //   width: '15%'
      // },
    ];
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

    const {
      items,
      isLoading
    } = this.state;
    const columns = this.columns();

    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiBasicTable
            items={items}
            itemId="id"
            columns={columns}
            loading={isLoading}
            rowProps={getRowProps}
            noItemsMessage="没有找到授权"
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
                  <h2>授权列表 ({this.state.totalItems})</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
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

	render() {
    const title = this.renderTitle();
    const table = this.tableRender();
    const head = this.headRender();
    const { activeCode, ssoCode,authCode } = this.state;
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
                <EuiFlexGroup direction="column">
                  <EuiFlexItem grow={false}>
                    <EuiPanel paddingSize="m">
                    {/* <EuiFlexGroup alignItems="center">
                        <EuiFlexItem grow={false}>
                          <EuiTitle size="s">
                            <h3>SSO授权</h3>
                          </EuiTitle>
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiTextColor color="subdued">配置SSO密钥进行系统登录</EuiTextColor>
                          <EuiFieldText
                            value={ssoCode}
                            readOnly
                            onChange={(e) => this.setState({ ssoCode: e.target.value })}
                          />
                        </EuiFlexItem>
                      </EuiFlexGroup> */}
                      <EuiFlexGroup alignItems="center">
                        <EuiFlexItem grow={false}>
                          <EuiTitle size="s">
                            <h3>密钥授权</h3>
                          </EuiTitle>
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiTextColor color="subdued">复制激活码生成授权密钥，导入密钥进行授权</EuiTextColor>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiFlexGroup alignItems="center">
                        <EuiFlexItem grow={false} style={{ width: 80 }}>
                          <EuiText textAlign="right">激活码:</EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                          <span>{activeCode}</span>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ width: 70 }}>
                          <EuiCopy textToCopy={activeCode} afterMessage="已复制">
                            {copy => (
                              <EuiToolTip
                                content="复制激活码"
                                position="left"
                              >
                                <EuiButtonIcon
                                  aria-label="copy"
                                  iconType="copy"
                                  onClick={copy}
                                />
                              </EuiToolTip>
                            )}
                          </EuiCopy>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                      <EuiFlexGroup alignItems="center">
                        <EuiFlexItem grow={false} style={{ width: 80 }}>
                          <EuiText textAlign="right">授权密钥:</EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiFieldText
                            value={authCode}
                            fullWidth
                            onChange={(e) => this.setState({ authCode: e.target.value })}
                          />
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ width: 70 }}>
                          <EuiButton
                            size="s"
                            onClick={() => this.putAuthCode()}
                          >
                            导入
                          </EuiButton>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiPanel>
                  </EuiFlexItem>

                  <EuiFlexItem grow={false}>
                    <EuiPanel paddingSize="m">
                      {head}
                      {table}
                    </EuiPanel>
                  </EuiFlexItem>
                </EuiFlexGroup>
							</EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
	}
});