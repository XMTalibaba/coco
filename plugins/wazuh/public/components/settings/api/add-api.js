/*
 * Wazuh app - React component for the adding an API entry form.
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
import PropTypes from 'prop-types';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiCodeBlock,
  EuiText,
  EuiSpacer,
  EuiCode,
  EuiButton,
  EuiButtonEmpty,
  EuiSteps,
  EuiCallOut,
  EuiPanel
} from '@elastic/eui';

export class AddApi extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: 'incomplete',
      fetchingData: false,
      blockClose: false
    };
  }

  componentDidMount() {
    this.setState({ enableClose: this.props.enableClose });
    this.checkErrorsAtInit();
  }

  /**
   * Checks if the component was initialized with some error in order to show it
   */
  checkErrorsAtInit() {
    if (this.props.errorsAtInit) {
      const error = this.props.errorsAtInit;
      this.setState({
        status: error.type || 'danger',
        blockClose: true,
        message:
          (error.data || error).message ||
          '无法访问API，请检查您的配置',
        fetchingData: false
      });
    }
  }

  /**
   * Check the APIs connections
   */
  async checkConnection() {
    //TODO handle this
    try {
      this.setState({
        status: 'incomplete',
        fetchingData: true,
        blockClose: false
      });

      await this.props.checkForNewApis();

      this.setState({
        status: 'complete',
        fetchingData: false,
        closedEnabled: true
      });
    } catch (error) {
      const close =
        error.data && error.data.code && error.data.code === 2001
          ? false
          : error.closedEnabled || false;
      this.setState({
        status: error.type || 'danger',
        closedEnabled: close,
        blockClose: !close,
        enableClose: false,
        message:
          (error.data || error).message || error ||
          '无法访问API，请检查您的配置',
        fetchingData: false
      });
    }
  }

  render() {
    const apiExample = `hosts:
  - <id>:
     url: <api_url>
     port: <api_port>
     username: <api_username>
     password: <api_password>
     run_as: <run_as>`;

    const checkConnectionChildren = (
      <div>
        {(this.state.status === 'warning' ||
          this.state.status === 'danger') && (
          <EuiCallOut
            color={this.state.status}
            iconType="help"
            title={this.state.message}
          />
        )}
        {(this.state.status === 'warning' ||
          this.state.status === 'danger') && <EuiSpacer />}
        <EuiText>
          检查Kibana服务器是否可以访问配置的API。
        </EuiText>
        <EuiSpacer />
        <EuiButton
          onClick={async () => await this.checkConnection()}
          isLoading={this.state.fetchingData}
        >
          检查连接
        </EuiButton>
        {(this.state.closedEnabled || this.state.enableClose) &&
          !this.state.blockClose && (
            <EuiButtonEmpty onClick={() => this.props.closeAddApi()}>
              关闭
            </EuiButtonEmpty>
          )}
      </div>
    );

    const editConfigChildren = (
      <div>
        <EuiText>
          修改{' '}
          <EuiCode>/usr/share/kibana/data/wazuh/config/wazuh.yml</EuiCode>{' '}
          设置连接信息。
        </EuiText>
        <EuiSpacer />
        <EuiCodeBlock language="yaml">{apiExample}</EuiCodeBlock>
        <EuiSpacer />
        <EuiText>
          <EuiCode>{'<id>'}</EuiCode> 是一个任意的ID，{' '}
          <EuiCode>{'<api_url>'}</EuiCode> 是API的URL，{' '}
          <EuiCode>{'<api_port>'}</EuiCode> 是端口，{' '}
          <EuiCode>{'<api_username>'}</EuiCode> 和{' '}
          <EuiCode>{'<api_password>'}</EuiCode> 是一对身份验证，{' '}
          <EuiCode>{'<run_as>'}</EuiCode> 定义应用程序用户的权限是否取决于身份验证上下文 (<EuiCode>{'true'}</EuiCode> / <EuiCode>{'false'}</EuiCode>).
        </EuiText>
      </div>
    );

    const steps = [
      {
        title: '编辑配置',
        children: editConfigChildren
      },
      {
        title: '测试配置',
        children: checkConnectionChildren,
        status: this.state.status
      }
    ];

    const view = (
      <EuiFlexGroup>
        <EuiFlexItem />
        <EuiFlexItem className="min-guide-width">
          <EuiPanel>
            <EuiFlexGroup>
              <EuiFlexItem grow={false}>
                <EuiText>
                  <h2>开始</h2>
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem />
              <EuiFlexItem grow={false}>
                {this.state.enableClose && !this.state.blockClose && (
                  <EuiButtonEmpty
                    size="s"
                    onClick={() => this.props.closeAddApi()}
                    iconType="cross"
                  >
                    关闭
                  </EuiButtonEmpty>
                )}
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer />
            <EuiSteps firstStepNumber={1} steps={steps} />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem />
      </EuiFlexGroup>
    );

    return view;
  }
}

AddApi.propTypes = {
  checkForNewApis: PropTypes.func,
  closeAddApi: PropTypes.func,
  enableClose: PropTypes.bool
};
