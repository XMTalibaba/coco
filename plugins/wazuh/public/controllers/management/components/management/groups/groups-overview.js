/*
 * Wazuh app - React component for building the groups table.
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
  EuiText,
  EuiPage,
	EuiButtonIcon,
	EuiPopover,
	EuiPopoverTitle,
  EuiTextColor,
  EuiButton,
} from '@elastic/eui';

// Wazuh components
import WzGroupsTable from './groups-table';
import WzGroupsActionButtons from './actions-buttons-main';

import { connect } from 'react-redux';
import { withUserAuthorizationPrompt } from '../../../../../components/common/hocs'
import { WAZUH_MODULES } from '../../../../../../common/wazuh-modules';
import { compose } from 'redux';
import { GroupEdit } from './group-edit';

export class WzGroupsOverview extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      isDescPopoverOpen: false,
      listType: 'list',
      detailsItem: {}
    }
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
                    <span>&nbsp;{WAZUH_MODULES['groupOverview'].title}&nbsp;&nbsp;</span>
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
                    {WAZUH_MODULES['groupOverview'].description}
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

  toList() {
    this.setState({ listType: 'list', detailsItem: {} });
  }
  toDetails(item) {
    this.setState({ listType: 'details', detailsItem: item });
  }

  render() {
    const title = this.renderTitle();
    const { listType, detailsItem } = this.state;
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
              { listType === 'list' && (
                <EuiPanel>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiFlexGroup alignItems="center">
                        <EuiFlexItem grow={false}>
                          <EuiTitle size="s">
                            <h3>分组列表</h3>
                          </EuiTitle>
                        </EuiFlexItem>
                        <EuiFlexItem>
                          <EuiTextColor color="subdued">{'在这里，您可以检查您的群组、代理和文件'}</EuiTextColor>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      <EuiButton
                        size="s"
                        onClick={() => this.setState({ listType: 'add' })}
                      >
                        添加新组
                      </EuiButton>
                    </EuiFlexItem>
                    <WzGroupsActionButtons />
                  </EuiFlexGroup>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <WzGroupsTable toDetails={(item) => this.toDetails(item)} />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiPanel>
                )}
                { listType !== 'list' && (
                  <GroupEdit listType={listType} detailsItem={detailsItem} toList={() => this.toList()} />
                )}
              </EuiPage>
            </div>
          </div>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.groupsReducers
  };
};


export default compose(
  withUserAuthorizationPrompt([{action: 'group:read', resource: 'group:id:*'}]),
  connect(
    mapStateToProps
  ),
)(WzGroupsOverview);
