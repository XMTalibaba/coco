const WAZUH_MODULES_TABS = { // 安全事件tabs
  fileDetection: { // 文件检测
    tabs: [
      {
        id: 'fim', // tab的跳转id
        name: '关键文件' // tab名称
      },
      {
        id: 'logToClear',
        name: '日志清除行为'
      },
    ]
  },
  hostDetection: { // 主机检测
    tabs: [
      // {
      //   id: 'sca',
      //   name: '基线检测'
      // },
      // {
      //   id: 'vuls',
      //   name: '漏洞检测'
      // },
      {
        id: 'riskService',
        name: '高危系统服务'
      },
      {
        id: 'systemCommands',
        name: '高危指令'
      },
      {
        id: 'dataTheft',
        name: '数据窃取'
      },
      {
        id: 'blackmailVirus',
        name: '勒索病毒'
      },
      {
        id: 'systemCommandVerify',
        name: '系统命令校验'
      },
    ]
  },
  networkMonitoring: { // 网络监测
    tabs: [
      {
        id: 'pm',
        name: 'rootkit'
      },
      {
        id: 'webAttack',
        name: 'web攻击'
      },
      {
        id: 'bruteForce',
        name: '暴力破解'
      },
      {
        id: 'reboundShell',
        name: '反弹shell'
      },
      {
        id: 'localAskRight',
        name: '本地提权'
      },
      {
        id: 'riskPort',
        name: '高危端口'
      },
    ]
  },
  accountDetection: { // 风险检测-账户检测
    tabs: [
      {
        id: 'accountChange',
        name: '账户变更'
      },
      {
        id: 'accountUnusual',
        name: '账户异常'
      },
      {
        id: 'accountLogin',
        name: '账户登录'
      },
    ]
  },
  maliciousProcesses: { // 风险检测-恶意进程
    tabs: [
      {
        id: 'zombies',
        name: '僵尸进程'
      },
      {
        id: 'hiddenProcess',
        name: '隐藏进程'
      },
    ]
  }
}
exports.WAZUH_MODULES_TABS = WAZUH_MODULES_TABS;