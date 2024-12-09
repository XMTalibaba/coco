import React, { Component } from 'react';
import {
	EuiTabs,
	EuiTab,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
  EuiToolTip,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { SearchList } from './components/search-list';
import { DetailList } from './components/detail-list';
import { AppState } from '../../react-services/app-state';

export const SystemAccount = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '资产管理' }, { text: '系统账号' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class SystemAccount extends Component {
  constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
			tabs: [
				{ id: 'agent', name: '主机' },
        { id: 'account', name: '账号' },
			],
      listType: 'list', // 区分是列表页还是详情页
			selectView: 'agent', // 维度tab
      listProps: { // 列表页组件传参
        'agent': {
          paramsOptions: [ // 查询参数渲染组件
            // {
            //   label: '主机名',
            //   type: 'name', // 参数字段
            //   inputType: 'text',
            // },
            // {
            //   label: '主机系统',
            //   type: 'os',
            //   inputType: 'select',
            //   selectOptions: [
            //     { value: '', text: '所有主机系统' },
            //     { value: 'windows', text: 'Windows' },
            //     { value: 'centos', text: 'Centos' },
            //   ]
            // }
          ],
          searchUrl: '/agents/summary/accounts?', // 查询路径
          detailUrl: 'accounts', // 详情接口路径，拼接到后边
        },
        'account': {
          paramsOptions: [
            {
              label: '账号分类',
              type: 'name',
              inputType: 'select',
              selectOptions: [
                { value: 'all', text: '所有账号分类' },
                { value: 'root', text: 'root账号' },
                { value: 'sudo', text: 'sudo账号' },
                { value: 'weak_password', text: '弱口令账号' },
                { value: 'interactive_login', text: '交互登录账号' },
              ],
              initValue: 'all'
            }
          ],
          searchUrl: '/agents/summary/accounts?',
        }
      },
      detailProps: { // 详情页组件传参
        'agent': {
          columns: [ // 表格列
            { field: 'user_name', name: '用户名' },
            { field: 'agent_id', name: '代理ID' },
            { field: 'agent_name', name: '代理名称' },
            { field: 'agent_ip', name: '代理IP' },
            { field: 'group_id', name: '用户组ID' },
            { field: 'user_id', name: 'UID' },
            { field: 'home_dir', name: '用户主目录' },
            { field: 'shell_program', name: 'Shell' },
            { field: 'last_login_ip', name: '最近登录IP' },
            { field: 'last_login_time', name: '最近登录时间' },
          ],
          searchUrl: '', // 查询路径
          params: {}
        },
        'account': {
          columns: [
            { field: 'user_name', name: '用户名' },
            { field: 'agent_id', name: '代理ID' },
            { field: 'agent_name', name: '代理名称' },
            { field: 'agent_ip', name: '代理IP' },
            { field: 'group_id', name: '用户组ID' },
            { field: 'user_id', name: 'UID' },
            { field: 'home_dir', name: '用户主目录' },
            { field: 'shell_program', name: 'Shell' },
            { field: 'last_login_ip', name: '最近登录IP' },
            { field: 'last_login_time', name: '最近登录时间' },
          ],
          searchUrl: '',
          params: {}
        }
      }
    };
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
                    <span>&nbsp;{WAZUH_MODULES['systemAccount'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['systemAccount'].description}
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
	renderTabs() {
		const { selectView } = this.state;
		return (
      <EuiFlexItem style={{ margin: '0 8px 0 8px' }}>
        <EuiTabs>
          {this.state.tabs.map((tab, index) => {
            return <EuiTab
							onClick={() => this.onSelectedTabChanged(tab.id)}
							isSelected={selectView === tab.id}
							key={index}
						>
							{tab.name}
						</EuiTab>
          }
          )}
        </EuiTabs>
      </EuiFlexItem>
    );
	}
	onSelectedTabChanged(id) {
    if (id !== this.state.selectView) {
			this.setState({ selectView: id, listType: 'list' });
    }
  }

  agentColumns() {
    return [
      {
        field: 'agent_id',
        name: 'ID',
      },
      {
        field: 'agent_name',
        name: '主机名',
      },
      {
        field: 'agent_ip',
        name: 'IP',
      },
      {
        field: 'count',
        name: '数量',
      },
      {
        name: '操作',
        render: agent => this.actionButtonsRender(agent)
      }
    ]
  }

  accountColumns() {
    return [
      {
        field: 'user_name',
        name: '账号名',
      },
      {
        field: 'count',
        name: '数量',
      },
      {
        name: '操作',
        render: agent => this.actionButtonsRender(agent)
      }
    ]
  }

  actionButtonsRender(agent) {
    return (
      <div className={'icon-box-action'}>
        { agent.count > 0 && 
          <EuiToolTip
            content="查看详情"
            position="left"
          >
            <EuiButtonIcon
              onClick={ev => {
                ev.stopPropagation();
                this.toDetail(agent)
              }}
              iconType="eye"
              color={'primary'}
              aria-label="查看详情"
            />
          </EuiToolTip>
        }
      </div>
    )
  }

  toDetail(item) {
    console.log('查看详情', this.state.selectView, item.detailSearch)
    const { detailProps, selectView } = this.state;
    if (item.detailSearch['searchUrl']) {
      detailProps[selectView]['searchUrl'] = item.detailSearch['searchUrl']
    }
    if (Object.keys(item.detailSearch['params']).length > 0) {
      detailProps[selectView]['params'] = item.detailSearch['params']
    }
    this.setState({ detailProps, listType: 'detail' })
  }

  toList() {
    this.setState({ listType: 'list' })
  }

  render() {
    const { listProps, selectView, listType, detailProps } = this.state;
    const title = this.renderTitle();
		const tabs = this.renderTabs();
    let searchParams = listProps[selectView];
    if (selectView === 'agent') {
      searchParams['columns'] = this.agentColumns();
    }
    else {
      searchParams['columns'] = this.accountColumns();
    }
    let searchDetailParams = detailProps[selectView]
    
    return (
      <EuiFlexGroup direction="column">
				<EuiFlexItem grow={false}>
					<div className="wz-module">
						<div className='wz-module-header-agent-wrapper'>
							<div className='wz-module-header-agent'>
								{title}
							</div>
						</div>
						<div className='wz-module-header-nav-wrapper'>
						<div className={this.state.tabs && this.state.tabs.length && 'wz-module-header-nav'}>
							{(this.state.tabs && this.state.tabs.length) &&
								<div className="wz-welcome-page-agent-tabs">
									<EuiFlexGroup>
										{tabs}
									</EuiFlexGroup>
								</div>
							}
						</div>
					</div>
						<div className='wz-module-body'>
              { listType === 'list' && <SearchList searchProps={searchParams} selectView={selectView} />}
              { listType === 'detail' && <DetailList searchProps={searchDetailParams} toList={() => this.toList()} />}
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
    )
  }
});