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

const homeOverviewSections = {
  // 首页: 全员
  // workbench: { id: 'workbench', text: 'Workbench', type: '' },
  // general: { id: 'general', text: 'General', type: 'overview' },
  // manageTool: { id: 'manage-tool', text: 'Virus Found' },
  managerMsl: { id: 'manager-msl', text: '数据源输入', type: '' }, 
  manageTool: { id: 'manage-tool', text: '安装工具' },
  workbench: { id: 'workbench', text: '控制台', type: '' },
  general: { id: 'general', text: '安全告警', type: 'overview' },

};

const assetManageSections = {
  // 资产管理: 超级管理员、系统管理员、操作用户
hostManage: { id: 'agents-preview', text: '资产管理' },
  hostGroup: { id: 'groups', text: '主机分组', type: 'manager' },
  planTasks: { id: 'plan-tasks', text: '计划任务', type: '' },
  softwareApp: { id: 'software-app', text: '软件应用', type: '' },
  systemAccount: { id: 'system-account', text: '系统账号', type: '' },
  systemPort: { id: 'system-port', text: '系统端口', type: '' },
  patchDistribution: { id: 'patch-distribution', text: '补丁管理', type: '' },
  connectionRecord: { id: 'connection-record', text: '连接记录', type: '' },
  agentVersion: { id: 'agent-version', text: '主机版本', type: '' },
};

const riskMonitoringSections = {
  // 风险检测: 超级管理员、系统管理员、操作用户
  accountDetection: {
    id: 'accountChange',
    text: '账户检测',
    type: 'overview',
    modulesTab: 'accountDetection',
  },
  fileDetection: { id: 'fim', text: '文件检测', type: 'overview', modulesTab: 'fileDetection' }, // 默认关键文件tab
  testNetwork: {
    id: 'pm',
    text: '网络检测',
    type: 'overview',
    modulesTab: 'networkMonitoring',
  }, // 默认rootkit tab
  hostDetection: { id: 'riskService', text: '主机检测', type: 'overview', modulesTab: 'hostDetection' }, // 默认高危险系统服务tab
  maliciousProcesses: {
    id: 'zombies',
    text: '恶意进程',
    type: 'overview',
    modulesTab: 'maliciousProcesses',
  }, // 默认僵尸进程tab
  vulnDetection: { id: 'vuln-detection', text: '漏洞检测', type: '' },
};

const hostProtectionSections = {
  // 策略管理: 超级管理员、系统管理员、操作用户(除安全防护策略外)
  blackWhitelist: { id: 'black-whitelist', text: '安全防护策略', type: '' },
  policyManage: { id: 'policy-manage', text: '代理策略管理', type: '' },
  microStrategy: { id: 'micro-strategy', text: '微隔离策略', type: '' },
};

const safetyCheckupSections = {
  // 安全体检: 超级管理员、系统管理员
  checkupList: { id: 'checkup-list', text: '体检列表', type: '' },
  checkupPolicy: { id: 'checkup-policy', text: '安全体检策略', type: '' },
};

const virusKillingSections = {
  // 病毒查杀: 超级管理员、系统管理员
  virusFound: { id: 'virusFound', text: '病毒发现', type: 'overview' },
  killLog: { id: 'kill-log', text: '查杀日志', type: '' },
  killingStrategy: { id: 'killing-strategy', text: '查杀策略', type: '' },
};

const complianceBaselineSections = {
  // 合规基线：超级管理员、系统管理员
  baselineCheck: { id: 'baseline-check', text: '基线检查', type: '' },
  baselineTemplate: { id: 'baseline-template', text: '基线模板', type: '' },
  baselinePolicy: { id: 'baseline-policy', text: '检查策略', type: '' },
};


