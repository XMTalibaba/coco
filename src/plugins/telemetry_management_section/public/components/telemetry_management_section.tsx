/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React, { Component, Fragment } from 'react';
import {
  EuiCallOut,
  EuiPanel,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';

import { FormattedMessage } from '@kbn/i18n/react';
import { i18n } from '@kbn/i18n';
import { TelemetryPluginSetup } from 'src/plugins/telemetry/public';
import { PRIVACY_STATEMENT_URL } from '../../../telemetry/common/constants';
import { OptInExampleFlyout } from './opt_in_example_flyout';
import { OptInSecurityExampleFlyout } from './opt_in_security_example_flyout';
import { LazyField } from '../../../advanced_settings/public';
import { ToastsStart } from '../../../../core/public';

type TelemetryService = TelemetryPluginSetup['telemetryService'];

const SEARCH_TERMS = ['telemetry', 'usage', 'data', 'usage data'];

interface Props {
  telemetryService: TelemetryService;
  onQueryMatchChange: (searchTermMatches: boolean) => void;
  isSecurityExampleEnabled: () => boolean;
  showAppliesSettingMessage: boolean;
  enableSaving: boolean;
  query?: any;
  toasts: ToastsStart;
}

interface State {
  processing: boolean;
  showExample: boolean;
  showSecurityExample: boolean;
  queryMatches: boolean | null;
  enabled: boolean;
}

export class TelemetryManagementSection extends Component<Props, State> {
  state: State = {
    processing: false,
    showExample: false,
    showSecurityExample: false,
    queryMatches: null,
    enabled: this.props.telemetryService.getIsOptedIn() || false,
  };

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    const { query } = nextProps;

    const searchTerm = (query.text || '').toLowerCase();
    const searchTermMatches =
      this.props.telemetryService.getCanChangeOptInStatus() &&
      SEARCH_TERMS.some((term) => term.indexOf(searchTerm) >= 0);

    if (searchTermMatches !== this.state.queryMatches) {
      this.setState(
        {
          queryMatches: searchTermMatches,
        },
        () => {
          this.props.onQueryMatchChange(searchTermMatches);
        }
      );
    }
  }

  render() {
    const { telemetryService, isSecurityExampleEnabled } = this.props;
    const { showExample, showSecurityExample, queryMatches, enabled, processing } = this.state;
    const securityExampleEnabled = isSecurityExampleEnabled();

    if (!telemetryService.getCanChangeOptInStatus()) {
      return null;
    }

    if (queryMatches !== null && !queryMatches) {
      return null;
    }

    return (
      <Fragment>
        {showExample && (
          <OptInExampleFlyout
            fetchExample={telemetryService.fetchExample}
            onClose={this.toggleExample}
          />
        )}
        {showSecurityExample && securityExampleEnabled && (
          <OptInSecurityExampleFlyout onClose={this.toggleSecurityExample} />
        )}
        <EuiPanel paddingSize="l">
          <EuiForm>
            <EuiText>
              <EuiFlexGroup alignItems="baseline">
                <EuiFlexItem grow={false}>
                  <h2>
                    <FormattedMessage id="telemetry.usageDataTitle" defaultMessage="Usage Data" />
                  </h2>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiText>

            {this.maybeGetAppliesSettingMessage()}
            <EuiSpacer size="s" />
            <LazyField
              setting={
                {
                  type: 'boolean',
                  name: 'telemetry:enabled',
                  displayName: i18n.translate('telemetry.provideUsageStatisticsTitle', {
                    defaultMessage: 'Provide usage statistics',
                  }),
                  value: enabled,
                  description: this.renderDescription(),
                  defVal: true,
                  ariaName: i18n.translate('telemetry.provideUsageStatisticsAriaName', {
                    defaultMessage: 'Provide usage statistics',
                  }),
                } as any
              }
              loading={processing}
              dockLinks={null as any}
              toasts={null as any}
              handleChange={this.toggleOptIn}
              enableSaving={this.props.enableSaving}
            />
          </EuiForm>
        </EuiPanel>
      </Fragment>
    );
  }

  maybeGetAppliesSettingMessage = () => {
    if (!this.props.showAppliesSettingMessage) {
      return null;
    }
    return (
      <EuiCallOut
        color="primary"
        iconType="spacesApp"
        title={
          <p>
            <FormattedMessage
              id="telemetry.callout.appliesSettingTitle"
              defaultMessage="对此设置的更改将应用到{allOfKibanaText} 且会自动保存。"
              values={{
                allOfKibanaText: (
                  <strong>
                    <FormattedMessage
                      id="telemetry.callout.appliesSettingTitle.allOfKibanaText"
                      defaultMessage="所有"
                    />
                  </strong>
                ),
              }}
            />
          </p>
        }
      />
    );
  };

  renderDescription = () => {
    const { isSecurityExampleEnabled } = this.props;
    const securityExampleEnabled = isSecurityExampleEnabled();
    const clusterDataLink = (
      <EuiLink onClick={this.toggleExample} data-test-id="cluster_data_example">
        <FormattedMessage id="telemetry.clusterData" defaultMessage="集群设置" />
      </EuiLink>
    );

    const endpointSecurityDataLink = (
      <EuiLink onClick={this.toggleSecurityExample} data-test-id="endpoint_security_example">
        <FormattedMessage id="telemetry.securityData" defaultMessage="endpoint security 数据" />
      </EuiLink>
    );

    return (
      <Fragment>
        <p>
          <FormattedMessage
            id="telemetry.telemetryConfigAndLinkDescription"
            defaultMessage="启用使用情况数据收集可帮助我们管理并改善产品和服务。有关更多详情，请参阅我们的{privacyStatementLink}。"
            values={{
              privacyStatementLink: (
                <EuiLink href={PRIVACY_STATEMENT_URL} target="_blank">
                  <FormattedMessage
                    id="telemetry.readOurUsageDataPrivacyStatementLinkText"
                    defaultMessage="隐私说明"
                  />
                </EuiLink>
              ),
            }}
          />
        </p>
        <p>
          {securityExampleEnabled ? (
            <FormattedMessage
              id="telemetry.seeExampleOfClusterDataAndEndpointSecuity"
              defaultMessage="See examples of the {clusterData} and {endpointSecurityData} that we collect."
              values={{
                clusterData: clusterDataLink,
                endpointSecurityData: endpointSecurityDataLink,
              }}
            />
          ) : (
            <FormattedMessage
              id="telemetry.seeExampleOfClusterData"
              defaultMessage="See an example of the {clusterData} that we collect."
              values={{
                clusterData: clusterDataLink,
              }}
            />
          )}
        </p>
      </Fragment>
    );
  };

  toggleOptIn = async (): Promise<boolean> => {
    const { telemetryService, toasts } = this.props;
    const newOptInValue = !this.state.enabled;

    return new Promise((resolve, reject) => {
      this.setState(
        {
          processing: true,
          enabled: newOptInValue,
        },
        async () => {
          try {
            await telemetryService.setOptIn(newOptInValue);
            this.setState({ processing: false });
            toasts.addSuccess(
              newOptInValue
                ? i18n.translate('telemetry.optInSuccessOn', {
                    defaultMessage: '使用情况数据收集已打开.',
                  })
                : i18n.translate('telemetry.optInSuccessOff', {
                    defaultMessage: '使用情况数据收集已关闭，， .',
                  })
            );
            resolve(true);
          } catch (err) {
            this.setState({ processing: false });
            reject(err);
          }
        }
      );
    });
  };

  toggleExample = () => {
    this.setState({
      showExample: !this.state.showExample,
    });
  };

  toggleSecurityExample = () => {
    const { isSecurityExampleEnabled } = this.props;
    const securityExampleEnabled = isSecurityExampleEnabled();
    if (!securityExampleEnabled) return;
    this.setState({
      showSecurityExample: !this.state.showSecurityExample,
    });
  };
}

// required for lazy loading
// eslint-disable-next-line import/no-default-export
export default TelemetryManagementSection;
