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
	EuiPage,
	EuiPanel,
  EuiSpacer,
  EuiSelect,
	EuiText
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { SecurityReinforce } from './policyManage/security-reinforce';
import { AgentConfiguration } from './policyManage/agent-configuration';
import { PathConfiguration } from './policyManage/path-configuration';
import { ExternalDevice } from './policyManage/external-device';
import { WeakPassword } from './policyManage/weak-password';
import { ValidWifi } from './policyManage/valid-wifi';
import { ValidLan } from './policyManage/valid-lan';
import GroupsHandler from '../management/components/management/groups/utils/groups-handler';
import { AppState } from '../../react-services/app-state';
import './blackWhiteList/blackWhiteList.scss';

export const PolicyManage = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '策略管理' }, { text: '代理策略管理' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class PolicyManage extends Component {
	constructor(props) {
		super(props);
    this.offset = 255;
		this.state = {
      isDescPopoverOpen: false,
			tabs: [
				{ id: 'securityReinforce', name: '安全加固' },
				{ id: 'agentConfiguration', name: '扫描周期' },
				{ id: 'pathConfiguration', name: '监控路径' },
				{ id: 'devicesWhitelist', name: '外设白名单' },
				{ id: 'weakPasswordlist', name: '弱口令名单' },
				{ id: 'validWifi', name: '无线网络管控' },
				{ id: 'validLan', name: '有线网络管控' },
			],
			selectView: 'securityReinforce',
			groupsOptions: [],
			groupSelect: ''
    };
    this.groupsHandler = GroupsHandler;
	}

	async componentDidMount() {
		this.height = window.innerHeight - this.offset;
		this.forceUpdate();
    window.addEventListener('resize', this.updateHeight);
		await this.getOptions()
	}

	componentWillUnmount() {
    window.removeEventListener('resize', this.updateHeight);
  }

  updateHeight = () => {
    this.height = window.innerHeight - this.offset;
    this.forceUpdate();
  };

	async getOptions() {
		try {
			let departmentGroups = await AppState.getDepartmentGroups();
			let groupsOptions = departmentGroups.map(k => {
				let item = {
					value: k.name,
					text: k.name
				}
				return item;
			})
			let groupSelect = groupsOptions.length > 0 ? groupsOptions[0].value : '';

      this.setState({
				groupsOptions,
				groupSelect
			});
			this.props.changePolicyManageTypes(groupSelect);
    } catch (error) {
      console.log(error)
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
                    <span>&nbsp;{WAZUH_MODULES['policyManage'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['policyManage'].description}
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
			<EuiTabs className="columnTabs" >
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
    );
	}
	onSelectedTabChanged(id) {
    if (id !== this.state.selectView) {
			this.setState({ selectView: id });
      // this.props.changePolicyManageTypes('list');
    }
  }
	onSelectGroupChanged(value) {
		this.setState({ groupSelect: value })
		this.props.changePolicyManageTypes(value);
	}

	render() {
		const { groupsOptions, groupSelect, selectView } = this.state;
		const title = this.renderTitle();
		const tabs = this.renderTabs();
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
								<EuiPanel>
									<div style={{ paddingBottom: '16px', borderBottom: '1px solid rgb(211, 218, 230)'}}>
										<EuiFlexGroup alignItems="center">
											<EuiFlexItem grow={false}>
												<EuiText textAlign="right">{'分组'}:</EuiText>
											</EuiFlexItem>
											<EuiFlexItem grow={false} style={{ width: 150 }}>
												<EuiSelect
													options={groupsOptions}
													value={groupSelect}
													onChange={(e) => this.onSelectGroupChanged(e.target.value)}
												/>
											</EuiFlexItem>
										</EuiFlexGroup>
									</div>
									<EuiFlexGroup style={{ height: this.height }}>
										<EuiFlexItem grow={false} style={{ borderRight: '1px solid #D3DAE6', overflowY: 'auto' }}>
											{tabs}
										</EuiFlexItem>
										{ groupSelect && (
											<EuiFlexItem style={{ overflowY: 'auto', overflowX: 'hidden' }}>
											{ selectView === 'securityReinforce' && (
												<SecurityReinforce { ...this.props } selectView={selectView} />
											)}
											{ selectView === 'agentConfiguration' && (
												<AgentConfiguration { ...this.props } selectView={selectView} />
											)}
											{ selectView === 'pathConfiguration' && (
												<PathConfiguration { ...this.props } selectView={selectView} />
											)}
											{ selectView === 'devicesWhitelist' && (
												<ExternalDevice { ...this.props } selectView={selectView} />
											)}
											{ selectView === 'weakPasswordlist' && (
												<WeakPassword { ...this.props } selectView={selectView} />
											)}
											{ selectView === 'validWifi' && (
												<ValidWifi { ...this.props } selectView={selectView} />
											)}
											{ selectView === 'validLan' && (
												<ValidLan { ...this.props } selectView={selectView} />
											)}
											</EuiFlexItem>
										)}
									</EuiFlexGroup>
								</EuiPanel>
							</EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
	}
});