const backAnalysisSections = {
  // 溯源分析: 超级管理员、审计管理员
  threatBack: { id: 'threat-back', text: '威胁溯源', type: '' },
};
const securityDeductionSetions = {
  // 安全推演：超级管理员、系统管理员
  bruteForce: { id: 'brute-force', text: '暴力破解', type: '' },
  SQLInjection: { id: 'SQL-injection', text: 'SQL注入', type: '' },
  shellshock: { id: 'shellshock', text: 'Shellshock', type: '' },
  riskService: { id: 'risk-service', text: '高危服务', type: '' },
  blackmailVirus: { id: 'blackmail-virus', text: '勒索病毒', type: '' },
};
const kinabaSetions = {
  // kibana
  kibana: { id: 'app/kibana_overview/', text: 'Kibana', type: '' ,app:'kibana_overview'},
  discover:{ id: 'discover', text: '日志发现', type: '' ,app:'discover'},
  management:{ id: 'management', text: '日志设置管理', type: '' ,app:'management'},
  visualize:{ id: 'visualize', text: '可视化图表', type: '' ,app:'visualize'},
  dev_tools:{ id: 'dev_tools', text: '命令查询', type: '' ,app:'dev_tools'},
  dashboards:{ id: 'dashboards', text: '可视化仪表板', type: '' ,app:'dashboards'},
  tutorial_directory:{ id: '', text: '添加', type: '' ,app:'home/tutorial_directory'},
};
const logStatementsSetions = {
  // 日志报表: 超级管理员、审计管理员
  adminLoginlog: { id: 'admin-loginlog', text: '管理员登录日志', type: '' },
  adminOperationlog: { id: 'admin-operationlog', text: '管理员操作日志', type: '' },
  systemRunLogs: { id: 'system-run-log', text: '系统运行日志', type: '' },
  reportManage: { id: 'reporting', text: '报表管理', type: 'manager' },
};



const systemManageSections = {
  // 系统管理: 超级管理员(部门管理、授权管理只有超级管理员能看)、用户管理员(用户管理、角色管理)、系统管理员(除用户管理、部门管理、授权管理外)
  systemParam: { id: 'system-param', text: '参数配置', type: '' },
  licenseManage: { id: 'license-manage', text: '授权管理', type: '' }, // 授权管理只有超级管理员可看
  systemStatus: { id: 'system-status', text: '系统状态', type: '' },
  userManage: { id: 'user-manage', text: '用户管理', type: '' },
  departmentManage: { id: 'department-manage', text: '部门管理', type: '' }, // 部门管理只有超级管理员可看
  managerAddr: { id: 'manager-addr', text: '管理器地址配置', type: '' }, // 部门管理只有超级管理员可看
  managerMsl: { id: 'manager-msl', text: '数据源输入', type: '' }, 
  managerSearch: { id: 'manager-search', text: '机械学习', type: '' }, 
  managerEmial: { id: 'manager-email', text: '日志审计', type: '' }, 
  // roleManage: { id: 'roles', text: '角色管理', type: 'security' },
  // userManageOld: {
  //   id: 'app/opendistro_security/users',
  //   text: '用户管理',
  //   type: '',
  //   app: 'opendistro_security',
  // },
};

