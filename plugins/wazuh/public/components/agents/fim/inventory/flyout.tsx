/*
 * Wazuh app - Integrity monitoring components
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import React, { Component, Fragment } from 'react';
import {
  EuiFlyout,
  EuiFlyoutHeader,
  EuiFlyoutBody,
  EuiTitle,
  EuiLoadingContent,
  EuiCallOut,
} from '@elastic/eui';
import { WzRequest } from '../../../../react-services/wz-request';
import { FileDetails } from './fileDetail';
import { AppState } from '../../../../react-services/app-state';

export class FlyoutDetail extends Component {
  state: {
    currentFile: boolean | { [key: string]: string };
    clusterFilter: {};
    isLoading: boolean;
    error: boolean;
    type: 'file' | 'registry_key';
  };

  props!: {
    fileName: string;
    agentId: string;
    view: 'inventory' | 'events' | 'extern';
    closeFlyout(): void;
  };

  constructor(props) {
    super(props);
    this.state = {
      currentFile: false,
      clusterFilter: {},
      isLoading: true,
      error: false,
      type: 'file',
    };
  }

  async componentDidMount() {
    try {
      const isCluster = (AppState.getClusterInfo() || {}).status === 'enabled';
      const clusterFilter = isCluster
        ? { 'cluster.name': AppState.getClusterInfo().cluster }
        : { 'manager.name': AppState.getClusterInfo().manager };
      this.setState({ clusterFilter });
      let currentFile;
      if (typeof this.props.item === 'boolean' && typeof this.props.fileName !== undefined) {
        const regex = new RegExp('file=' + '[^&]*');
        const match = window.location.href.match(regex);
        if (match && match[0]) {
          let file = decodeURIComponent(match[0].split('=')[1]);
          const data = await WzRequest.apiReq('GET', `/syscheck/${this.props.agentId}`, {
            params: {
              q: `file=${file};(type=file,type=registry_key)`,
            },
          });
          currentFile = ((((data || {}).data || {}).data || {}).affected_items || [])[0];
        }
      } else if (this.props.item) {
        currentFile = this.props.item;
      } else {          
        let file = this.props.fileName;
        const data = await WzRequest.apiReq('GET', `/syscheck/${this.props.agentId}`, {
          params: {
            q: `file=${file};(type=file,type=registry_key)`,
          },
        });
        currentFile = ((((data || {}).data || {}).data || {}).affected_items || [])[0];
      }
      if (!currentFile) {
        throw false;
      }
      this.setState({ currentFile, type: currentFile.type, isLoading: false });
    } catch (err) {
      this.setState({
        error: `无法为 ${this.props.fileName} 获取数据`,
        currentFile: { file: this.props.fileName },
      });
    }
  }

  componentWillUnmount() {
    window.location.href = window.location.href.replace(new RegExp('&file=' + '[^&]*', 'g'), '');
  }

  render() {
    const { type } = this.state;
    return (
      <EuiFlyout
        onClose={() => this.props.closeFlyout()}
        size="l"
        aria-labelledby={this.state.currentFile.file}
        maxWidth="70%"
        className="wz-inventory wzApp"
      >
        <EuiFlyoutHeader hasBorder className="flyout-header">
          <EuiTitle size="s">
            <h2 id={this.state.currentFile.file}>{this.state.currentFile.file}</h2>
          </EuiTitle>
        </EuiFlyoutHeader>
        {this.state.isLoading && (
          <EuiFlyoutBody className="flyout-body">
            {(this.state.error && (
              <EuiCallOut title={this.state.error} color="warning" iconType="alert" />
            )) || <EuiLoadingContent style={{ margin: 16 }} />}
          </EuiFlyoutBody>
        )}
        {this.state.currentFile && !this.state.isLoading && (
          <EuiFlyoutBody className="flyout-body">
            <FileDetails
              currentFile={this.state.currentFile}
              type={type}
              {...this.props}
              implicitFilters={[
                { 'rule.groups': 'syscheck' },
                { 'syscheck.path': this.state.currentFile.file },
                { 'agent.id': this.props.agentId },
                this.state.clusterFilter,
              ]}
            />
          </EuiFlyoutBody>
        )}
      </EuiFlyout>
    );
  }
}
