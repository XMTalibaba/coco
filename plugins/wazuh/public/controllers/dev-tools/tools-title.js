import React, { Component, Fragment } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
  EuiTabs,
  EuiTab,
  EuiPage,
  EuiEmptyPrompt
} from '@elastic/eui';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';

export class ToolsTitle extends Component {
  constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
    };
	}

  render() {
		return (
			<EuiFlexGroup direction="column">
				<EuiFlexItem grow={false}>
          <div className='wz-module'>
            <div className='wz-module-header-agent-wrapper'>
              <div className='wz-module-header-agent'>
                <EuiFlexGroup>
                  <EuiFlexItem className="wz-module-header-agent-title">
                    <EuiFlexGroup justifyContent={'spaceBetween'}>
                      <EuiFlexItem grow={false}>
                        <span style={{ display: 'inline-flex' }}>
                          <EuiTitle size="s">
                            <h1>
                              <span>&nbsp;{WAZUH_MODULES['toolsOverview'].title}&nbsp;&nbsp;</span>
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
                              {WAZUH_MODULES['toolsOverview'].description}
                            </div>
                          </EuiPopover>
                        </span>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}></EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </div>
            </div>
          </div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
	}
}