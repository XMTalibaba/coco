import React, { Component } from 'react';
import {
  EuiPage,
	EuiTabs,
	EuiTab,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
	EuiPanel,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { CDBList } from './blackWhiteList/CDB-list';
import { BruteForce } from './blackWhiteList/brute-force';
import { ThresholdConfig } from './blackWhiteList/threshold-config';
import { RiskService } from './blackWhiteList/risk-service';
import { WeakPasswordAccount } from './blackWhiteList/weak-password-account';
import { ScanProtective } from './blackWhiteList/scan-protective';
import { NonWorkingTime } from './blackWhiteList/non-working-time';
import { AppState } from '../../react-services/app-state';
import './blackWhiteList/blackWhiteList.scss';

export const BlackWhitelist = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '策略管理' }, { text: '安全防护策略' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class BlackWhitelist extends Component {
	constructor(props) {
		super(props);
    this.offset = 195;
		this.state = {
      isDescPopoverOpen: false,
			tabs: [
				{ id: 'riskBlacklist', name: '高危指令' },
				// { id: 'illegalWhitelist', name: '非法外联' },
				{ id: 'reboundShellWhitelist', name: '反弹shell' },
				{ id: 'localAskRightWhitelist', name: '本地提权' },
				{ id: 'bruteForceWhitelist', name: '暴力破解' }, 
				{ id: 'riskPortBlacklist', name: '高危端口' },
				{ id: 'validAccounts', name: '合法账号' },
				{ id: 'validIP', name: '合法IP' },
				{ id: 'thresholdConfig', name: '阈值配置' },
				{ id: 'riskService', name: '高危服务' },
				{ id: 'weakPasswordAccount', name: '弱口令账户' },
				{ id: 'scanProtective', name: '扫描防护' },
				{ id: 'allowedCves', name: '漏洞白名单' },
				{ id: 'nonWorkingTime', name: '非工作时间' },
			],
			selectView: 'riskBlacklist'
    };
	}

	async componentDidMount() {
		this.height = window.innerHeight - this.offset;
		this.forceUpdate();
    window.addEventListener('resize', this.updateHeight);
	}

	componentWillUnmount() {
    window.removeEventListener('resize', this.updateHeight);
  }

  updateHeight = () => {
    this.height = window.innerHeight - this.offset;
    this.forceUpdate();
  };

	renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'}>
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['blackWhitelist'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['blackWhitelist'].description}
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
    }
  }

	render() {
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
									<EuiFlexGroup style={{ height: this.height }}>
										<EuiFlexItem grow={false} style={{ borderRight: '1px solid #D3DAE6', overflowY: 'auto' }}>
											{tabs}
										</EuiFlexItem>
										<EuiFlexItem style={{ overflowY: 'auto', overflowX: 'hidden' }}>
										{ this.state.selectView === 'riskBlacklist' && (
											<CDBList filename="suspicious-programs"></CDBList>
										)}
										{
											this.state.selectView === 'illegalWhitelist' && (
											<CDBList filename="allowed_network_connections"></CDBList>
										)}
										{ this.state.selectView === 'reboundShellWhitelist' && (
											<CDBList filename="reverse-shell"></CDBList>
										)}
										{ this.state.selectView === 'localAskRightWhitelist' && (
											<CDBList filename="suid-change"></CDBList>
										)}
										{ this.state.selectView === 'bruteForceWhitelist' && (
											<BruteForce />
										)}
										{
											this.state.selectView === 'riskPortBlacklist' && (
											<CDBList filename="dangerous_port_list"></CDBList>
										)}
										{
											this.state.selectView === 'validAccounts' && (
											<CDBList filename="valid_accounts"></CDBList>
										)}
										{
											this.state.selectView === 'validIP' && (
											<CDBList filename="valid_IP"></CDBList>
										)}
										{
											this.state.selectView === 'thresholdConfig' && (
											<ThresholdConfig />
										)}
										{
											this.state.selectView === 'riskService' && (
											<RiskService />
										)}
										{
											this.state.selectView === 'weakPasswordAccount' && (
											<WeakPasswordAccount />
										)}
										{
											this.state.selectView === 'scanProtective' && (
											<ScanProtective />
										)}
										{
											this.state.selectView === 'allowedCves' && (
											<CDBList filename="allowed_cves"></CDBList>
										)}
										{
											this.state.selectView === 'nonWorkingTime' && (
											<NonWorkingTime />
										)}
										</EuiFlexItem>
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