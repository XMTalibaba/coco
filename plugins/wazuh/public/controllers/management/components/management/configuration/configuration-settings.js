/*
 * Wazuh app - Definitions of configuration sections.
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

import { hasAgentSupportModule } from '../../../../../react-services/wz-agents';
import { WAZUH_MODULES_ID } from '../../../../../../common/constants'

export default [
  {
    title: '主要配置',
    description: '',
    settings: [
      {
        name: '全局配置',
        description: '全局和远程配置',
        goto: 'global-configuration',
        when: 'manager'
      },
      {
        name: '集群',
        description: '主节点配置',
        goto: 'cluster',
        when: 'manager'
      },
      {
        name: '注册服务',
        description: '自动代理注册服务',
        goto: 'registration-service',
        when: 'manager'
      },
      {
        name: '全局配置',
        description: '记录适用于代理的设置',
        goto: 'global-configuration-agent',
        when: 'agent'
      },
      {
        name: '通信',
        description: '与管理器连接相关的设置',
        goto: 'client',
        when: 'agent'
      },
      {
        name: '防溢出设置',
        description: '代理存储桶参数，以避免事件溢出',
        goto: 'client-buffer',
        when: 'agent'
      },
      {
        name: '标签',
        description:
          '警报中包含的有关代理的用户定义信息',
        goto: 'alerts-agent',
        when: 'agent'
      }
      // ,
      // { //TODO: Uncomment this to activate Log Settings
      //   name: 'Log settings',
      //   description: 'Alerts, archives and internal settings',
      //   goto: 'log-settings'
      // }
    ]
  },
  {
    title: '警报和输出管理',
    description: '',
    settings: [
      {
        name: '警报',
        description: '与警报及其格式有关的设置',
        goto: 'alerts',
        when: 'manager'
      },
      {
        name: '集成',
        description:
          '与外部API的Slack，VirusTotal和PagerDuty集成',
        goto: 'integrations',
        when: 'manager'
      }
    ]
  },
  {
    title: '审计与策略监控',
    description: '',
    settings: [
      {
        name: '策略监控',
        description:
          '配置以确保符合安全策略，标准和强化指南',
        goto: 'policy-monitoring'
      },
      {
        name: 'OpenSCAP',
        description:
          '使用SCAP检查进行配置评估和合规性监控自动化',
        goto: 'open-scap',
        when: agent => hasAgentSupportModule(agent, WAZUH_MODULES_ID.OPEN_SCAP)
      },
      {
        name: 'CIS-CAT',
        description:
          '使用CIS扫描仪和SCAP检查进行配置评估',
        goto: 'cis-cat'
      }
    ]
  },
  {
    title: '系统威胁和事件响应',
    description: '',
    settings: [
      {
        name: '漏洞',
        description:
          '发现哪些应用程序受到众所周知的漏洞的影响',
        goto: 'vulnerabilities',
        when: 'manager'
      },
      {
        name: 'Osquery',
        description:
          '将操作系统公开为高性能的关系数据库',
        goto: 'osquery'
      },
      {
        name: '详细信息',
        description:
          '收集有关系统OS，硬件，网络和软件包的相关信息',
        goto: 'inventory'
      },
      {
        name: '主动回应',
        description: '通过即时响应主动解决威胁',
        goto: 'active-response',
        when: 'manager'
      },
      {
        name: '主动回应',
        description: '通过即时响应主动解决威胁',
        goto: 'active-response-agent',
        when: 'agent'
      },
      {
        name: '命令',
        description: '命令的配置选项',
        goto: 'commands'
      },
      {
        name: 'Docker 监听',
        description:
          '从Docker容器监视和收集活动，例如创建、运行、启动、停止或暂停事件',
        goto: 'docker-listener',
        when: agent => hasAgentSupportModule(agent, WAZUH_MODULES_ID.DOCKER)
      }
    ]
  },
  {
    title: '日志数据分析',
    description: '',
    settings: [
      {
        name: '日志收集',
        description:
          '从文本文件，Windows事件或系统日志输出进行日志分析',
        goto: 'log-collection'
      },
      {
        name: '完整性监控',
        description:
          '识别文件内容，权限，所有权和属性的更改',
        goto: 'integrity-monitoring'
      },
      {
        name: '无代理',
        description:
          '在路由器，防火墙和交换机等设备上运行完整性检查',
        goto: 'agentless',
        when: 'manager'
      }
    ]
  },
  {
    title: '云安全监控',
    description: '',
    settings: [
      {
        name: 'Amazon S3',
        description:
          '通过AWS API直接收集的与Amazon AWS服务相关的安全事件',
        goto: 'aws-s3'
      },
      {
        name: 'Azure 日志',
        description: 'Azure日志的配置选项',
        goto: 'azure-logs',
        when: 'manager'
      },
      {
        name: '谷歌云发布/订阅',
        description: '谷歌云发布/订阅模块的配置选项',
        goto: 'gcp-pubsub'
      }
    ]
  }
];
