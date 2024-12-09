import React, { Component } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { AgentsTasks } from './planTasks/agentsTasks';
import { VuldetScan } from './planTasks/vuldetScan';
import { AppState } from '../../react-services/app-state';

export const PlanTasks = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '资产管理' }, { text: '计划任务' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class PlanTasks extends Component {
  _isMount = false;
	constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
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
                    <span>&nbsp;{WAZUH_MODULES['planTasks'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['planTasks'].description}
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
							<EuiPage>
								<EuiFlexGroup direction="column">
									<EuiFlexItem grow={false}>
										<AgentsTasks />
									</EuiFlexItem>
									<EuiFlexItem grow={false}>
										<VuldetScan />
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