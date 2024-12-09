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

export const SoftwareApp = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '资产管理' }, { text: '软件应用' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class SoftwareApp extends Component {
  constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
			tabs: [
				{ id: 'agent', name: '主机' },
        { id: 'software', name: '软件' },
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
          searchUrl: '/agents/summary/packages?', // 查询路径
          detailUrl: 'packages', // 详情接口路径，拼接到后边
        },
        'software': {
          paramsOptions: [
            // {
            //   label: '软件名',
            //   type: 'name',
            //   inputType: 'text',
            // },
            // {
            //   label: '软件版本',
            //   type: 'version',
            //   inputType: 'select',
            //   selectOptions: [
            //     { value: '', text: '所有软件版本' },
            //     { value: '1.0', text: '1.0' },
            //     { value: '2.0', text: '2.0' },
            //   ]
            // }
          ],
          searchUrl: '/agents/summary/packages?name=all',
        }
      },
      detailProps: { // 详情页组件传参
        'agent': {
          columns: [ // 表格列
            { field: 'name', name: '名称' },
            { field: 'agent_id', name: '代理ID' },
            { field: 'agent_name', name: '代理名称' },
            { field: 'agent_ip', name: '代理IP' },
            { field: 'architecture', name: '体系结构' },
            { field: 'version', name: '版本' },
            // { field: 'description', name: '描述' },
          ],
          searchUrl: '', // 查询路径
          params: {}
        },
        'software': {
          columns: [
            { field: 'name', name: '名称' },
            { field: 'agent_id', name: '代理ID' },
            { field: 'agent_name', name: '代理名称' },
            { field: 'agent_ip', name: '代理IP' },
            { field: 'architecture', name: '体系结构' },
            { field: 'version', name: '版本' },
            // { field: 'description', name: '描述' },
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
                    <span>&nbsp;{WAZUH_MODULES['softwareApp'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['softwareApp'].description}
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
        name: '主机ID',
      },
      {
        field: 'agent_name',
        name: '主机名',
      },
      {
        field: 'agent_ip',
        name: '主机IP',
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

  softwareColumns() {
    return [
      {
        field: 'package',
        name: '软件名',
      },
      {
        field: 'description',
        name: '描述',
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
      detailProps[selectView]['searchUrl'] = item.detailSearch['searchUrl'];
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
      searchParams['columns'] = this.softwareColumns();
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