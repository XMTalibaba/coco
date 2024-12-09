// （除 资产管理-连接记录、风险检测-漏洞检测-代理漏洞、溯源分析-威胁溯源、系统管理-系统状态-运行记录）
const WAZUH_MODULES_SEARCH_INIT = { // 默认搜索条件
  general: [
    {
      type: 'phrasesFilter', //  默认条件类型：phrasesFilter => 属于 类型筛选, phraseFilter => 是 类型筛选, customFilter => 查询DSL语句
      acton: 'dis', // 作用于哪个文件：dis => public/components/common/modules/discover/discover.tsx 和 public/kibana-integrations/discover/application/components/discover_legacy.tsx
      params: {
        name: 'rule.level',
        params: ['7', '8', '9', '10', '11', '12', '13', '14', '15'] // 属于 类型筛选为数组，是 类型筛选为字符串
      },
      // public/components/common/modules/discover/discover.tsx => buildFilter函数
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.level', type: 'string' }, ['7', '8', '9', '10', '11', '12', '13', '14', '15'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      // 表格列初始化，默认设置为空数组
      columns: []
    },
    {
      acton: 'vis'
    }
  ],
  accountChange: [ // 账户检测-账户变更
    {
      type: 'phrasesFilter', //  默认条件类型：phrasesFilter => 属于 类型筛选, phraseFilter => 是 类型筛选, customFilter => 查询DSL语句
      acton: 'dis', // 作用于哪个文件：dis => public/components/common/modules/discover/discover.tsx 和 public/kibana-integrations/discover/application/components/discover_legacy.tsx
      params: {
        name: 'rule.id',
        params: ['5902',
        '5901', '5903', '2961'] // 属于 类型筛选为数组，是 类型筛选为字符串
      },
      // public/components/common/modules/discover/discover.tsx => buildFilter函数
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['5901', '5902', '5903', '2961'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      // 表格列初始化，默认设置为空数组
      columns: ['icon', 'timestamp', 'account.user', 'data.uid', 'data.gid', 'rule.description', 'rule.level']
    },
    {
      acton: 'vis'
    }
  ],
  accountUnusual: [ // 账户检测-账户异常
    {
      type: 'phrasesFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: ['5555', '5303', '5304', '5904', '2961', '2502',
        '40112', '5631', '5719', '51003', '51093', '5551', '100030', '100031',
        '17101', '17102', '100330', '17103']
      },
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['5555', '5303', '5304', '5904', '2961', '2502', '40112', '5631', '5719', '51003', '51093', '5551'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: ['icon', 'timestamp', 'account.user', 'data.uid', 'data.gid', 'data.srcip', 'rule.description', 'rule.level']
    },
    {
      acton: 'vis'
    }
  ],
  accountLogin: [ // 账户检测-账户登录
    {
      type: 'phrasesFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: ['10100', '5715', '51009', '51010', '40101', '5602', '5501',
        '51003', '51093', '5301', '5302', '2501', '2502', '5716', '5728', '5738', '5755', '5758', '5503',
        '51524', '51510', '5113', '5722', '5721', '5725', '5740', '5742', '51005', '5502',
        '100030', '100031',
        '100032']
      },
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['10100', '5715', '51009', '51010', '40101', '5602', '5501'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: ['icon', 'timestamp', 'account.user', 'data.uid', 'data.gid', 'data.srcip', 'rule.description', 'rule.level']
    },
    {
      acton: 'vis'
    }
  ],
  fim: [ // 文件检测-关键文件
    {
      type: 'phrasesFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: ['554', '553', '550']
      },
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['554', '553', '550'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: ['icon', 'timestamp', 'syscheck.path', 'syscheck.event', 'rule.description', 'rule.level']
    }
  ],
  logToClear: [ // 文件检测-日志清除行为
    // {
    //   type: 'customFilter',
    //   acton: 'dis',
    //   body: {
    //     "query": {
    //       "bool": {
    //         "must": [
    //           {
    //             "match": {
    //               "syscheck.event": "deleted"
    //             }
    //           },
    //           {
    //             "prefix": {
    //               "syscheck.path": "/var/log/"
    //             }
    //           }
    //         ]
    //       }
    //     }
    //   },
    //   example: "const formattedFilter = buildCustomFilter(this.indexPattern.title, searchInit.body, false, false, null, 'appState');",
    //   columns: ['icon', 'timestamp', 'syscheck.path', 'syscheck.event', 'rule.description', 'rule.level']
    // },
    {
      type: 'phrasesFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: ['593', '18118', '83201', '60117', '63104', '100215']
      },
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['593', '18118', '83201', '60117', '63104', '100215'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: ['icon', 'timestamp', 'data.srcip', 'data.srcuser', 'rule.description', 'rule.level']
    },
    {
      acton: 'vis'
    }
  ],
  pm: [ // 网络检测-rootkit页
    {
      type: 'phraseFilter',
      acton: 'dis',
      params: {
        name: 'rule.groups',
        params: 'rootcheck'
      },
      example: "const formattedFilter = buildPhraseFilter({ name: 'rule.groups', type: 'string' }, 'rootcheck', this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: []
    },
    {
      acton: 'vis'
    }
  ], 
  webAttack: [ // 网络检测-web攻击
    {
      type: 'phraseFilter',
      acton: 'dis',
      params: {
        name: 'rule.groups',
        params: 'web'
      },
      example: "const formattedFilter = buildPhraseFilter({ name: 'rule.groups', type: 'string' }, 'web', this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: []
    },
    {
      type: 'phraseFilter',
      acton: 'dis',
      params: {
        name: 'rule.groups',
        params: 'attack'
      },
      example: "const formattedFilter = buildPhraseFilter({ name: 'rule.groups', type: 'string' }, 'attack', this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: []
    },
    {
      acton: 'vis'
    }
  ],
  bruteForce: [ // 网络检测-暴力破解
    {
      type: 'phrasesFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: ['5720', '5551', '5712', '60204']
      },
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['5720', '5551', '5712', '60122', '60204'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: ['icon', 'timestamp', 'data.srcip', 'data.srcuser', 'rule.description', 'rule.level']
    },
    {
      acton: 'vis'
    }
  ],
  reboundShell: [ // 网络检测-反弹shell
    {
      type: 'phrasesFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: ['100207', '100209']
      },
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['100207', '100209'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: []
    },
    {
      acton: 'vis'
    }
  ],
  localAskRight: [ // 网络检测-本地提权
    {
      type: 'phrasesFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: ['80721', '5402', '2833', '5303', '18247', '18151', '60184', '60203']
      },
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['80721', '5402', '2833', '5303', '18247', '18151', '60184', '60203'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: ['icon', 'timestamp', 'data.srcuser', 'rule.description', 'rule.level']
    },
    {
      acton: 'vis'
    }
  ],
  riskPort: [ // 网络检测-高危端口
    {
      type: 'phrasesFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: ['100027']
      },
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['100027'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: []
    },
    {
      acton: 'vis'
    }
  ],
  riskService: [ // 主机检测-高危系统服务
    {
      type: 'phraseFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: '100014'
      },
      example: "const formattedFilter = buildPhraseFilter({ name: 'rule.id', type: 'string' }, '100014', this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: []
    },
    {
      acton: 'vis'
    }
  ],
  systemCommands: [ // 主机检测-高危指令
    {
      type: 'phrasesFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: ['100200', '100201']
      },
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['100200', '100201'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: ['icon', 'timestamp', 'data.audit.command', 'rule.description', 'rule.level']
    },
    {
      acton: 'vis'
    }
  ],
  dataTheft: [ // 主机检测-数据窃取
    {
      type: 'phrasesFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: ['100216']
      },
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['100216'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: []
    },
    {
      acton: 'vis'
    }
  ],
  blackmailVirus: [ // 主机检测-勒索病毒
    {
      type: 'phrasesFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: ['100017', '100019']
      },
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['100017', '100019'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: []
    },
    {
      acton: 'vis'
    }
  ],
  systemCommandVerify: [ // 主机检测-系统命令校验
    {
      type: 'phrasesFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: ['100218', '100219']
      },
      example: "const formattedFilter = buildPhrasesFilter({ name: 'rule.id', type: 'string' }, ['100218', '100219'], this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: []
    },
    {
      acton: 'vis'
    }
  ],
  zombies: [ // 恶意进程-僵尸进程
    {
      type: 'phraseFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: '100026'
      },
      example: "const formattedFilter = buildPhraseFilter({ name: 'rule.id', type: 'string' }, '100026', this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: []
    },
    {
      acton: 'vis'
    }
  ],
  hiddenProcess: [ // 恶意进程-隐藏进程
    {
      type: 'phraseFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: '100033'
      },
      example: "const formattedFilter = buildPhraseFilter({ name: 'rule.id', type: 'string' }, '100033', this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: []
    },
    {
      acton: 'vis'
    }
  ],
  virusFound: [ // 病毒查杀-病毒发现
    {
      type: 'phraseFilter',
      acton: 'dis',
      params: {
        name: 'rule.id',
        params: '52502'
      },
      example: "const formattedFilter = buildPhraseFilter({ name: 'rule.id', type: 'string' }, '52502', this.indexPattern);this.props.shareFilterManager.addFilters(formattedFilter);",
      columns: []
    },
    {
      acton: 'vis'
    }
  ],
}

exports.WAZUH_MODULES_SEARCH_INIT = WAZUH_MODULES_SEARCH_INIT;