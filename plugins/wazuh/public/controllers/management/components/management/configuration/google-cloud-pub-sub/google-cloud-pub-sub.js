

import React, { Component, Fragment } from 'react';

import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import WzNoConfig from '../util-components/no-config';

import withWzConfig from '../util-hocs/wz-config';

import { wodleBuilder } from '../utils/builders';

import {
  renderValueYesThenEnabled,
  isString
} from '../utils/utils';

const helpLinks = [
  {
    text: '使用应用程序监控谷歌云发布/订阅',
    href: 'https://documentation.wazuh.com/current/gcp/index.html'
  },
  {
    text: '谷歌云发布/订阅模块参考',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/gcp-pubsub.html'
  }
];

const mainSettings = [
  {
    field: 'enabled',
    label: '谷歌云发布/订阅集成状态',
    render: renderValueYesThenEnabled
  },
  { field: 'project_id', label: '项目ID' },
  { field: 'subscription_name', label: '要读取的订阅' },
  {
    field: 'credentials_file',
    label: '凭证文件的路径'
  },
  { field: 'logging', label: '日志级别' },
  { field: 'max_messages', label: '每次迭代中提取的最大消息数' },
  { field: 'interval', label: '模块执行之间的间隔（以秒为单位）' },
  { field: 'pull_on_start', label: '拉取开始' },
  { field: 'day', label: '每个月的哪天取日志' },
  { field: 'wday', label: '每周的哪天取日志' },
  { field: 'time', label: '每天的哪个时间取日志' },
];

class WzConfigurationGoogleCloudPubSub extends Component{
  constructor(props) {
    super(props);
    this.wodleConfig = wodleBuilder(this.props.currentConfig, 'gcp-pubsub');
  }
  componentDidMount() {
    this.props.updateBadge(this.badgeEnabled());
  }
  badgeEnabled() {
    return (
      this.wodleConfig &&
      this.wodleConfig['gcp-pubsub'] &&
      this.wodleConfig['gcp-pubsub'].enabled === 'yes'
    );
  }
  render(){
    const { currentConfig } = this.props;
    return (
      <Fragment>
        {currentConfig['wmodules-wmodules'] &&
          isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig
              error={currentConfig['wmodules-wmodules']}
              help={helpLinks}
            />
          )}
        {currentConfig &&
          !this.wodleConfig['gcp-pubsub'] && 
          !isString(currentConfig['wmodules-wmodules']) && (
            <WzNoConfig error="not-present" help={helpLinks} />
        )}
        {currentConfig && this.wodleConfig['gcp-pubsub'] && (
          <WzConfigurationSettingsTabSelector
            title="主要设置"
            description="谷歌云发布/订阅模块的配置"
            currentConfig={this.wodleConfig}
            minusHeight={320}
            helpLinks={helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={this.wodleConfig['gcp-pubsub']}
              items={mainSettings}
            />
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    )
  }
}

const sections = [{ component: 'wmodules', configuration: 'wmodules' }];

export default withWzConfig(sections)(WzConfigurationGoogleCloudPubSub);