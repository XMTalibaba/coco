/*
 * Wazuh app - React component for add sample data
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
import { WzButtonPermissions } from '../../components/common/permissions/button';

import {
  EuiFlexItem,
  EuiCard,
  EuiSpacer,
  EuiFlexGrid,
  EuiFlexGroup,
  EuiButton,
  EuiButtonEmpty,
  EuiTitle,
  EuiToolTip,
  EuiButtonIcon
} from '@elastic/eui';

import { getToasts } from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import { AppState } from '../../react-services/app-state';
import { WAZUH_ROLE_ADMINISTRATOR_NAME } from '../../../common/constants';

export default class WzSampleData extends Component {
  categories: { title: string, description: string, image: string, categorySampleAlertsIndex: string }[]
  generateAlertsParams: any
  state: {
    [name: string]: {
      exists: boolean
      addDataLoading: boolean
      removeDataLoading: boolean
    }
  }
  constructor(props) {
    super(props);
    this.generateAlertsParams = {}; // extra params to add to generateAlerts function in server
    this.categories = [
      {
        title: '安全信息样本',
        description: '有关安全信息（完整性监控，Amazon AWS服务，Google Cloud Platform，授权，ssh，web）的样本数据。',
        image: '',
        categorySampleAlertsIndex: 'security'
      },
      {
        title: '审核和策略监控样本',
        description: '用于审计和策略监视事件（策略监视，系统审计，OpenSCAP，CIS-CAT）的样本数据。',
        image: '',
        categorySampleAlertsIndex: 'auditing-policy-monitoring'
      },
      {
        title: '威胁检测和响应样本',
        description: '用于检测和响应威胁事件（漏洞，VirustTotal，Osquery，Docker侦听器，MITRE）的样本数据。',
        image: '',
        categorySampleAlertsIndex: 'threat-detection'
      }
    ];
    this.state = {};
    this.categories.forEach(category => {
      this.state[category.categorySampleAlertsIndex] = {
        exists: false,
        addDataLoading: false,
        removeDataLoading: false
      }
    });
  }
  async componentDidMount() {
    // Check if sample data for each category was added
    try {
      const results = await PromiseAllRecursiveObject(this.categories.reduce((accum, cur) => {
        accum[cur.categorySampleAlertsIndex] = WzRequest.genericReq('GET', `/elastic/samplealerts/${cur.categorySampleAlertsIndex}`)
        return accum
      }, {}));

      this.setState(Object.keys(results).reduce((accum, cur) => {
        accum[cur] = {
          ...this.state[cur],
          exists: results[cur].data.exists
        }
        return accum
      }, { ...this.state }));
    } catch (error) { }

    // Get information about cluster/manager
    try {
      const clusterName = AppState.getClusterInfo().cluster;
      const managerName = AppState.getClusterInfo().manager;
      this.generateAlertsParams.manager = {
        name: managerName
      };
      if (clusterName && clusterName !== 'Disabled') {
        this.generateAlertsParams.cluster = {
          name: clusterName,
          node: clusterName
        };
      };

    } catch (error) { }
  }
  showToast(color: string, title: string = '', text: string = '', time: number = 3000) {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time,
    });
  };
  async addSampleData(category) {
    try {
      this.setState({
        [category.categorySampleAlertsIndex]: {
          ...this.state[category.categorySampleAlertsIndex],
          addDataLoading: true
        }
      });
      await WzRequest.genericReq('POST', `/elastic/samplealerts/${category.categorySampleAlertsIndex}`, { params: this.generateAlertsParams });
      this.showToast('success', `${category.title} 已安装警报`, '样本数据的日期范围是现在到7天前', 5000);
      this.setState({
        [category.categorySampleAlertsIndex]: {
          ...this.state[category.categorySampleAlertsIndex],
          exists: true,
          addDataLoading: false
        }
      });
    } catch (error) {
      this.showToast('danger', '警告', error.message || error);
      this.setState({
        [category.categorySampleAlertsIndex]: {
          ...this.state[category.categorySampleAlertsIndex],
          addDataLoading: false
        }
      });
    }
  }
  async removeSampleData(category) {
    try {
      this.setState({
        [category.categorySampleAlertsIndex]: {
          ...this.state[category.categorySampleAlertsIndex],
          removeDataLoading: true
        }
      });
      await WzRequest.genericReq('DELETE', `/elastic/samplealerts/${category.categorySampleAlertsIndex}`);
      this.setState({
        [category.categorySampleAlertsIndex]: {
          ...this.state[category.categorySampleAlertsIndex],
          exists: false,
          removeDataLoading: false
        }
      });
      this.showToast('success', `${category.title} 警报已卸载`);
    } catch (error) {
      this.setState({
        [category.categorySampleAlertsIndex]: {
          ...this.state[category.categorySampleAlertsIndex],
          removeDataLoading: false
        }
      });
      this.showToast('danger', '警告', error.message || error);
    }
  }
  renderCard(category) {
    const { addDataLoading, exists, removeDataLoading } = this.state[category.categorySampleAlertsIndex];
    return (
      <EuiFlexItem key={`sample-data-${category.title}`}>
        <EuiCard
          textAlign='left'
          title={category.title}
          description={category.description}
          image={category.image}
          betaBadgeLabel={exists ? 'Installed' : undefined}
          footer={(
            <EuiFlexGroup justifyContent="flexEnd">
              <EuiFlexItem grow={false}>
                {exists && (
                  <WzButtonPermissions
                    color='danger'
                    // roles={[WAZUH_ROLE_ADMINISTRATOR_NAME]}
                    onClick={() => this.removeSampleData(category)}
                  >
                    {removeDataLoading && '正在移除数据' || '移除数据'}
                  </WzButtonPermissions>
                ) || (
                    <WzButtonPermissions
                      isLoading={addDataLoading}
                      // roles={[WAZUH_ROLE_ADMINISTRATOR_NAME]}
                      onClick={() => this.addSampleData(category)}
                    >
                      {addDataLoading && '正在添加数据' || '添加数据'}
                    </WzButtonPermissions>
                  )}
              </EuiFlexItem>
            </EuiFlexGroup>
          )}
        />
      </EuiFlexItem>
    )
  }
  render() {
    return (
      <EuiFlexGrid columns={3}>
        {this.categories.map(category => this.renderCard(category))}
      </EuiFlexGrid>
    )
  }
}

const zipObject = (keys = [], values = []) => {
  return keys.reduce((accumulator, key, index) => {
    accumulator[key] = values[index]
    return accumulator
  }, {})
}

const PromiseAllRecursiveObject = function (obj) {
  const keys = Object.keys(obj);
  return Promise.all(keys.map(key => {
    const value = obj[key];
    // Promise.resolve(value) !== value should work, but !value.then always works
    if (typeof value === 'object' && !value.then) {
      return PromiseAllRecursiveObject(value);
    }
    return value;
  }))
    .then(result => zipObject(keys, result));
};
