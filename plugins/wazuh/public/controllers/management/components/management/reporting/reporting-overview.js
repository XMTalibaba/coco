/*
 * Wazuh app - React component for building the reporting view
 *
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component } from 'react';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiPanel,
  EuiTitle,
  EuiPage,
  EuiTextColor,
	EuiButtonIcon,
	EuiPopover,
	EuiPopoverTitle,
} from '@elastic/eui';

// Wazuh components
import WzReportingTable from './reporting-table';
import WzReportingActionButtons from './utils/actions-buttons-main';
import { WAZUH_MODULES } from '../../../../../../common/wazuh-modules';

export class WzReportingOverview extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      isDescPopoverOpen: false,
    };
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentDidUpdate() {}

  componentWillUnmount() {
    this._isMounted = false;
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
                    <span>&nbsp;{WAZUH_MODULES['reportOverview'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['reportOverview'].description}
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
              <EuiPage style={{ background: 'transparent' }}>
                <EuiPanel>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiFlexGroup alignItems="center">
                        <EuiFlexItem grow={false}>
                          <EuiTitle size="s">
                            <h3>报告列表</h3>
                          </EuiTitle>
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiTextColor color="subdued">{'在这里，您可以检查所有报告'}</EuiTextColor>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    <WzReportingActionButtons />
                  </EuiFlexGroup>
                  {/* <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiText color="subdued" style={{ paddingBottom: '15px' }}>
                        在这里，您可以您的检查所有报告。
                      </EuiText>
                    </EuiFlexItem>
                  </EuiFlexGroup> */}
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <WzReportingTable />
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
}

export default WzReportingOverview;
