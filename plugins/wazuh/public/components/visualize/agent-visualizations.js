/*
 * Wazuh app - Agents visualizations
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */

export const agentVisualizations = {
  systemCommands: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  webAttack: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  bruteForce: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  logToClear: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  reboundShell: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  localAskRight: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  dataTheft: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  blackmailVirus: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  riskPort: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  accountChange: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  accountUnusual: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  accountLogin: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  zombies: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  hiddenProcess: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  riskService: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  virusFound: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  systemCommandVerify: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  general: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     // {
      //     //   title: '警告组演化',
      //     //   id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
      //     //   width: 50
      //     // },
      //     { title: '告警趋势', id: 'Wazuh-App-Agents-General-Alerts', width: 100 }
      //   ]
      // },
      // {
      //   height: 300,
      //   vis: [
      //     {
      //       title: 'Top 5 警报',
      //       id: 'Wazuh-App-Agents-General-Top-5-alerts',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 规则组',
      //       id: 'Wazuh-App-Agents-General-Top-10-groups',
      //       width: 33
      //     },
      //     {
      //       title: 'Top 5 PCI DSS 要求',
      //       id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-General-Alerts-summary',
            width: 60
          },
          {
            title: '组总结',
            id: 'Wazuh-App-Agents-General-Groups-summary',
            width: 40
          }
        ]
      }
    ]
  },
  aws: {
    rows: [
      {
        height: 250,
        vis: [
          {
            title: '来源',
            id: 'Wazuh-App-Agents-AWS-Top-sources',
            width: 25
          },
          {
            title: '账户',
            id: 'Wazuh-App-Agents-AWS-Top-accounts',
            width: 25
          },
          {
            title: 'S3桶',
            id: 'Wazuh-App-Agents-AWS-Top-buckets',
            width: 25
          },
          {
            title: '地区',
            id: 'Wazuh-App-Agents-AWS-Top-regions',
            width: 25
          }
        ]
      },
      {
        height: 300,
        vis: [
          {
            title: '来源随时间变化的事件',
            id: 'Wazuh-App-Agents-AWS-Events-by-source',
            width: 50
          },
          {
            title: 'ES3存储桶随时间变化的事件',
            id: 'Wazuh-App-Agents-AWS-Events-by-s3-bucket',
            width: 50
          }
        ]
      },
      {
        height: 570,
        vis: [
          {
            title: '地理位置图',
            id: 'Wazuh-App-Agents-AWS-geo'
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-AWS-Alerts-summary'
          }
        ]
      }
    ]
  },
  fim: {
    rows: [
      // {
      //   height: 300,
      //   vis: [
      //     // {
      //     //   title: '最活跃用户',
      //     //   id: 'Wazuh-App-Agents-FIM-Users',
      //     //   width: 25
      //     // },
      //     // {
      //     //   title: '操作',
      //     //   id: 'Wazuh-App-Agents-FIM-Actions',
      //     //   width: 25
      //     // },
      //     {
      //       title: '事件',
      //       id: 'Wazuh-App-Agents-FIM-Events',
      //       width: 100
      //     }
      //   ]
      // },
      // {
      //   height: 230,
      //   vis: [
      //     {
      //       title: '文件新增',
      //       id: 'Wazuh-App-Agents-FIM-Files-added',
      //       width: 33
      //     },
      //     {
      //       title: '文件修改',
      //       id: 'Wazuh-App-Agents-FIM-Files-modified',
      //       width: 33
      //     },
      //     {
      //       title: '文件删除',
      //       id: 'Wazuh-App-Agents-FIM-Files-deleted',
      //       width: 34
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-FIM-Alerts-summary'
          }
        ]
      }
    ]
  },
  gcp: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Top 5 规则',
            id: 'Wazuh-App-Agents-GCP-Top-5-rules',
            width: 50
          },
          {
            title: 'Top 查询事件',
            id: 'Wazuh-App-Agents-GCP-Event-Query-Name',
            width: 25
          },
          {
            title: 'Top 5 实例',
            id: 'Wazuh-App-Agents-GCP-Top-5-instances',
            width: 25
          },
        ]
      },
      {
        height: 300,
        vis: [
          {
            title: 'Top 项目id ，按源类型',
            id: 'Wazuh-App-Agents-GCP-Top-ProjectId-By-SourceType',
            width: 25
          },
          {
            title: 'GCP 警报演变',
            id: 'Wazuh-App-Agents-GCP-Events-Over-Time',
            width: 75
          },
        ]
      },
      {
        height: 300,
        vis: [
          {
            title: '身份验证回答数',
            id: 'Wazuh-App-Agents-GCP-authAnswer-Bar',
            width: 40
          },
          {
            title: '按项目id划分的资源类型',
            id: 'Wazuh-App-Agents-GCP-Top-ResourceType-By-Project-Id',
            width: 60
          },
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-GCP-Alerts-summary'
          }
        ]
      }
    ]
  },
  pci: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Top 5 规则组',
            id: 'Wazuh-App-Agents-PCI-Groups',
            width: 33
          },
          {
            title: 'Top 5 规则',
            id: 'Wazuh-App-Agents-PCI-Rule',
            width: 33
          },
          {
            title: 'Top 5 PCI DSS 要求',
            id: 'Wazuh-App-Agents-PCI-Requirement',
            width: 34
          }
        ]
      },
      {
        height: 300,
        vis: [
          {
            title: 'PCI 要求',
            id: 'Wazuh-App-Agents-PCI-Requirements',
            width: 75
          },
          {
            title: '规则水平分布',
            id: 'Wazuh-App-Agents-PCI-Rule-level-distribution',
            width: 25
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-PCI-Last-alerts'
          }
        ]
      }
    ]
  },
  gdpr: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Top 5 规则组',
            id: 'Wazuh-App-Agents-GDPR-Groups',
            width: 33
          },
          {
            title: 'Top 5 规则',
            id: 'Wazuh-App-Agents-GDPR-Rule',
            width: 33
          },
          {
            title: 'Top 5 GDPR 要求',
            id: 'Wazuh-App-Agents-GDPR-Requirement',
            width: 34
          }
        ]
      },
      {
        height: 300,
        vis: [
          {
            title: 'GDPR 要求',
            id: 'Wazuh-App-Agents-GDPR-Requirements',
            width: 75
          },
          {
            title: '规则水平分布',
            id: 'Wazuh-App-Agents-GDPR-Rule-level-distribution',
            width: 25
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-GDPR-Last-alerts'
          }
        ]
      }
    ]
  },
  nist: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: '统计',
            id: 'Wazuh-App-Agents-NIST-Stats',
            width: 25
          },
          {
            title: 'Top 10 要求',
            id: 'Wazuh-App-Agents-NIST-top-10-requirements',
            width: 25
          },
          {
            title: '按级别分布的要求',
            id: 'Wazuh-App-Agents-NIST-Requirement-by-level',
            width: 50
          }
        ]
      },
      {
        height: 300,
        vis: [
          {
            title: '随时间变化的要求',
            id: 'Wazuh-App-Agents-NIST-Requirements-stacked-overtime'
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-NIST-Last-alerts'
          }
        ]
      }
    ]
  },
  tsc: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Top 5 规则组',
            id: 'Wazuh-App-Agents-TSC-Groups',
            width: 33
          },
          {
            title: 'Top 5 规则',
            id: 'Wazuh-App-Agents-TSC-Rule',
            width: 33
          },
          {
            title: 'Top 5 TSC 要求',
            id: 'Wazuh-App-Agents-TSC-Requirement',
            width: 34
          }
        ]
      },
      {
        height: 300,
        vis: [
          {
            title: 'TSC 要求',
            id: 'Wazuh-App-Agents-TSC-Requirements',
            width: 75
          },
          {
            title: '规则水平分布',
            id: 'Wazuh-App-Agents-TSC-Rule-level-distribution',
            width: 25
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Overview-TSC-Alerts-summary'
          }
        ]
      }
    ]
  },
  hipaa: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: '随时间变化的要求',
            id: 'Wazuh-App-Agents-HIPAA-Requirements-Stacked-Overtime',
            width: 50
          },
          {
            title: 'Top 10 要求',
            id: 'Wazuh-App-Agents-HIPAA-top-10',
            width: 50
          }
        ]
      },
      {
        height: 300,
        vis: [
          {
            title: 'HIPAA 要求',
            id: 'Wazuh-App-Agents-HIPAA-Burbles',
            width: 50
          },
          {
            title: '按级别分配要求',
            id: 'Wazuh-App-Agents-HIPAA-Distributed-By-Level',
            width: 25
          },
          {
            title: '最常见的警报',
            id: 'Wazuh-App-Agents-HIPAA-Most-Common',
            width: 25
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-HIPAA-Last-alerts'
          }
        ]
      }
    ]
  },
  vuls: {
    rows: [
      // {
      //   height: 400,
      //   vis: [
      //     {
      //       title: '随时间变化的警报严重性',
      //       id: 'Wazuh-App-Agents-vuls-Alerts-severity-over-time',
      //       width: 50
      //     },
      //     {
      //       title: '最常见的规则',
      //       id: 'Wazuh-App-Agents-vuls-Most-common-rules',
      //       width: 50
      //     }
      //   ]
      // },
      // {
      //   height: 330,
      //   vis: [
      //     {
      //       title: '最常见的CVE',
      //       id: 'Wazuh-App-Agents-vuls-Vulnerability-Most-common-CVEs',
      //       width: 25
      //     },
      //     {
      //       title: '警报演变：常用的软件包',
      //       id: 'Wazuh-App-Agents-vuls-evolution-affected-packages',
      //       width: 50
      //     },
      //     {
      //       title: '最常见的CWE',
      //       id: 'Wazuh-App-Agents-vuls-Most-common-CWEs',
      //       width: 25
      //     }
      //   ]
      // },
      // {
      //   height: 330,
      //   vis: [
      //     {
      //       title: '严重度分布',
      //       id: 'Wazuh-App-Agents-vuls-Vulnerability-severity-distribution',
      //       width: 25
      //     },
      //     {
      //       title: '受CVE影响最大的软件包',
      //       id: 'Wazuh-App-Agents-vuls-packages-CVEs',
      //       width: 75
      //     },
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-vuls-Alerts-summary'
          }
        ]
      }
    ]
  },
  virustotal: {
    rows: [
      {
        height: 250,
        vis: [
          {
            title: '上次扫描的文件',
            id: 'Wazuh-App-Agents-Virustotal-Last-Files-Pie',
            width: 25
          },
          {
            title: '恶意文件警告演变',
            id: 'Wazuh-App-Agents-Virustotal-Malicious-Evolution',
            width: 75
          }
        ]
      },
      {
        height: 570,
        vis: [
          {
            title: '近期的文件',
            id: 'Wazuh-App-Agents-Virustotal-Files-Table'
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-Virustotal-Alerts-summary'
          }
        ]
      }
    ]
  },
  osquery: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: '最常见的Osquery操作',
            id: 'Wazuh-App-Agents-Osquery-most-common-osquery-actions',
            width: 25
          },
          {
            title: 'Osquery事件随时间的演变',
            id: 'Wazuh-App-Agents-Osquery-Evolution',
            width: 75
          }
        ]
      },
      {
        height: 300,
        vis: [
          {
            title: '最常用的Osquery包',
            id: 'Wazuh-App-Agents-Osquery-top-5-packs-being-used',
            width: 25
          },
          {
            title: '最常见的规则',
            id: 'Wazuh-App-Agents-Osquery-monst-common-rules-being-fired',
            width: 75
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Overview-Osquery-Alerts-summary'
          }
        ]
      }
    ]
  },
  mitre: {
    rows: [
      {
        height: 360,
        vis: [
          {
            title: '随时间变化的警报',
            id: 'Wazuh-App-Agents-MITRE-Alerts-Evolution',
            width: 70
          },
          {
            title: 'Top 策略',
            id: 'Wazuh-App-Agents-MITRE-Top-Tactics',
            width: 30
          }
        ]
      },
      {
        height: 360,
        vis: [
          {
            title: '攻击规则级别',
            id: 'Wazuh-App-Agents-MITRE-Level-By-Attack',
            width: 33
          },
          {
            title: '通过策略进行MITRE攻击',
            id: 'Wazuh-App-Agents-MITRE-Attacks-By-Tactic',
            width: 34
          },
          {
            title: '按策略规则级别',
            id: 'Wazuh-App-Agents-MITRE-Level-By-Tactic',
            width: 34
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-MITRE-Alerts-summary'
          }
        ]
      }
    ]
  },
  docker: {
    rows: [
      {
        height: 300,
        vis: [
          {
            title: 'Top 5 图像',
            id: 'Wazuh-App-Agents-Docker-top-5-images',
            width: 25
          },
          {
            title: 'Top 5 事件',
            id: 'Wazuh-App-Agents-Docker-top-5-actions',
            width: 25
          },
          {
            title: '随时间推移的资源使用情况',
            id: 'Wazuh-App-Agents-Docker-Types-over-time',
            width: 50
          }
        ]
      },
      {
        height: 300,
        vis: [
          {
            title: '事件发生演变',
            id: 'Wazuh-App-Agents-Docker-Actions-over-time'
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-Docker-Events-summary'
          }
        ]
      }
    ]
  },
  oscap: {
    rows: [
      {
        height: 230,
        vis: [
          {
            title: 'Top 5 扫描',
            id: 'Wazuh-App-Agents-OSCAP-Scans',
            width: 25
          },
          {
            title: 'Top 5 配置',
            id: 'Wazuh-App-Agents-OSCAP-Profiles',
            width: 25
          },
          {
            title: 'Top 5 内容',
            id: 'Wazuh-App-Agents-OSCAP-Content',
            width: 25
          },
          {
            title: 'Top 5 严重性',
            id: 'Wazuh-App-Agents-OSCAP-Severity',
            width: 25
          }
        ]
      },
      {
        height: 230,
        vis: [
          {
            title: '每日扫描演变',
            id: 'Wazuh-App-Agents-OSCAP-Daily-scans-evolution'
          }
        ]
      },
      {
        height: 250,
        vis: [
          {
            title: 'Top 5 - 警报',
            id: 'Wazuh-App-Agents-OSCAP-Top-5-Alerts',
            width: 50
          },
          {
            title: 'Top 5 - 高风险警报',
            id: 'Wazuh-App-Agents-OSCAP-Top-5-High-risk-alerts',
            width: 50
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-OSCAP-Last-alerts'
          }
        ]
      }
    ]
  },
  ciscat: {
    rows: [
      {
        height: 320,
        vis: [
          {
            title: 'Top 5 CIS-CAT 组',
            id: 'Wazuh-app-Agents-CISCAT-top-5-groups',
            width: 60
          },
          {
            title: '扫描结果演变',
            id: 'Wazuh-app-Agents-CISCAT-scan-result-evolution',
            width: 40
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-app-Agents-CISCAT-alerts-summary'
          }
        ]
      }
    ]
  },
  pm: {
    rows: [
      // {
      //   height: 360,
      //   vis: [
      //     {
      //       title: '告警趋势',
      //       id: 'Wazuh-App-Agents-PM-Events-over-time',
      //       width: 100
      //     },
      //     // {
      //     //   title: '规则分配',
      //     //   id: 'Wazuh-App-Agents-PM-Top-5-rules',
      //     //   width: 50
      //     // }
      //   ]
      // },
      // {
      //   height: 360,
      //   vis: [
      //     {
      //       title: '告警分类',
      //       id: 'Wazuh-App-Agents-PM-Events-per-agent-evolution'
      //     }
      //   ]
      // },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-PM-Alerts-summary'
          }
        ]
      }
    ]
  },
  audit: {
    rows: [
      {
        height: 250,
        vis: [
          {
            title: '组',
            id: 'Wazuh-App-Agents-Audit-Groups',
            width: 33
          },
          {
            title: '指令',
            id: 'Wazuh-App-Agents-Audit-Commands',
            width: 33
          },
          {
            title: '文件',
            id: 'Wazuh-App-Agents-Audit-Files',
            width: 34
          }
        ]
      },
      {
        height: 310,
        vis: [
          {
            title: '随时间变化的警告',
            id: 'Wazuh-App-Agents-Audit-Alerts-over-time'
          }
        ]
      },
      {
        hide: true,
        vis: [
          {
            title: '警报总结',
            id: 'Wazuh-App-Agents-Audit-Last-alerts'
          }
        ]
      }
    ]
  }
};
