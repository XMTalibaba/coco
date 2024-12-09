"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WAZUH_MODULES = void 0;

/*
 * Wazuh app - Simple description for each App tabs
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
const WAZUH_MODULES = {
  // general: {
  //   title: '安全事件',
  //   description: '浏览安全警报，识别环境中的问题和威胁。'
  // },
  general: {
    title: '安全告警',
    description: '浏览安全警报，识别环境中的问题和威胁。',
    parentBreadcrumbArr: ['首页']
  },
  fim: {
    title: '关键文件',
    description: '与文件更改相关的警报，包括权限、内容、所有权和属性。',
    parentBreadcrumbArr: ['风险检测'],
  },
  pm: {
    title: '策略监控',
    description: '验证您的系统是否根据您的安全策略基线进行了配置。',
  },
  vuls: {
    title: '漏洞检测',
    description: '了解您的环境中哪些应用程序受到众所周知的漏洞的影响。',
    parentBreadcrumbArr: ['风险检测'],
  },
  oscap: {
    title: 'OpenSCAP',
    description: '使用SCAP检查进行配置评估和法规遵循监控的自动化。'
  },
  audit: {
    title: '系统审计',
    description: '审计用户行为，监控命令执行，并对关键文件的访问进行警告。'
  },
  pci: {
    title: 'PCI DSS',
    description: '用于处理、存储或传输支付卡持有人数据的实体的全球安全标准。'
  },
  gdpr: {
    title: 'GDPR',
    description: '《一般资料保障规例》为个人资料的处理订定指引。'
  },
  hipaa: {
    title: 'HIPAA',
    description: '1996年《健康保险便携和责任法案》(HIPAA)为保护医疗信息提供了数据隐私和安全条款。'
  },
  nist: {
    title: 'NIST 800-53',
    description: '美国国家标准和技术协会特别出版物800-53 (NIST 800-53)为联邦信息系统制定了指导方针。'
  },
  tsc: {
    title: 'TSC',
    description: '安全、可用性、处理完整性、机密性和隐私的信任服务标准。'
  },
  ciscat: {
    title: 'CIS-CAT',
    description: '使用Internet安全中心扫描仪和SCAP检查进行配置评估。'
  },
  aws: {
    title: 'Amazon AWS',
    description: '与您的Amazon AWS服务相关的安全事件，直接通过AWS API收集。'
  },
  gcp: {
    title: '谷歌云平台',
    description: '与谷歌云平台服务相关的安全事件，直接通过GCP API收集。' // TODO GCP

  },
  virustotal: {
    title: 'VirusTotal',
    description: '通过与它们的API集成，VirusTotal分析可疑文件所产生的警报。'
  },
  mitre: {
    title: '网络检测',
    description: '基于真实世界观察的对手战术和技术知识库中的安全事件。',
    parentBreadcrumbArr: ['风险检测'],
  },
  syscollector: {
    title: '详细信息',
    description: '在被监视的系统上运行的应用程序、网络配置、开放端口和进程。'
  },
  configuration: {
    title: '配置',
    description: '检查当前由其组远程应用的代理配置。'
  },
  osquery: {
    title: 'Osquery',
    description: '可以使用Osquery将操作系统公开为高性能关系数据库。'
  },
  sca: {
    title: '基线检测',
    description: '扫描您的资产，作为配置评估审计的一部分。',
    parentBreadcrumbArr: ['风险检测'],
  },
  docker: {
    title: 'Docker监听',
    description: '从Docker容器监视和收集活动，如创建、运行、启动、停止或暂停事件。'
  },
  devTools: {
    title: 'API console',
    description: '测试API端点。'
  },
  logtest: {
    title: '测试您的日志',
    description: '检查规则集测试日志。'
  },
  testConfiguration: {
    title: '测试您的配置',
    description: '应用前请检查配置'
  },

  planTasks: {
    title: '计划任务',
    description: '配置计划任务，主动触发检测扫描'
  },
  blackWhitelist: {
    title: '安全防护策略',
    description: '查看安全防护策略'
  },
  adminLoginlog: {
    title: '管理员登录日志',
    description: '查看管理员登录日志'
  },
  adminOperationlog: {
    title: '管理员操作日志',
    description: '查看管理员操作日志'
  },
  systemParam: {
    title: '参数配置',
    description: '进行系统相关参数配置'
  },
  systemRunLogs: {
    title: '系统运行日志',
    description: '查看系统运行日志'
  },
  importantNotice: {
    title: '运行状态',
    description: '查看运行状态'
  },
  licenseManage: {
    title: '授权管理',
    description: '查看授权管理'
  },
  agentLog: {
    title: '代理日志',
    description: '查看代理近30天日志'
  },
  microStrategy: {
    title: '微隔离策略',
    description: '配置微隔离策略'
  },
  softwareApp: {
    title: '软件应用',
    description: '可按主机和软件两个维度统计软件应用'
  },
  systemAccount: {
    title: '系统账号',
    description: '可按主机和账号两个维度统计系统账号'
  },
  policyManage: {
    title: '代理策略管理',
    description: '进行代理策略管理'
  },
  workbench: {
    title: '控制台',
    description: '查看系统安全概览'
  },
  manageTool: {
    title: '态势分析',
    description: '态势分析概览'
  },

  agentsPreview: {
    title: '主机管理',
    description: '查看主机管理'
  },
  groupOverview: {
    title: '主机分组',
    description: '查看主机分组'
  },
  reportOverview: {
    title: '报表管理',
    description: '查看报表管理'
  },
  statusOverview: {
    title: '系统状态',
    description: '查看系统状态'
  },
  statisticsOverview: {
    title: '系统统计',
    description: '查看系统统计'
  },
  toolsOverview: {
    title: '系统调试',
    description: '进行系统调试'
  },
  rolesOverview: {
    title: '角色管理',
    description: '查看角色管理'
  },
  systemPort: {
    title: '系统端口',
    description: '查看系统端口'
  },
  systemStatus: {
    title: '系统状态',
    description: '查看系统状态'
  },
  userManage: {
    title: '用户管理',
    description: '查看用户管理'
  },
  threatBack: {
    title: '威胁溯源',
    description: '查看威胁溯源'
  },
  bruteForce: {
    title: '暴力破解',
    description: '查看暴力破解安全推演'
  },
  SQLInjection: {
    title: 'SQL注入',
    description: '查看SQL注入安全推演'
  },
  shellshock: {
    title: 'Shellshock',
    description: '查看Shellshock安全推演'
  },
  riskService: {
    title: '高危服务',
    description: '查看高危服务安全推演'
  },
  blackmailVirus: {
    title: '勒索病毒',
    description: '查看勒索病毒安全推演'
  },
  patchDistribution: {
    title: '补丁管理',
    description: '查看补丁管理'
  },
  connectionRecord: {
    title: '连接记录',
    description: '查看主机连接记录'
  },
  departmentManage: {
    title: '部门管理',
    description: '查看部门管理'
  },
  checkupPolicy: {
    title: '安全体检策略',
    description: '查看安全体检策略'
  },
  checkupList: {
    title: '体检列表',
    description: '查看体检列表'
  },
  baselineCheck: {
    title: '基线检查',
    description: '查看基线检查'
  },
  baselineTemplate: {
    title: '基线模板',
    description: '查看基线模板'
  },
  baselinePolicy: {
    title: '检查策略',
    description: '查看检查策略'
  },
  vulnDetection: {
    title: '漏洞检测',
    description: '查看漏洞检测'
  },
  virusFound: {
    title: '病毒发现',
    description: '查看病毒发现',
    parentBreadcrumbArr: ['病毒查杀']
  },
  killingStrategy: {
    title: '病毒查杀',
    description: '病毒查杀'
  },
  killLog: {
    title: '查杀日志',
    description: '查看病毒查杀日志'
  },
  agentVersion: {
    title: '主机版本',
    description: '查看管理主机版本'
  },
  managerAddr: {
    title: '管理器地址配置',
    description: '查看管理器网卡列表地址配置，修改管理器地址会可能影响页面访问IP'
  },
  managerMsl: {
    title: '数据源输入',
    description: '数据源输入'
  },
  managerSearch: {
    title: '数据库查询',
    description: '数据库查询'
  },
  // 下方多tabs模块
  fileDetection: {
    title: '文件检测',
    description: '查看文件检测',
    parentBreadcrumbArr: ['风险检测'],
  },
  hostDetection: {
    title: '主机检测',
    description: '查看主机检测',
    parentBreadcrumbArr: ['风险检测'],
  },
  networkMonitoring: {
    title: '网络检测',
    description: '查看网络检测',
    parentBreadcrumbArr: ['风险检测'],
  },
  accountDetection: {
    title: '账户检测',
    description: '查看账户检测信息',
    parentBreadcrumbArr: ['风险检测'],
  },
  maliciousProcesses: {
    title: '恶意进程',
    description: '查看恶意进程信息',
    parentBreadcrumbArr: ['风险检测'],
  },

  // 下方溯源分析
  backAnalysis: {
    title: '威胁溯源',
    description: '查看威胁溯源'
  },


};
exports.WAZUH_MODULES = WAZUH_MODULES;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndhenVoLW1vZHVsZXMudHMiXSwibmFtZXMiOlsiV0FaVUhfTU9EVUxFUyIsImdlbmVyYWwiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwiZmltIiwicG0iLCJ2dWxzIiwib3NjYXAiLCJhdWRpdCIsInBjaSIsImdkcHIiLCJoaXBhYSIsIm5pc3QiLCJ0c2MiLCJjaXNjYXQiLCJhd3MiLCJnY3AiLCJ2aXJ1c3RvdGFsIiwibWl0cmUiLCJzeXNjb2xsZWN0b3IiLCJjb25maWd1cmF0aW9uIiwib3NxdWVyeSIsInNjYSIsImRvY2tlciIsImRldlRvb2xzIiwibG9ndGVzdCIsInRlc3RDb25maWd1cmF0aW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7O0FBV08sTUFBTUEsYUFBYSxHQUFHO0FBQzNCQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLGlCQURBO0FBRVBDLElBQUFBLFdBQVcsRUFDVDtBQUhLLEdBRGtCO0FBTTNCQyxFQUFBQSxHQUFHLEVBQUU7QUFDSEYsSUFBQUEsS0FBSyxFQUFFLHNCQURKO0FBRUhDLElBQUFBLFdBQVcsRUFDVDtBQUhDLEdBTnNCO0FBVzNCRSxFQUFBQSxFQUFFLEVBQUU7QUFDRkgsSUFBQUEsS0FBSyxFQUFFLG1CQURMO0FBRUZDLElBQUFBLFdBQVcsRUFDVDtBQUhBLEdBWHVCO0FBZ0IzQkcsRUFBQUEsSUFBSSxFQUFFO0FBQ0pKLElBQUFBLEtBQUssRUFBRSxpQkFESDtBQUVKQyxJQUFBQSxXQUFXLEVBQ1Q7QUFIRSxHQWhCcUI7QUFxQjNCSSxFQUFBQSxLQUFLLEVBQUU7QUFDTEwsSUFBQUEsS0FBSyxFQUFFLFVBREY7QUFFTEMsSUFBQUEsV0FBVyxFQUNUO0FBSEcsR0FyQm9CO0FBMEIzQkssRUFBQUEsS0FBSyxFQUFFO0FBQ0xOLElBQUFBLEtBQUssRUFBRSxpQkFERjtBQUVMQyxJQUFBQSxXQUFXLEVBQ1Q7QUFIRyxHQTFCb0I7QUErQjNCTSxFQUFBQSxHQUFHLEVBQUU7QUFDSFAsSUFBQUEsS0FBSyxFQUFFLFNBREo7QUFFSEMsSUFBQUEsV0FBVyxFQUNUO0FBSEMsR0EvQnNCO0FBb0MzQk8sRUFBQUEsSUFBSSxFQUFFO0FBQ0pSLElBQUFBLEtBQUssRUFBRSxNQURIO0FBRUpDLElBQUFBLFdBQVcsRUFDVDtBQUhFLEdBcENxQjtBQXlDM0JRLEVBQUFBLEtBQUssRUFBRTtBQUNMVCxJQUFBQSxLQUFLLEVBQUUsT0FERjtBQUVMQyxJQUFBQSxXQUFXLEVBQ1Q7QUFIRyxHQXpDb0I7QUE4QzNCUyxFQUFBQSxJQUFJLEVBQUU7QUFDSlYsSUFBQUEsS0FBSyxFQUFFLGFBREg7QUFFSkMsSUFBQUEsV0FBVyxFQUNUO0FBSEUsR0E5Q3FCO0FBbUQzQlUsRUFBQUEsR0FBRyxFQUFFO0FBQ0hYLElBQUFBLEtBQUssRUFBRSxLQURKO0FBRUhDLElBQUFBLFdBQVcsRUFDVDtBQUhDLEdBbkRzQjtBQXdEM0JXLEVBQUFBLE1BQU0sRUFBRTtBQUNOWixJQUFBQSxLQUFLLEVBQUUsU0FERDtBQUVOQyxJQUFBQSxXQUFXLEVBQ1Q7QUFISSxHQXhEbUI7QUE2RDNCWSxFQUFBQSxHQUFHLEVBQUU7QUFDSGIsSUFBQUEsS0FBSyxFQUFFLFlBREo7QUFFSEMsSUFBQUEsV0FBVyxFQUNUO0FBSEMsR0E3RHNCO0FBa0UzQmEsRUFBQUEsR0FBRyxFQUFFO0FBQ0hkLElBQUFBLEtBQUssRUFBRSx1QkFESjtBQUVIQyxJQUFBQSxXQUFXLEVBQ1QsaUdBSEMsQ0FHaUc7O0FBSGpHLEdBbEVzQjtBQXVFM0JjLEVBQUFBLFVBQVUsRUFBRTtBQUNWZixJQUFBQSxLQUFLLEVBQUUsWUFERztBQUVWQyxJQUFBQSxXQUFXLEVBQ1Q7QUFIUSxHQXZFZTtBQTRFM0JlLEVBQUFBLEtBQUssRUFBRTtBQUNMaEIsSUFBQUEsS0FBSyxFQUFFLGNBREY7QUFFTEMsSUFBQUEsV0FBVyxFQUNUO0FBSEcsR0E1RW9CO0FBaUYzQmdCLEVBQUFBLFlBQVksRUFBRTtBQUNaakIsSUFBQUEsS0FBSyxFQUFFLGdCQURLO0FBRVpDLElBQUFBLFdBQVcsRUFDVDtBQUhVLEdBakZhO0FBc0YzQmlCLEVBQUFBLGFBQWEsRUFBRTtBQUNibEIsSUFBQUEsS0FBSyxFQUFFLGVBRE07QUFFYkMsSUFBQUEsV0FBVyxFQUNUO0FBSFcsR0F0Rlk7QUEyRjNCa0IsRUFBQUEsT0FBTyxFQUFFO0FBQ1BuQixJQUFBQSxLQUFLLEVBQUUsU0FEQTtBQUVQQyxJQUFBQSxXQUFXLEVBQ1Q7QUFISyxHQTNGa0I7QUFnRzNCbUIsRUFBQUEsR0FBRyxFQUFFO0FBQ0hwQixJQUFBQSxLQUFLLEVBQUUsbUNBREo7QUFFSEMsSUFBQUEsV0FBVyxFQUFFO0FBRlYsR0FoR3NCO0FBb0czQm9CLEVBQUFBLE1BQU0sRUFBRTtBQUNOckIsSUFBQUEsS0FBSyxFQUFFLGlCQUREO0FBRU5DLElBQUFBLFdBQVcsRUFDVDtBQUhJLEdBcEdtQjtBQXlHM0JxQixFQUFBQSxRQUFRLEVBQUU7QUFDUnRCLElBQUFBLEtBQUssRUFBRSxhQURDO0FBRVJDLElBQUFBLFdBQVcsRUFBRTtBQUZMLEdBekdpQjtBQTZHM0JzQixFQUFBQSxPQUFPLEVBQUU7QUFDUHZCLElBQUFBLEtBQUssRUFBRSxnQkFEQTtBQUVQQyxJQUFBQSxXQUFXLEVBQUU7QUFGTixHQTdHa0I7QUFpSDNCdUIsRUFBQUEsaUJBQWlCLEVBQUU7QUFDakJ4QixJQUFBQSxLQUFLLEVBQUUsMEJBRFU7QUFFakJDLElBQUFBLFdBQVcsRUFBRTtBQUZJO0FBakhRLENBQXRCIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIFdhenVoIGFwcCAtIFNpbXBsZSBkZXNjcmlwdGlvbiBmb3IgZWFjaCBBcHAgdGFic1xuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cbmV4cG9ydCBjb25zdCBXQVpVSF9NT0RVTEVTID0ge1xuICBnZW5lcmFsOiB7XG4gICAgdGl0bGU6ICdTZWN1cml0eSBldmVudHMnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0Jyb3dzZSB0aHJvdWdoIHlvdXIgc2VjdXJpdHkgYWxlcnRzLCBpZGVudGlmeWluZyBpc3N1ZXMgYW5kIHRocmVhdHMgaW4geW91ciBlbnZpcm9ubWVudC4nXG4gIH0sXG4gIGZpbToge1xuICAgIHRpdGxlOiAnSW50ZWdyaXR5IG1vbml0b3JpbmcnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0FsZXJ0cyByZWxhdGVkIHRvIGZpbGUgY2hhbmdlcywgaW5jbHVkaW5nIHBlcm1pc3Npb25zLCBjb250ZW50LCBvd25lcnNoaXAgYW5kIGF0dHJpYnV0ZXMuJ1xuICB9LFxuICBwbToge1xuICAgIHRpdGxlOiAnUG9saWN5IG1vbml0b3JpbmcnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ1ZlcmlmeSB0aGF0IHlvdXIgc3lzdGVtcyBhcmUgY29uZmlndXJlZCBhY2NvcmRpbmcgdG8geW91ciBzZWN1cml0eSBwb2xpY2llcyBiYXNlbGluZS4nXG4gIH0sXG4gIHZ1bHM6IHtcbiAgICB0aXRsZTogJ1Z1bG5lcmFiaWxpdGllcycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnRGlzY292ZXIgd2hhdCBhcHBsaWNhdGlvbnMgaW4geW91ciBlbnZpcm9ubWVudCBhcmUgYWZmZWN0ZWQgYnkgd2VsbC1rbm93biB2dWxuZXJhYmlsaXRpZXMuJ1xuICB9LFxuICBvc2NhcDoge1xuICAgIHRpdGxlOiAnT3BlblNDQVAnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0NvbmZpZ3VyYXRpb24gYXNzZXNzbWVudCBhbmQgYXV0b21hdGlvbiBvZiBjb21wbGlhbmNlIG1vbml0b3JpbmcgdXNpbmcgU0NBUCBjaGVja3MuJ1xuICB9LFxuICBhdWRpdDoge1xuICAgIHRpdGxlOiAnU3lzdGVtIGF1ZGl0aW5nJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdBdWRpdCB1c2VycyBiZWhhdmlvciwgbW9uaXRvcmluZyBjb21tYW5kIGV4ZWN1dGlvbiBhbmQgYWxlcnRpbmcgb24gYWNjZXNzIHRvIGNyaXRpY2FsIGZpbGVzLidcbiAgfSxcbiAgcGNpOiB7XG4gICAgdGl0bGU6ICdQQ0kgRFNTJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdHbG9iYWwgc2VjdXJpdHkgc3RhbmRhcmQgZm9yIGVudGl0aWVzIHRoYXQgcHJvY2Vzcywgc3RvcmUgb3IgdHJhbnNtaXQgcGF5bWVudCBjYXJkaG9sZGVyIGRhdGEuJ1xuICB9LFxuICBnZHByOiB7XG4gICAgdGl0bGU6ICdHRFBSJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdHZW5lcmFsIERhdGEgUHJvdGVjdGlvbiBSZWd1bGF0aW9uIChHRFBSKSBzZXRzIGd1aWRlbGluZXMgZm9yIHByb2Nlc3Npbmcgb2YgcGVyc29uYWwgZGF0YS4nXG4gIH0sXG4gIGhpcGFhOiB7XG4gICAgdGl0bGU6ICdISVBBQScsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnSGVhbHRoIEluc3VyYW5jZSBQb3J0YWJpbGl0eSBhbmQgQWNjb3VudGFiaWxpdHkgQWN0IG9mIDE5OTYgKEhJUEFBKSBwcm92aWRlcyBkYXRhIHByaXZhY3kgYW5kIHNlY3VyaXR5IHByb3Zpc2lvbnMgZm9yIHNhZmVndWFyZGluZyBtZWRpY2FsIGluZm9ybWF0aW9uLidcbiAgfSxcbiAgbmlzdDoge1xuICAgIHRpdGxlOiAnTklTVCA4MDAtNTMnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ05hdGlvbmFsIEluc3RpdHV0ZSBvZiBTdGFuZGFyZHMgYW5kIFRlY2hub2xvZ3kgU3BlY2lhbCBQdWJsaWNhdGlvbiA4MDAtNTMgKE5JU1QgODAwLTUzKSBzZXRzIGd1aWRlbGluZXMgZm9yIGZlZGVyYWwgaW5mb3JtYXRpb24gc3lzdGVtcy4nXG4gIH0sXG4gIHRzYzoge1xuICAgIHRpdGxlOiAnVFNDJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdUcnVzdCBTZXJ2aWNlcyBDcml0ZXJpYSBmb3IgU2VjdXJpdHksIEF2YWlsYWJpbGl0eSwgUHJvY2Vzc2luZyBJbnRlZ3JpdHksIENvbmZpZGVudGlhbGl0eSwgYW5kIFByaXZhY3knXG4gIH0sXG4gIGNpc2NhdDoge1xuICAgIHRpdGxlOiAnQ0lTLUNBVCcsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnQ29uZmlndXJhdGlvbiBhc3Nlc3NtZW50IHVzaW5nIENlbnRlciBvZiBJbnRlcm5ldCBTZWN1cml0eSBzY2FubmVyIGFuZCBTQ0FQIGNoZWNrcy4nXG4gIH0sXG4gIGF3czoge1xuICAgIHRpdGxlOiAnQW1hem9uIEFXUycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnU2VjdXJpdHkgZXZlbnRzIHJlbGF0ZWQgdG8geW91ciBBbWF6b24gQVdTIHNlcnZpY2VzLCBjb2xsZWN0ZWQgZGlyZWN0bHkgdmlhIEFXUyBBUEkuJ1xuICB9LFxuICBnY3A6IHtcbiAgICB0aXRsZTogJ0dvb2dsZSBDbG91ZCBQbGF0Zm9ybScsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnU2VjdXJpdHkgZXZlbnRzIHJlbGF0ZWQgdG8geW91ciBHb29nbGUgQ2xvdWQgUGxhdGZvcm0gc2VydmljZXMsIGNvbGxlY3RlZCBkaXJlY3RseSB2aWEgR0NQIEFQSS4nIC8vIFRPRE8gR0NQXG4gIH0sXG4gIHZpcnVzdG90YWw6IHtcbiAgICB0aXRsZTogJ1ZpcnVzVG90YWwnLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0FsZXJ0cyByZXN1bHRpbmcgZnJvbSBWaXJ1c1RvdGFsIGFuYWx5c2lzIG9mIHN1c3BpY2lvdXMgZmlsZXMgdmlhIGFuIGludGVncmF0aW9uIHdpdGggdGhlaXIgQVBJLidcbiAgfSxcbiAgbWl0cmU6IHtcbiAgICB0aXRsZTogJ01JVFJFIEFUVCZDSycsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICAnU2VjdXJpdHkgZXZlbnRzIGZyb20gdGhlIGtub3dsZWRnZSBiYXNlIG9mIGFkdmVyc2FyeSB0YWN0aWNzIGFuZCB0ZWNobmlxdWVzIGJhc2VkIG9uIHJlYWwtd29ybGQgb2JzZXJ2YXRpb25zJ1xuICB9LFxuICBzeXNjb2xsZWN0b3I6IHtcbiAgICB0aXRsZTogJ0ludmVudG9yeSBkYXRhJyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdBcHBsaWNhdGlvbnMsIG5ldHdvcmsgY29uZmlndXJhdGlvbiwgb3BlbiBwb3J0cyBhbmQgcHJvY2Vzc2VzIHJ1bm5pbmcgb24geW91ciBtb25pdG9yZWQgc3lzdGVtcy4nXG4gIH0sXG4gIGNvbmZpZ3VyYXRpb246IHtcbiAgICB0aXRsZTogJ0NvbmZpZ3VyYXRpb24nLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ0NoZWNrIHRoZSBjdXJyZW50IGFnZW50IGNvbmZpZ3VyYXRpb24gcmVtb3RlbHkgYXBwbGllZCBieSBpdHMgZ3JvdXAuJ1xuICB9LFxuICBvc3F1ZXJ5OiB7XG4gICAgdGl0bGU6ICdPc3F1ZXJ5JyxcbiAgICBkZXNjcmlwdGlvbjpcbiAgICAgICdPc3F1ZXJ5IGNhbiBiZSB1c2VkIHRvIGV4cG9zZSBhbiBvcGVyYXRpbmcgc3lzdGVtIGFzIGEgaGlnaC1wZXJmb3JtYW5jZSByZWxhdGlvbmFsIGRhdGFiYXNlLidcbiAgfSxcbiAgc2NhOiB7XG4gICAgdGl0bGU6ICdTZWN1cml0eSBjb25maWd1cmF0aW9uIGFzc2Vzc21lbnQnLFxuICAgIGRlc2NyaXB0aW9uOiAnU2NhbiB5b3VyIGFzc2V0cyBhcyBwYXJ0IG9mIGEgY29uZmlndXJhdGlvbiBhc3Nlc3NtZW50IGF1ZGl0LidcbiAgfSxcbiAgZG9ja2VyOiB7XG4gICAgdGl0bGU6ICdEb2NrZXIgbGlzdGVuZXInLFxuICAgIGRlc2NyaXB0aW9uOlxuICAgICAgJ01vbml0b3IgYW5kIGNvbGxlY3QgdGhlIGFjdGl2aXR5IGZyb20gRG9ja2VyIGNvbnRhaW5lcnMgc3VjaCBhcyBjcmVhdGlvbiwgcnVubmluZywgc3RhcnRpbmcsIHN0b3BwaW5nIG9yIHBhdXNpbmcgZXZlbnRzLidcbiAgfSxcbiAgZGV2VG9vbHM6IHtcbiAgICB0aXRsZTogJ0FQSSBjb25zb2xlJyxcbiAgICBkZXNjcmlwdGlvbjogJ1Rlc3QgdGhlIFdhenVoIEFQSSBlbmRwb2ludHMuJ1xuICB9LFxuICBsb2d0ZXN0OiB7XG4gICAgdGl0bGU6ICdUZXN0IHlvdXIgbG9ncycsXG4gICAgZGVzY3JpcHRpb246ICdDaGVjayB5b3VyIHJ1bGVzZXQgdGVzdGluZyBsb2dzLidcbiAgfSxcbiAgdGVzdENvbmZpZ3VyYXRpb246IHtcbiAgICB0aXRsZTogJ1Rlc3QgeW91ciBjb25maWd1cmF0aW9ucycsXG4gICAgZGVzY3JpcHRpb246ICdDaGVjayBjb25maWd1cmF0aW9ucyBiZWZvcmUgYXBwbHlpbmcgdGhlbSdcbiAgfVxufTtcbiJdfQ==