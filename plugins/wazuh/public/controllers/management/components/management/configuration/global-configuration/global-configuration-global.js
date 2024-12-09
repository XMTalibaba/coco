/*
 * Wazuh app - React component for show configuration of global configuration - global tab.
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
import PropTypes from 'prop-types';

import WzConfigurationSettingsGroup from '../util-components/configuration-settings-group';
import WzConfigurationSettingsTabSelector from '../util-components/configuration-settings-tab-selector';
import WzNoConfig from '../util-components/no-config';

import { isString } from '../utils/utils';

const helpLinks = [
  {
    text: '全局引用',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/global.html'
  },
  {
    text: '日志引用',
    href:
      'https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/logging.html'
  }
];

const mainSettings = [
  { field: 'alerts_log', label: '将警报写入alerts.log文件' },
  {
    field: 'jsonout_output',
    label: '将JSON格式的警报写入警报json文件'
  },
  { field: 'logall', label: '以纯文本格式存档所有警报' },
  { field: 'logall_json', label: '以JSON格式存档所有警报' },
  {
    field: 'custom_alert_output',
    label: 'alerts.log文件的自定义警报格式'
  },
  { field: 'plain', label: '以明文形式写入内部日志' },
  { field: 'json', label: '以JSON格式写入内部日志' },
  { field: 'max_output_size', label: '警报文件大小限制' },
  { field: 'rotate_interval', label: '文件转换时间间隔' }
];

const emailSettings = [
  { field: 'email_notification', label: '启用通过电子邮件发送的警报' },
  { field: 'email_from', label: '电子邮件提醒的发件人地址' },
  { field: 'email_to', label: '电子邮件通知的收件人地址' },
  { field: 'email_reply_to', label: '电子邮件提醒的回复地址' },
  { field: 'smtp_server', label: 'SMTP邮件服务器地址' },
  {
    field: 'email_maxperhour',
    label: '每小时发送的电子邮件提醒的最大数量'
  },
  { field: 'email_log_source', label: '要从中读取数据的文件' },
  { field: 'email_idsname', label: '用于电子邮件提醒标题的名称' }
];

const otherSettings = [
  {
    field: 'stats',
    label: '统计分析生成警报的严重级别'
  },
  {
    field: 'host_information',
    label: '主机更改监视器生成警报的严重级别'
  },
  {
    field: 'memory_size',
    label: '警报关联引擎的内存大小'
  },
  { field: 'white_list', label: '列入“白名单”的IP地址' },
  {
    field: 'geoip_db_path',
    label: 'MaxMind GeoIP IPv4数据库文件的完整路径'
  }
];

const preludeZeroMQOutputSettings = [
  { field: 'prelude_output', label: '允许prelude输出' },
  { field: 'zeromq_output', label: '允许ZeroMQ输出' },
  { field: 'zeromq_uri', label: 'ZeroMQ URI绑定发布者socket' }
];

const buildHelpLinks = agent =>
  agent.id === '000' ? helpLinks : [helpLinks[1]];

class WzConfigurationGlobalConfigurationGlobal extends Component {
  constructor(props) {
    super(props);
    this.helpLinks = buildHelpLinks(this.props.agent);
  }
  render() {
    const { currentConfig, agent, wazuhNotReadyYet } = this.props;
    const mainSettingsConfig =
      agent.id === '000' &&
      currentConfig['analysis-global'] &&
      currentConfig['analysis-global'].global &&
      currentConfig['analysis-global'].logging
        ? {
            ...currentConfig['analysis-global'].global,
            plain: currentConfig['com-logging'].logging.plain,
            json: currentConfig['com-logging'].logging.json
          }
        : currentConfig['com-logging'] && currentConfig['com-logging'].logging
        ? {
            plain: currentConfig['com-logging'].logging.plain,
            json: currentConfig['com-logging'].logging.json
          }
        : {};
    const globalSettingsConfig =
      agent.id === '000' &&
      currentConfig['analysis-global'] &&
      currentConfig['analysis-global'].global
        ? {
            ...currentConfig['analysis-global'].global
          }
        : {};
    return (
      <Fragment>
        {currentConfig['analysis-global'] &&
          isString(currentConfig['analysis-global']) && (
            <WzNoConfig
              error={currentConfig['analysis-global']}
              help={this.helpLinks}
            />
          )}
        {agent &&
          agent.id !== '000' &&
          currentConfig['com-logging'] &&
          isString(currentConfig['com-logging']) && (
            <WzNoConfig
              error={currentConfig['com-global']}
              help={this.helpLinks}
            />
          )}
        {currentConfig['analysis-global'] &&
          !isString(currentConfig['analysis-global']) &&
          !currentConfig['analysis-global'].global && (
            <WzNoConfig error="not-present" help={this.helpLinks} />
          )}
        {wazuhNotReadyYet &&
          (!currentConfig || !currentConfig['analysis-global']) && (
            <WzNoConfig error="应用程序还没准备好" help={this.helpLinks} />
          )}
        {((currentConfig['analysis-global'] &&
          currentConfig['analysis-global'].global) ||
          (currentConfig['com-logging'] &&
            currentConfig['com-logging'].logging)) && (
          <WzConfigurationSettingsTabSelector
            title="主要设置"
            description="基本的警报和日志设置"
            currentConfig={currentConfig}
            minusHeight={agent.id === '000' ? 320 : 355}
            helpLinks={this.helpLinks}
          >
            <WzConfigurationSettingsGroup
              config={mainSettingsConfig}
              items={mainSettings}
            />
            {agent.id === '000' && (
              <Fragment>
                <WzConfigurationSettingsGroup
                  title="邮件设置"
                  description="基本邮件设置"
                  config={globalSettingsConfig}
                  items={emailSettings}
                />
                <WzConfigurationSettingsGroup
                  title="其他设置"
                  description="与任何特定组件不直接相关的设置"
                  config={globalSettingsConfig}
                  items={otherSettings}
                />
                <WzConfigurationSettingsGroup
                  title="Prelude和ZeroMQ输出"
                  config={globalSettingsConfig}
                  items={preludeZeroMQOutputSettings}
                />
              </Fragment>
            )}
          </WzConfigurationSettingsTabSelector>
        )}
      </Fragment>
    );
  }
}

WzConfigurationGlobalConfigurationGlobal.propTypes = {
  // currentConfig: PropTypes.object.isRequired,
  agent: PropTypes.object,
  wazuhNotReadyYet: PropTypes.oneOfType([PropTypes.bool, PropTypes.string])
};

export default WzConfigurationGlobalConfigurationGlobal;
