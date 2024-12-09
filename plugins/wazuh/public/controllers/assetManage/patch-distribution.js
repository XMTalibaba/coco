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
import { PatchManage } from './patchDistribution/patch-manage';
import { DistributionManage } from './patchDistribution/distribution-manage';
import { AppState } from '../../react-services/app-state';

export const PatchDistribution = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '资产管理' }, { text: '补丁管理' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class PatchDistribution extends Component {
  constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
			tabs: [
				{ id: 'patch', name: '补丁管理' },
        { id: 'distribution', name: '分发管理' },
			],
			selectView: 'patch', // 维度tab
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
                    <span>&nbsp;{WAZUH_MODULES['patchDistribution'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['patchDistribution'].description}
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
			this.setState({ selectView: id });
    }
  }

  render() {
    const { selectView} = this.state;
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
              { selectView === 'patch' && <PatchManage />}
              { selectView === 'distribution' && <DistributionManage />}
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
    )
  }

});