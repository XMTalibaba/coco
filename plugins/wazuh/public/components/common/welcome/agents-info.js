/*
 * Wazuh app - React component for showing agent fields such as IP, ID, name,
 * version, OS, registration date, last keep alive.
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
  EuiStat,
  EuiFlexItem,
  EuiFlexGroup,
  EuiBadge
} from '@elastic/eui';
import { WzRequest } from '../../../react-services/wz-request';
import { formatUIDate } from '../../../react-services/time-service';

import WzTextWithTooltipIfTruncated from '../wz-text-with-tooltip-if-truncated';
import { WzStat } from '../../wz-stat';
import { GroupTruncate } from '../util/agent-group-truncate'

export class AgentInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  async componentDidMount() {
    const managerVersion = await WzRequest.apiReq('GET', '//', {});

    this.setState({
      managerVersion: (((managerVersion || {}).data || {}).data || {}).api_version || {}
    });
  }

  getPlatformIcon(agent) {
    let icon = false;
    const os = (agent || {}).os;

    if (((os || {}).uname || '').includes('Linux')) {
      icon = 'linux';
    } else if ((os || {}).platform === 'windows') {
      icon = 'windows';
    } else if ((os || {}).platform === 'darwin') {
      icon = 'apple';
    }

    return <i
      className={`fa fa-${icon} AgentsTable__soBadge AgentsTable__soBadge--${icon}`}
      aria-hidden="true"
    ></i>
  }


  addTextPlatformRender(agent) {
    const checkField = field => {
      return field !== undefined ? field : '-';
    };

    const os_name =
      checkField(((agent || {}).os || {}).name) +
      ' ' +
      checkField(((agent || {}).os || {}).version);

    const osName = os_name === '- -' ? '-' : os_name;

    return (
      <WzTextWithTooltipIfTruncated position='bottom' elementStyle={{ maxWidth: "250px", fontSize: 12 }}>
        {this.getPlatformIcon(this.props.agent)}
        {' '}{osName}
      </WzTextWithTooltipIfTruncated>
    )
  }


  color = (status, hex = false) => {
    if (status.toLowerCase() === 'active') { return hex ? '#017D73' : 'success'; }
    else if (status.toLowerCase() === 'disconnected') { return hex ? '#BD271E' : 'danger'; }
    else if (status.toLowerCase() === 'never connected') { return hex ? '#98A2B3' : 'subdued'; }
  }

  addHealthRender(agent) {
    // this was rendered with a EuiHealth, but EuiHealth has a div wrapper, and this section is rendered  within a <p> tag. <div> tags aren't allowed within <p> tags.
    const statusText = {
      never_connected: '从未连接',
      disconnected: '未连接',
      active: '已连接',
      pending: '挂起'
    }
    return (
      <span className="euiFlexGroup euiFlexGroup--gutterExtraSmall euiFlexGroup--alignItemsCenter euiFlexGroup--directionRow" style={{ fontSize: '12px' }}>
        <span className="euiFlexItem euiFlexItem--flexGrowZero">
          <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className={`euiIcon euiIcon--medium euiIcon--${this.color(this.props.agent.status)}`} focusable="false" role="img" aria-hidden="true">
            <circle cx="8" cy="8" r="4"></circle>
          </svg>
        </span>
        <span className="euiFlexItem euiFlexItem--flexGrowZero">{statusText[this.props.agent.status] ? statusText[this.props.agent.status] : this.props.agent.status}</span>
      </span>
    )
  }

  addGroupsRender(agent) {
    // this was rendered with a EuiHealth, but EuiHealth has a div wrapper, and this section is rendered  within a <p> tag. <div> tags aren't allowed within <p> tags.
    return (
      <span>
        {
          agent.group.map((group, key) => (
            <EuiBadge
              color={'hollow'}
              key={`agent-group-${key}`}
              onClickAriaLabel={`agent-group-${group}`}
              onClick={() => this.props.goGroups(this.props.agent, key)}>
              {group}
            </EuiBadge>
          ))
        }
      </span>
    )
  }

  buildStats(items) {
    const checkField = field => {
      return field !== undefined || field ? field : '-';
    };
    const stats = items.map(item => {
      return (
        <EuiFlexItem key={item.description} style={item.style || null}>
          <WzStat
            title={
              item.description === '组' ? (
                <GroupTruncate
                  agent={this.props.agent}
                  groups={this.props.agent.group}
                  length={40}
                  label={'more'}
                  action={'redirect'}
                  {...this.props}/>
              ) : item.description === '操作系统' ? (
                this.addTextPlatformRender(this.props.agent)
              ) : item.description === '状态' ? (
                this.addHealthRender(this.props.agent)
              ) : (
                <WzTextWithTooltipIfTruncated position='bottom' elementStyle={{ maxWidth: "250px", fontSize: 12 }}>
                  {checkField(item.title)}
                </WzTextWithTooltipIfTruncated>
              )
            }
            description={item.description}
            titleSize="xs"
          />
        </EuiFlexItem>
      );
    });
    return stats;
  }

  render() {
    const { agent } = this.props;
    let arrayStats;

    if (this.props.isCondensed) {
      arrayStats = [
        { title: agent.id, description: 'ID', style: { maxWidth: 100 } },
        { title: agent.status, description: '状态', style: { maxWidth: 150 } },
        // { title: agent.version, description: '版本', style: { maxWidth: 150 } },
        {
          title: agent.name,
          description: '主机名',
          style: { minWidth: 200, maxWidth: 200 }
        }
      ];
    } else {
      arrayStats = [
        { 
          title: agent.id, 
          description: 'ID', 
          // style: { maxWidth: 100 } 
        },
        { 
          title: agent.ip, 
          description: 'IP', 
          // style: { maxWidth: 150 } 
        },
        // { title: agent.name, description: '主机名' },
        { title: agent.group, description: '组' },
        // { title: agent.tag, description: '标签' },
        { title: agent.os_name, description: '操作系统' },
        // {
        //   title: agent.node_name && agent.node_name !== 'unknown' ? agent.node_name : '-',
        //   description: '集群节点',
        //   style: { maxWidth: 150 }
        // },
        // { title: agent.version, description: '版本', style: { maxWidth: 150 } },
        {
          title: formatUIDate(agent.dateAdd),
          description: '注册日期',
          // style: { maxWidth: 250 } 
        },
        {
          title: formatUIDate(agent.lastKeepAlive),
          description: '上次连接',
          // style: { maxWidth: 250 }
        },
        { 
          title: agent.status, 
          description: '状态', 
          // style: { maxWidth: 150 } 
        },
      ];
    }

    const stats = this.buildStats(arrayStats);

    return (
      <Fragment>
        <EuiFlexGroup className="wz-welcome-page-agent-info-details">
          {stats}
        </EuiFlexGroup>
      </Fragment>
    );
  }
}
