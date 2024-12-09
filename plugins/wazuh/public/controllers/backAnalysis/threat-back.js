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
import OverviewActions from '../overview/components/overview-actions/overview-actions';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { ThreatBackWarp } from './threatBack/threat-back-warp';
import { AppState } from '../../react-services/app-state';

export const ThreatBack = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '溯源分析' }, { text: '威胁溯源' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class ThreatBack extends Component {
  constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
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
                    <span>&nbsp;{WAZUH_MODULES['threatBack'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['threatBack'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <OverviewActions {...{ ...this.props, ...this.props.agentsSelectionProps }} />
						</EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
	}

  render() {
    const title = this.renderTitle();
    
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
              <ThreatBackWarp { ...this.props } />
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
    )
  }
});