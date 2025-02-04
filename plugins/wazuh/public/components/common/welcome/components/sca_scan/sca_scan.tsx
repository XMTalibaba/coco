/*
 * Wazuh app - React component information about last SCA scan.
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

import React, { Component, Fragment } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiTitle,
  EuiText,
  EuiLink,
  EuiBadge,
  EuiStat,
  EuiSpacer,
  EuiLoadingChart,
  EuiButtonIcon,
  EuiToolTip,
  EuiEmptyPrompt,
  EuiIcon
} from '@elastic/eui';
import moment from 'moment-timezone';
import store from '../../../../../redux/store';
import { updateCurrentAgentData } from '../../../../../redux/actions/appStateActions';
import { WzRequest } from '../../../../../react-services';
import { formatUIDate } from '../../../../../react-services/time-service';
import { getAngularModule } from '../../../../../kibana-services';
import { withReduxProvider, withUserAuthorizationPrompt } from "../../../hocs";
import { compose } from 'redux';

export const ScaScan = compose(
  withReduxProvider,
  withUserAuthorizationPrompt([{action: 'agent:read', resource: 'agent:id:*'}, {action: 'sca:read', resource: 'agent:id:*'}])
)(class ScaScan extends Component {
  _isMount = false;
  props!: {
    [key: string]: any
  }
  state: {
    lastScan: {
      [key: string]: any
    },
    isLoading: Boolean,
  }

  constructor(props) {
    super(props);
    this.state = {
      lastScan: {},
      isLoading: true,
    };
  }

  async componentDidMount() {
    this._isMount = true;
    const $injector = getAngularModule().$injector;
    this.router = $injector.get('$route');
    this.getLastScan(this.props.agent.id);
  }

  async getLastScan(agentId: Number) {
    const scans = await WzRequest.apiReq('GET', `/sca/${agentId}?sort=-end_scan`, {params:{ limit: 1} });
    this._isMount &&
      this.setState({
        lastScan: (((scans.data || {}).data || {}).affected_items || {})[0],
        isLoading: false,
      });
  }

  durationScan() {
    const { lastScan }  = this.state;
    const start_scan = moment(lastScan.start_scan);
    const end_scan = moment(lastScan.end_scan);
    let diff = start_scan.diff(end_scan);
    let duration = moment.duration(diff);
    let auxDuration = Math.floor(duration.asHours()) + moment.utc(diff).format(":mm:ss");
    return auxDuration === '0:00:00' ? '< 1s' : auxDuration;
  }

  renderLoadingStatus() {
    const { isLoading } = this.state;
    if (!isLoading) {
      return;
    } else {
      return (
        <EuiFlexGroup justifyContent="center" alignItems="center">
          <EuiFlexItem grow={false}>
            <div style={{ display: 'block', textAlign: "center", paddingTop: 100 }}>
              <EuiLoadingChart size="xl" />
            </div>
          </EuiFlexItem>
        </EuiFlexGroup>
      )
    }
  }

  renderScanDetails() {
    const { isLoading, lastScan } = this.state;
    if (isLoading || lastScan === undefined) return;
    return (
      <Fragment>
        <EuiFlexGroup>
          <EuiFlexItem grow={false}>
            <EuiTitle size="xs">
              <EuiLink onClick={() => {
                  window.location.href = `#/overview?tab=sca&redirectPolicy=${lastScan.policy_id}`;
                  store.dispatch(updateCurrentAgentData(this.props.agent));
                  this.router.reload();
                }
              }>
                <h4>{lastScan.name}</h4>
              </EuiLink>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ marginTop: 12 }}>
            <EuiBadge color="secondary">{lastScan.policy_id}</EuiBadge>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText size={'s'}>
              <p>{lastScan.description}</p>
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="l" />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiStat
              title={lastScan.pass}
              titleSize="m"
              textAlign="center"
              description="通过"
              titleColor="secondary"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiStat
              title={lastScan.fail}
              titleSize="m"
              textAlign="center"
              description="失败"
              titleColor="danger"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiStat
              title={lastScan.total_checks}
              titleSize="m"
              textAlign="center"
              description="检查总数"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiStat
              title={`${lastScan.score}%`}
              titleSize="m"
              textAlign="center"
              description="得分"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size={'l'}/>
        <EuiFlexGroup>
          <EuiFlexItem grow={false} style={{ marginTop: 15 }}>
            <EuiText>
              <EuiIcon type="calendar" color={'primary'}/> 开始时间: {formatUIDate(lastScan.start_scan)}
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ marginTop: 15 }}>
            <EuiText>
              <EuiIcon type="clock" color={'primary'}/> 耗时: {this.durationScan()}
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    )
  }


  renderEmptyPrompt() {
    const { isLoading } = this.state;
    if (isLoading) return;
    return (
      <Fragment>
        <EuiEmptyPrompt
          iconType="visVega"
          title={<h4>您在此代理中没有基线检测的扫描。</h4>}
          body={
            <Fragment>
              <p>
                检查您的代理设置以生成扫描。
              </p>
            </Fragment>
          }
        />
      </Fragment>
    )
  }

  render() {
    const { lastScan } = this.state;
    const loading = this.renderLoadingStatus();
    const scaScan = this.renderScanDetails();
    const emptyPrompt = this.renderEmptyPrompt();
    return (
      <EuiFlexItem>
        <EuiPanel paddingSize="m">
          <EuiText size="xs">
            <EuiFlexGroup>
              <EuiFlexItem>
                <h2>基线检测:最后扫描</h2>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiToolTip position="top" content="打开基线检测扫描">
                  <EuiButtonIcon
                    iconType="popout"
                    color="primary"
                    onClick={() => {
                      window.location.href = `#/overview?tab=sca`;
                      store.dispatch(updateCurrentAgentData(this.props.agent));
                      this.router.reload();
                    }
                    }
                    aria-label="打开基线检测扫描" />
                </EuiToolTip>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiText>
          {lastScan === undefined && emptyPrompt}
          {loading}
          {scaScan}
        </EuiPanel>
      </EuiFlexItem>
    )
  }
});
