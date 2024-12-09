/*
 * Wazuh app - React component for Visualize.
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
  EuiKeyPadMenu,
  EuiKeyPadMenuItem,
  EuiIcon,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody
} from '@elastic/eui';
import './visualize-top-menu.scss';
import WzReduxProvider from '../../redux/wz-redux-provider';

export class VisualizeTopMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: this.props.tab || '',
      subtab: this.props.subtab || '',
      isAgentModalVisible: false
    };
  }

  async componentDidUpdate() {}

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.tab) {
      this.setState({
        tab: nextProps.tab
      });
    }
    if (nextProps.subtab) {
      this.setState({
        subtab: nextProps.subtab
      });
    }
  }

  closeAgentModal() {
    this.setState({ isAgentModalVisible: false });
  }

  showAgentModal() {
    this.setState({ isAgentModalVisible: true });
  }

  render() {
    let modal;

    if (this.state.isAgentModalVisible) {
      modal = (
        <EuiOverlayMask>
          <EuiModal
            onClose={() => this.closeAgentModal()}
            initialFocus="[name=popswitch]"
          >
            <EuiModalHeader>
              <EuiModalHeaderTitle>选择一个代理</EuiModalHeaderTitle>
            </EuiModalHeader>
            <EuiModalBody>
              <div>
                <button
                  onClick={() => {
                    this.setState({ isAgent: '001' });
                    this.props.setAgent('001');
                    this.closeAgentModal();
                  }}
                >
                  代理
                </button>
              </div>
            </EuiModalBody>
          </EuiModal>
        </EuiOverlayMask>
      );
    }
    return (
      <div>
        <EuiFlexItem>
          <EuiKeyPadMenu className="VisualizeTopMenu">
            {!this.state.isAgent && (
              <EuiKeyPadMenuItem
                label="代理"
                onClick={() => this.showAgentModal()}
              >
                <EuiIcon type="watchesApp" color="primary" size="m" />
              </EuiKeyPadMenuItem>
            )}
            {this.state.isAgent && (
              <div className="TopMenuAgent">
                <EuiKeyPadMenuItem
                  label="切换代理"
                  onClick={() => this.showAgentModal()}
                  betaBadgeLabel="切换"
                  betaBadgeTooltipContent={`切换代理 ${this.state.isAgent}`}
                  betaBadgeIconType="merge"
                >
                  <EuiIcon type="watchesApp" color="primary" size="m" />
                </EuiKeyPadMenuItem>
                <EuiKeyPadMenuItem
                  label="移除代理"
                  onClick={() => {
                    this.setState({ isAgent: false });
                    this.props.setAgent(false);
                  }}
                  betaBadgeLabel="移除"
                  betaBadgeTooltipContent={`移除代理 ${this.state.isAgent}`}
                  betaBadgeIconType="cross"
                >
                  <EuiIcon type="watchesApp" color="primary" size="m" />
                </EuiKeyPadMenuItem>
              </div>
            )}
            {this.state.subtab === 'panels' && (
              <EuiKeyPadMenuItem isDisabled label="报告">
                <EuiIcon type="reportingApp" color="primary" size="m" />
              </EuiKeyPadMenuItem>
            )}
            <EuiKeyPadMenuItem
              label={
                this.state.subtab === 'discover' ? 'Dashboard' : 'Discover'
              }
              onClick={() =>
                this.props.switchDiscover(
                  this.state.subtab === 'discover' ? 'panels' : 'discover'
                )
              }
            >
              <EuiIcon
                type={
                  this.state.subtab === 'discover'
                    ? 'visualizeApp'
                    : 'discoverApp'
                }
                color="primary"
                size="m"
              />
            </EuiKeyPadMenuItem>
          </EuiKeyPadMenu>
        </EuiFlexItem>
        {modal}
      </div>
    );
  }
}
