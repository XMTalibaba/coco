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

import React, { Fragment } from 'react';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

import {
  EuiButton,
  EuiButtonEmpty,
  EuiFieldText,
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOverlayMask,
  EuiSpacer,
  EuiText,
  EuiCallOut,
} from '@elastic/eui';

interface Props {
  onClone: (
    newTitle: string,
    isTitleDuplicateConfirmed: boolean,
    onTitleDuplicate: () => void
  ) => Promise<void>;
  onClose: () => void;
  title: string;
}

interface State {
  newDashboardName: string;
  isTitleDuplicateConfirmed: boolean;
  hasTitleDuplicate: boolean;
  isLoading: boolean;
}

export class DashboardCloneModal extends React.Component<Props, State> {
  private isMounted = false;

  constructor(props: Props) {
    super(props);

    this.state = {
      newDashboardName: props.title,
      isTitleDuplicateConfirmed: false,
      hasTitleDuplicate: false,
      isLoading: false,
    };
  }
  componentDidMount() {
    this.isMounted = true;
  }

  componentWillUnmount() {
    this.isMounted = false;
  }

  onTitleDuplicate = () => {
    this.setState({
      isTitleDuplicateConfirmed: true,
      hasTitleDuplicate: true,
    });
  };

  cloneDashboard = async () => {
    this.setState({
      isLoading: true,
    });

    await this.props.onClone(
      this.state.newDashboardName,
      this.state.isTitleDuplicateConfirmed,
      this.onTitleDuplicate
    );

    if (this.isMounted) {
      this.setState({
        isLoading: false,
      });
    }
  };

  onInputChange = (event: any) => {
    this.setState({
      newDashboardName: event.target.value,
      isTitleDuplicateConfirmed: false,
      hasTitleDuplicate: false,
    });
  };

  renderDuplicateTitleCallout = () => {
    if (!this.state.hasTitleDuplicate) {
      return;
    }

    return (
      <Fragment>
        <EuiSpacer />
        <EuiCallOut
          size="s"
          title={i18n.translate('dashboard.topNav.cloneModal.dashboardExistsTitle', {
            defaultMessage: '具有标题 {newDashboardName} 的仪表板已存在.',
            values: {
              newDashboardName: `'${this.state.newDashboardName}'`,
            },
          })}
          color="warning"
          data-test-subj="titleDupicateWarnMsg"
        >
          <p>
            <FormattedMessage
              id="dashboard.topNav.cloneModal.dashboardExistsDescription"
              defaultMessage="单击“{confirmClone}”以克隆具有重复标题的仪表板."
              values={{
                confirmClone: (
                  <strong>
                    <FormattedMessage
                      id="dashboard.topNav.cloneModal.confirmCloneDescription"
                      defaultMessage="确认克隆"
                    />
                  </strong>
                ),
              }}
            />
          </p>
        </EuiCallOut>
      </Fragment>
    );
  };

  render() {
    return (
      <EuiOverlayMask>
        <EuiModal
          data-test-subj="dashboardCloneModal"
          className="dshCloneModal"
          onClose={this.props.onClose}
        >
          <EuiModalHeader>
            <EuiModalHeaderTitle>
              <FormattedMessage
                id="dashboard.topNav.cloneModal.cloneDashboardModalHeaderTitle"
                defaultMessage="克隆仪表板"
              />
            </EuiModalHeaderTitle>
          </EuiModalHeader>

          <EuiModalBody>
            <EuiText>
              <p>
                <FormattedMessage
                  id="dashboard.topNav.cloneModal.enterNewNameForDashboardDescription"
                  defaultMessage="请为您的仪表板输入新的名称."
                />
              </p>
            </EuiText>

            <EuiSpacer />

            <EuiFieldText
              autoFocus
              aria-label={i18n.translate('dashboard.cloneModal.cloneDashboardTitleAriaLabel', {
                defaultMessage: '克隆的仪表板标题',
              })}
              data-test-subj="clonedDashboardTitle"
              value={this.state.newDashboardName}
              onChange={this.onInputChange}
              isInvalid={this.state.hasTitleDuplicate}
            />

            {this.renderDuplicateTitleCallout()}
          </EuiModalBody>

          <EuiModalFooter>
            <EuiButtonEmpty data-test-subj="cloneCancelButton" onClick={this.props.onClose}>
              <FormattedMessage
                id="dashboard.topNav.cloneModal.cancelButtonLabel"
                defaultMessage="取消"
              />
            </EuiButtonEmpty>

            <EuiButton
              fill
              data-test-subj="cloneConfirmButton"
              onClick={this.cloneDashboard}
              isLoading={this.state.isLoading}
            >
              <FormattedMessage
                id="dashboard.topNav.cloneModal.confirmButtonLabel"
                defaultMessage="确认克隆"
              />
            </EuiButton>
          </EuiModalFooter>
        </EuiModal>
      </EuiOverlayMask>
    );
  }
}
