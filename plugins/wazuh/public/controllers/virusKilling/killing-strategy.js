import React, { Component } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
  EuiPanel,
  EuiTextColor,
  EuiText,
  EuiTabs,
  EuiTab,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { IsolationStrategy } from './killingStrategy/isolation-strategy';
import { ImmediateKill } from './killingStrategy/immediate-kill';
import { TimedKill } from './killingStrategy/timed-kill';
import { AppState } from '../../react-services/app-state';

export const KillingStrategy = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '病毒查杀' }, { text: '查杀策略' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class KillingStrategy extends Component {
  _isMount = false;
	constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      tabs: [
				{ id: 'strategy', name: '隔离策略' },
				{ id: 'realTime', name: '实时查杀' },
        { id: 'timed', name: '定时查杀' },
        { id: 'immediate', name: '立即查杀' },
			],
			selectView: 'strategy',
    };
	}

	async componentDidMount() {
    this._isMount = true;
  }
  componentWillUnmount() {
    this._isMount = false;
  }

	renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'} alignItems="center">
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['killingStrategy'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['killingStrategy'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}></EuiFlexItem>
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

	render() {
    const { selectView } = this.state;
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
              <EuiPage>
              { selectView === 'strategy' && <IsolationStrategy />}
              { selectView === 'realTime' && (
                <EuiPanel>
                  <EuiFlexGroup alignItems="center">
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h3>{'实时查杀'}</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiTextColor color="subdued">{'请到 策略管理-代理策略管理-监控路径 页面配置'}</EuiTextColor>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiPanel>
              )}
              { selectView === 'timed' && <TimedKill />}
              { selectView === 'immediate' && <ImmediateKill />}
              </EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
	}
});