exports.NavPermission = {
  admin: {

    homeOverview: {
      title: '首页',
      iconType: 'home',
      activeNav: 'homeOverview',
      routeItems: [
        // systemManageSections.managerEmial,
        homeOverviewSections.workbench,
        // homeOverviewSections.manageTool,
          //  homeOverviewSections.general,
      ]
    },
  
  
    // virusKilling: {
    //   title: '病毒查杀',
    //   iconType: 'bug',
    //   activeNav: 'virusKilling',
    //   routeItems: [
    //     virusKillingSections.virusFound,
    //     virusKillingSections.killLog,
    //     virusKillingSections.killingStrategy,
    //   ]
    // },
    // checkupPolicy: {
    //   title: '安全体检',
    //   iconType: 'partial',
    //   activeNav: 'safetyCheckup',
    //   routeItems: [
    //     safetyCheckupSections.checkupList,
    //     safetyCheckupSections.checkupPolicy,
    //   ]
    // },
    // aeestManage: {
    //   title: '资产管理',
    //   iconType: 'watchesApp',
    //   activeNav: 'assetManage',
    //   routeItems: [
    //     assetManageSections.hostManage,
    //     assetManageSections.hostGroup,
    //     assetManageSections.planTasks,
    //     assetManageSections.softwareApp,
    //     assetManageSections.systemAccount,
    //     assetManageSections.systemPort,
    //     assetManageSections.patchDistribution,
    //     assetManageSections.connectionRecord,
    //     assetManageSections.agentVersion,
    //   ]
    // },
    mslManage:{

      title: '数据源管理',
      iconType: 'partial',
      activeNav: 'managerMsl',
      routeItems: [
    
        systemManageSections.managerMsl,
     
      ]
    },
    // riskMonitoring: {
    //   title: '风险检测',
    //   iconType: 'securitySignal',
    //   activeNav: 'riskMonitoring',
    //   routeItems: [
    //     riskMonitoringSections.accountDetection,
    //     riskMonitoringSections.fileDetection,
    //     riskMonitoringSections.testNetwork,
    //     riskMonitoringSections.hostDetection,
    //     riskMonitoringSections.maliciousProcesses,
    //     riskMonitoringSections.vulnDetection,
    //   ]
    // },
    kibanaManage:{
      title: '日志报表',
      iconType: 'stats',
      activeNav: 'kibanaManage',
      routeItems: [
        // kinabaSetions.kibana,
        // kinabaSetions.tutorial_directory,
        kinabaSetions.discover,
        // kinabaSetions.kibana,
        kinabaSetions.management,
        
        kinabaSetions.visualize,
        // kinabaSetions.dev_tools,
        kinabaSetions.dashboards,
       
       
      ]
    },
    logStatements: {
      title: '操作日志',
      iconType: 'partial',
      activeNav: 'logStatements',
      routeItems: [
        logStatementsSetions.adminLoginlog,
        logStatementsSetions.adminOperationlog,
        logStatementsSetions.systemRunLogs,

        // logStatementsSetions.reportManage,
      ]
    },
    // suricataManage:{
    //   title: 'suricata日志',
    //   iconType: 'stats',
    //   activeNav: 'suricataManage',
    //   routeItems: [
    //     // kinabaSetions.kibana,
    //     kinabaSetions.suricata,
       
       
    
    //   ]
    // },
    
    // netFlowManage:{
    //   title: 'Net日志',
    //   iconType: 'stats',
    //   activeNav: 'netFlowManage',
    //   routeItems: [
    //     // kinabaSetions.kibana,
    //     // kinabaSetions.netflowLogs,
    //     kinabaSetions.suricata,
       
    //     // kinabaSetions.dashboards,
    //   ]
    // },
    // hostProtection: {
    //   title: 'hostProtection',
    //   iconType: 'link',
    //   activeNav: 'hostProtection',
    //   routeItems: [
    //     hostProtectionSections.blackWhitelist,
    //     hostProtectionSections.policyManage,
    //     hostProtectionSections.microStrategy,
    //   ]
    // },
    // hostProtection: {
    //   title: '策略管理',
    //   iconType: 'link',
    //   activeNav: 'hostProtection',
    //   routeItems: [
    //     hostProtectionSections.blackWhitelist,
    //     hostProtectionSections.policyManage,
    //     hostProtectionSections.microStrategy,
    //   ]
    // },


   
    // complianceBaseline: {
    //   title: '合规基线',
    //   iconType: 'crosshairs',
    //   activeNav: 'complianceBaseline',
    //   routeItems: [
    //     complianceBaselineSections.baselineCheck,
    //     complianceBaselineSections.baselineTemplate,
    //     complianceBaselineSections.baselinePolicy,
    //   ]
    // },
    // backAnalysis: {
    //   title: '溯源分析',
    //   iconType: 'stats',
    //   activeNav: 'backAnalysis',
    //   routeItems: [
    //     backAnalysisSections.threatBack,
    //   ]
    // },
    // securityDeduction: {
    //   title: '安全推演',
    //   iconType: 'visGoal',
    //   activeNav: 'securityDeduction',
    //   routeItems: [
    //     securityDeductionSetions.bruteForce,
    //     securityDeductionSetions.SQLInjection,
    //     securityDeductionSetions.shellshock,
    //     securityDeductionSetions.riskService,
    //     securityDeductionSetions.blackmailVirus,
    //   ]
    // },

    systemManage: {
      title: '系统管理',
      iconType: 'managementApp',
      activeNav: 'systemManage',
      routeItems: [
        systemManageSections.systemParam,
        systemManageSections.licenseManage,
        
        systemManageSections.systemStatus,
        systemManageSections.userManage,
        systemManageSections.departmentManage,
        // systemManageSections.managerAddr,
      ]
    }
  },
  audit: {
  
    homeOverview: {
      title: '首页',
      iconType: 'home',
      activeNav: 'homeOverview',
      routeItems: [
        homeOverviewSections.workbench,
        // homeOverviewSections.general,
      ]
    },
    logStatements: {
      title: '操作日志',
      iconType: 'visBarVertical',
      activeNav: 'logStatements',
      routeItems: [
        logStatementsSetions.adminLoginlog,
        logStatementsSetions.adminOperationlog,
        logStatementsSetions.systemRunLogs,
      ]
    },
    kibanaManage:{
      title: '日志报表',
      iconType: 'stats',
      activeNav: 'kibanaManage',
      routeItems: [
        // kinabaSetions.kibana,
        // kinabaSetions.tutorial_directory,
        kinabaSetions.discover,
        // kinabaSetions.kibana,
        kinabaSetions.management,
        
        kinabaSetions.visualize,
        // kinabaSetions.dev_tools,
        kinabaSetions.dashboards,
       
       
      ]
    },
    // systemManage: {
    //   title: '系统管理',
    //   iconType: 'managementApp',
    //   activeNav: 'systemManage',
    //   routeItems: [
    //     // systemManageSections.systemParam,
    //     // systemManageSections.licenseManage,
        
    //     systemManageSections.systemStatus,
    //     // systemManageSections.userManage,
    //     // systemManageSections.departmentManage,
    //     // systemManageSections.managerAddr,
    //   ]
    // }
  },
  system: {
    // 系统管理员
    // homeOverview: {
    //   title: '首页',
    //   iconType: 'home',
    //   activeNav: 'homeOverview',
    //   routeItems: [
    //     systemManageSections.managerEmial,
    //     homeOverviewSections.workbench,
    //     homeOverviewSections.manageTool,
        
    //   ]
    // },
    
    // aeestManage: {
    //   title: '资产管理',
    //   iconType: 'watchesApp',
    //   activeNav: 'assetManage',
    //   routeItems: [
    //     assetManageSections.hostManage,
    //     assetManageSections.hostGroup,
    //     assetManageSections.planTasks,
    //     assetManageSections.softwareApp,
    //     assetManageSections.systemAccount,
    //     assetManageSections.systemPort,
    //     assetManageSections.patchDistribution,
    //     assetManageSections.connectionRecord,
    //     assetManageSections.agentVersion,
    //   ]
    // },
    
    // mslManage:{

    //   title: '数据源管理',
    //   iconType: 'partial',
    //   activeNav: 'managerMsl',
    //   routeItems: [
    //     systemManageSections.managerMsl,
    //   ]
    // },
    // riskMonitoring: {
    //   title: '风险检测',
    //   iconType: 'securitySignal',
    //   activeNav: 'riskMonitoring',
    //   routeItems: [
    //     riskMonitoringSections.accountDetection,
    //     riskMonitoringSections.fileDetection,
    //     riskMonitoringSections.testNetwork,
    //     riskMonitoringSections.hostDetection,
    //     riskMonitoringSections.maliciousProcesses,
    //     riskMonitoringSections.vulnDetection,
    //   ]
    // },
    // kibanaManage:{
    //   title: '日志报表',
    //   iconType: 'stats',
    //   activeNav: 'kibanaManage',
    //   routeItems: [
    //     kinabaSetions.discover,
    //     kinabaSetions.management,
    //   ]
    // },


    // hostProtection: {
    //   title: '策略管理',
    //   iconType: 'link',
    //   activeNav: 'hostProtection',
    //   routeItems: [
    //     hostProtectionSections.blackWhitelist,
    //     hostProtectionSections.policyManage,
    //     hostProtectionSections.microStrategy,
    //   ]
    // },
 
    // backAnalysis: {
    //   title: '溯源分析',
    //   iconType: 'stats',
    //   activeNav: 'backAnalysis',
    //   routeItems: [
    //     backAnalysisSections.threatBack,
    //   ]
    // },
    systemManage: {
      title: '系统管理',
      iconType: 'managementApp',
      activeNav: 'systemManage',
      routeItems: [
        systemManageSections.systemParam,
        systemManageSections.licenseManage,
        systemManageSections.systemStatus,
        systemManageSections.userManage,
        systemManageSections.departmentManage,
        // systemManageSections.managerAddr,
      ]
    }
  },
  wazuh: {
    // 操作用户
    // homeOverview: {
    //   title: '首页',
    //   iconType: 'home',
    //   activeNav: 'homeOverview',
    //   routeItems: [
    //     systemManageSections.managerEmial,
    //     homeOverviewSections.workbench,
    //     homeOverviewSections.manageTool,
        
    //   ]
    // },
    

    mslManage:{

      title: '数据源管理',
      iconType: 'partial',
      activeNav: 'managerMsl',
      routeItems: [
        systemManageSections.managerMsl,
      ]
    },
    // aeestManage: {
    //   title: '资产管理',
    //   iconType: 'watchesApp',
    //   activeNav: 'assetManage',
    //   routeItems: [
    //     assetManageSections.hostManage,
    //     assetManageSections.hostGroup,
    //     assetManageSections.planTasks,
    //     assetManageSections.softwareApp,
    //     assetManageSections.systemAccount,
    //     assetManageSections.systemPort,
    //     assetManageSections.patchDistribution,
    //     assetManageSections.connectionRecord,
    //     assetManageSections.agentVersion,
    //   ]
    // },
    // riskMonitoring: {
    //   title: '风险检测',
    //   iconType: 'securitySignal',
    //   activeNav: 'riskMonitoring',
    //   routeItems: [
    //     riskMonitoringSections.accountDetection,
    //     riskMonitoringSections.fileDetection,
    //     riskMonitoringSections.testNetwork,
    //     riskMonitoringSections.hostDetection,
    //     riskMonitoringSections.maliciousProcesses,
    //     riskMonitoringSections.vulnDetection,
    //   ]
    // },
    kibanaManage:{
      title: '日志报表',
      iconType: 'stats',
      activeNav: 'kibanaManage',
      routeItems: [
        kinabaSetions.discover,
        kinabaSetions.management,
      ]
    },


    // hostProtection: {
    //   title: '策略管理',
    //   iconType: 'link',
    //   activeNav: 'hostProtection',
    //   routeItems: [
    //     hostProtectionSections.blackWhitelist,
    //     hostProtectionSections.policyManage,
    //     hostProtectionSections.microStrategy,
    //   ]
    // },
 
    // backAnalysis: {
    //   title: '溯源分析',
    //   iconType: 'stats',
    //   activeNav: 'backAnalysis',
    //   routeItems: [
    //     backAnalysisSections.threatBack,
    //   ]
    // },
    // systemManage: {
    //   title: '系统管理',
    //   iconType: 'managementApp',
    //   activeNav: 'systemManage',
    //   routeItems: [
    //     // systemManageSections.systemParam,
    //     systemManageSections.systemStatus,
    //     // systemManageSections.managerAddr,
    //   ]
    // }
  }
};

