/*
 * Wazuh app - React component for showing stats about agents.
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
import { EuiStat, EuiFlexItem, EuiFlexGroup, EuiPage, EuiToolTip } from '@elastic/eui';

export class Stats extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  goToAgents(status) {
    if(status){
      sessionStorage.setItem(
        'agents_preview_selected_options',
        JSON.stringify([{field: 'q', value: `status=${status}`}])
      );
    }else if(sessionStorage.getItem('agents_preview_selected_options')){
      sessionStorage.removeItem('agents_preview_selected_options');
    }
    window.location.href = '#/agents-preview';
  }

  renderTitle(total) {
    return <EuiToolTip position="top" content={`前往所有代理页`}>
      <span>
        {total}
      </span>
    </EuiToolTip>
  }

  render() {
    return (
      <EuiPage>
        <EuiFlexGroup>
          <EuiFlexItem />
          <EuiFlexItem>
            <EuiStat
              title={
                <EuiToolTip position="top" content={`前往所有代理页`}>
                  <span
                    className={ 'statWithLink' }
                    style={{ cursor: "pointer" }}
                    onClick={() => this.goToAgents(null)}
                  >
                    {this.props.total}
                  </span>
                </EuiToolTip>
              }
              description="代理总数"
              titleColor="primary"
              textAlign="center"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiStat
              title={
                <EuiToolTip position="top" content={`前往已连接代理页`}>
                  <span
                    onClick={() => this.goToAgents('active')}
                    className={ 'statWithLink' }
                    style={{ cursor: "pointer" }}
                  >
                    {this.props.active}
                  </span>
                </EuiToolTip>
              }
              description="已连接代理"
              titleColor="secondary"
              textAlign="center"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiStat
              title={
                <EuiToolTip position="top" content={`前往未连接代理页`}>
                  <span
                    onClick={() => this.goToAgents('disconnected')}
                    className={ 'statWithLink' }
                    style={{ cursor: "pointer" }}
                  >
                    {this.props.disconnected}
                  </span>
                </EuiToolTip>
              }
              description="未连接代理"
              titleColor="danger"
              textAlign="center"
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiStat
              title={
                <EuiToolTip position="top" content={`前往从未连接代理页`}>
                  <span
                    onClick={() => this.goToAgents('never_connected')}
                    className={ 'statWithLink' }
                    style={{ cursor: "pointer" }}
                  >
                    {this.props.neverConnected}
                  </span>
                </EuiToolTip>
              }
              description="从未连接的代理"
              titleColor="subdued"
              textAlign="center"
            />
          </EuiFlexItem>
          <EuiFlexItem />
        </EuiFlexGroup>
      </EuiPage>
    );
  }
}

Stats.propTypes = {
  total: PropTypes.any,
  active: PropTypes.any,
  disconnected: PropTypes.any,
  neverConnected: PropTypes.any
};
