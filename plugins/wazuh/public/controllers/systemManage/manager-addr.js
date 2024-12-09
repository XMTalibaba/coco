import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSelect,
  EuiSpacer,
  EuiPage,
  EuiPanel,
  EuiBasicTable,
  EuiFieldSearch,
  EuiInMemoryTable,
  EuiText,
  EuiTitle,
  EuiButton,
  EuiFieldText,
  EuiComboBox,
  EuiButtonEmpty,
  EuiToolTip,
  EuiButtonIcon,
  EuiOverlayMask,
  EuiConfirmModal,
  EuiTextColor,
  EuiPopover,
  EuiPopoverTitle,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getToasts, getHttp } from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { formatUIDate } from '../../react-services/time-service';
import { AppState } from '../../react-services/app-state';

export const ManagerAddr = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '系统管理' }, { text: '管理器地址配置' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class ManagerAddr extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      totalItems: 0,
      listItems: [],
      isLoading:false,
      listType: 'list',
      formParams: {
        iface: '',
        ip: '',
        gateway: '',
      },
      isModalVisible: false
    }
  }
 
  async componentDidMount() {
    this._isMount = true;
 
    await this.getItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }
 
  async getItems() {
    try {
      this._isMount && this.setState({ isLoading: true });
      const rawItems = await WzRequest.apiReq('GET', `/manager/host_ipaddr`, {});
      let listItems = (
        ((rawItems || {}).data || {}).data || {}
      ).affected_items;
      let totalItems = listItems.length;
      this.setState({ listItems, totalItems, isLoading: false })
    } catch (error) {
      this.setState({ isLoading: false });
      console.log(error);
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
 
  columns() {
    return [
      {
        field: 'interface',
        name: '接口',
      },
      {
        field: 'ip',
        name: 'IP地址',
      },
      {
        field: 'gateway',
        name: '网关地址',
      },
      {
        name: '操作',
        width: '80',
        render: item => this.actionButtonsRender(item)
      }
    ]
  }
 
  actionButtonsRender(item) {
    return (
      <div className={'icon-box-action'}>
        <EuiToolTip
          content={`编辑地址`}
          position="left"
        >
          <EuiButtonIcon
            onClick={ev => {
              ev.stopPropagation();
              this.setState({ listType: 'detail', formParams: { iface: item.interface, ip: item.ip, gateway: item.gateway } });
            }}
            iconType="indexEdit"
            color={'primary'}
            aria-label="编辑地址"
          />
        </EuiToolTip>
      </div>
    )
  }
 
  onChangeForm(e, type) {
    let { formParams } = this.state;
    formParams[type] = e.target.value;
    this.setState({ formParams });
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
        search={{ box: { incremental: true, placeholder: '过滤地址' } }}
      />
    )
  }
 
  headRender() {
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
                  <h2>地址列表 ({this.state.totalItems})</h2>
                </EuiTitle>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="xs" />
      </div>
    );
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
                    <span>&nbsp;{WAZUH_MODULES['managerAddr'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['managerAddr'].description}
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
 
  editRender() {
    const {  formParams } = this.state;
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h3>{`编辑地址`}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="s"
              onClick={() => this.toList()}
              iconType="cross"
            >
              关闭
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">
              接口:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText>
              {formParams.iface}
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">
              IP地址:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 300 }}>
            <EuiFieldText
              value={formParams.ip}
              onChange={(e) => this.onChangeForm(e, 'ip')}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">
              网关地址:
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 300 }}>
            <EuiFieldText
              value={formParams.gateway}
              onChange={(e) => this.onChangeForm(e, 'gateway')}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        <EuiButton
          size="s"
          // onClick={() => this.toSave()}
          onClick={() => this.setState({ isModalVisible: true })}
        >
          保存
        </EuiButton>
      </div>
    )
  }
 
  toList() {
    this.setState({ listType: 'list', formParams: { iface: '', ip: '', gateway: '' } });
    this.getItems();
  }

  testIpList(ips) {
		if (ips === '') return true;
    // 把 ips 按逗号拆成 IP 数组，分别进行验证
    // every 表示每个 ip 验证通过才算通过
    return ips.split(",")
			.every(ip => {
				// 把每个 IP 拆成几段
				const segments = ip.split(".");
				// 如果是精确的 4 段而且每段转换成数字都在 1~255 就对了
				return segments.length === 4
					&& segments
						.map(segment => parseInt(segment, 10) || 0)
						.every(n => n >= 0 && n <= 255);
			});
	}
 
  async toSave() {
    try {
      this.setState({ isModalVisible: false })
      const { formParams } = this.state;

			if (!formParams.ip || !formParams.gateway) {
				this.showToast(
					'danger',
					'警告',
					'管理器地址配置失败: IP地址、网关地址为必填',
					3000
				);
			}
			else if (!this.testIpList(formParams.ip) ||!this.testIpList(formParams.gateway) ) {
				this.showToast(
					'danger',
					'警告',
					'管理器地址配置失败: 请检验IP格式',
					3000
				);
			}
			else {
				await WzRequest.apiReq('PUT', `/manager/host_ipaddr?iface=${formParams.iface}&ip=${formParams.ip}&gateway=${formParams.gateway}`, {});

				this.showToast(
					'success',
					'成功',
					'管理器地址配置成功',
					3000
				);
        this.toList()
			}
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '管理器地址配置失败: ' + error,
        3000
      );
    }
  }
 
  render() {
    const { listType, isModalVisible } = this.state;
    const title = this.renderTitle();
    const table = this.tableRender();
    const head = this.headRender();
    const edit = this.editRender();
    let modal;
    if (isModalVisible) {
      modal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="修改管理器地址可能会使当前页面不可用，确认保存吗？"
            onCancel={() => this.setState({ isModalVisible: false })}
            onConfirm={() => this.toSave()}
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
                { listType !== 'list' && edit}
              </EuiPanel>
            </EuiPage>
						</div>
					</div>
				</EuiFlexItem>
        {modal}
			</EuiFlexGroup>
		);
  }
})