exports.sections = {
  'logModules=': 'logStatements',
  'overview/?tab=general': 'homeOverview',
  'overview/?tab=softwareChange': 'assetManage',
  'overview/?tab=virusFound': 'virusKilling',
  'overview/?tab': 'riskMonitoring',
  'overview?tab=general': 'homeOverview',
  'overview?tab=softwareChange': 'assetManage',
  'overview?tab=virusFound': 'virusKilling',
  'overview?tab': 'riskMonitoring',
  'manager/?tab=groups': 'assetManage',
  'manager/?tab=logs': 'logStatements',
  'manager/?tab=reporting': 'logStatements',
  'manager/?tab=configuration': 'hostProtection',
  'manager?tab=groups': 'assetManage',
  'manager?tab=logs': 'logStatements',
  'manager?tab=reporting': 'logStatements',
  'manager?tab=configuration': 'hostProtection',
  'agents-preview': 'assetManage',
  agents: 'assetManage',
  'settings?tab=configuration': 'hostProtection',
  settings: 'settings',
  'health-check': 'health-check',
  'manage-ti': 'homeOverview',
  'manage-tool': 'homeOverview',
  'plan-tasks': 'assetManage',
  'black-whitelist': 'hostProtection',
  'admin-loginlog': 'logStatements',
  'admin-operationlog': 'logStatements',
  'system-param': 'systemManage',
  workbench: 'homeOverview',
  'security?tab': 'systemManage',
  'system-run-log': 'logStatements',
  'license-manage': 'systemManage',
  'agent-log': 'logStatements',
  'threat-back': 'backAnalysis',
  'app/opendistro_security': 'systemManage',
  'micro-strategy': 'hostProtection',
  'software-app': 'assetManage',
  'system-account': 'assetManage',
  'policy-manage': 'hostProtection',
  'system-port': 'assetManage',
  'system-status': 'systemManage',
  'user-manage': 'systemManage',
  'brute-force': 'securityDeduction',
  'SQL-injection': 'securityDeduction',
  shellshock: 'securityDeduction',
  'risk-service': 'securityDeduction',
  'blackmail-virus': 'securityDeduction',
  'patch-distribution': 'assetManage',
  'connection-record': 'assetManage',
  'department-manage': 'systemManage',
  'checkup-policy': 'safetyCheckup',
  'checkup-list': 'safetyCheckup',
  'baseline-check': 'complianceBaseline',
  'baseline-template': 'complianceBaseline',
  'baseline-policy': 'complianceBaseline',
  'vuln-detection': 'riskMonitoring',
  'killing-strategy': 'virusKilling',
  'agent-version': 'assetManage',
  'kill-log': 'virusKilling',
  'manager-addr': 'systemManage',
  'manager-msl': 'managerMsl',
   'visualize': 'kibanaManage',
  'discover': 'kibanaManage',
  'management': 'kibanaManage',
  'dashboards': 'kibanaManage',
}
