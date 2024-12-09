import React, { Component, Fragment } from 'react';
import { EuiPage, EuiPageContent, EuiEmptyPrompt } from '@elastic/eui';

export class ClusterDisabled extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <EuiPage>
        <EuiPageContent horizontalPosition="center">
          <EuiEmptyPrompt
            iconType="iInCircle"
            title={
              <h2>
                {!this.props.enabled
                  ? '集群已禁用'
                  : !this.props.running
                  ? '集群未启动'
                  : ''}
              </h2>
            }
            body={
              <Fragment>
                {!this.props.enabled && (
                  <p>
                    请访问以下文档{' '}
                    <a href="https://documentation.wazuh.com/current/user-manual/configuring-cluster/index.html">
                      这个链接
                    </a>{' '}
                    了解如何启用它。
                  </p>
                )}
                {!this.props.running && (
                  <p>群集已启用，但未运行。</p>
                )}
              </Fragment>
            }
          />
        </EuiPageContent>
      </EuiPage>
    );
  }
}
