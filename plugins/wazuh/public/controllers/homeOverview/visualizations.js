export const visualizations = {
  workbench: {
    rows: [
      {
        height: 360,
        vis: [
          {
            title: '威胁事件趋势分析',
            id: 'Workbench-Alert-Trend-analyse',
            width: 100
          },
        ]
      },
      {
        height: 360,
        vis: [
          {
            title: '攻击源分布图',
            id: 'Workbench-Attack-Source-distribution',
            width: 50
          },
          {
            title: '告警数量top5',
            id: 'Workbench-Alert-Agent-distribution',
            width: 50
          }
        ]
      },
      {
        height: 360,
        vis: [
          {
            title: '高危漏洞',
            id: 'Workbench-Alert-Vuln-statistical',
            width: 50
          },
          {
            title: '入侵威胁',
            id: 'Workbench-Alert-bruteForce-statistical',
            width: 50
          },
          {
            title: '病毒木马',
            id: 'Workbench-Alert-abnormalFile-statistical',
            width: 50
          },
        ]
      }
    ],
    rawVis: [
      {
        id: 'Workbench-Alert-Trend-analyse',
        type: "visualization",
        _version: 1,
        attributes: {
          title: "威胁事件趋势分析",
          visState: "{\"title\":\"威胁事件趋势分析\",\"type\":\"line\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{\"customLabel\":\"数量\"},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"params\":{\"field\":\"timestamp\",\"timeRange\":{\"from\":\"now-24h\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"h\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{},\"customLabel\":\"时间\"},\"schema\":\"segment\"}],\"params\":{\"type\":\"line\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"数量\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"line\",\"mode\":\"normal\",\"data\":{\"label\":\"数量\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"interpolate\":\"linear\",\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"labels\":{},\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"}}}",
          uiStateJSON: '{}',
          description: '',
          version: 1,
          kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"wazuh-alerts-*","filter":[],"query":{"query":"","language":"lucene"}}'
          }
        }
      },
      {
        id: 'Workbench-Attack-Source-distribution',
        type: "visualization",
        _version: 1,
        attributes: {
          title: "攻击源分布图",
          visState: "{\"title\":\"攻击源分布图\",\"type\":\"pie\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"data.srcip\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\"},\"schema\":\"segment\"}],\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true,\"labels\":{\"show\":false,\"values\":true,\"last_level\":true,\"truncate\":100}}}",
          uiStateJSON: '{}',
          description: '',
          version: 1,
          kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"wazuh-alerts-*","filter":[],"query":{"query":"","language":"lucene"}}'
          }
        }
      },
      {
        id: 'Workbench-Alert-Agent-distribution',
        type: "visualization",
        _version: 1,
        attributes: {
          title: "告警数量top5",
          visState: "{\"title\":\"告警数量top5\",\"type\":\"histogram\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{\"customLabel\":\"数量\"},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"params\":{\"field\":\"timestamp\",\"timeRange\":{\"from\":\"now-24h\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"h\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{},\"customLabel\":\"时间\"},\"schema\":\"segment\"},{\"id\":\"3\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"agent.ip\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"其他\",\"missingBucket\":false,\"missingBucketLabel\":\"缺失\",\"customLabel\":\"主机IP\"},\"schema\":\"group\"}],\"params\":{\"type\":\"histogram\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"数量\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"histogram\",\"mode\":\"stacked\",\"data\":{\"label\":\"数量\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"labels\":{\"show\":false},\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"}}}",
          uiStateJSON: '{}',
          description: '',
          version: 1,
          kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"wazuh-alerts-*","filter":[],"query":{"query":"","language":"lucene"}}'
          }
        }
      },
      {
        id: 'Workbench-Alert-Vuln-statistical',
        type: "visualization",
        _version: 1,
        attributes: {
          title: "高危漏洞",
          visState: "{\"title\":\"高危漏洞\",\"type\":\"pie\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"data.vulnerability.severity\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"其他\",\"missingBucket\":false,\"missingBucketLabel\":\"缺失\",\"customLabel\":\"严重程度\"},\"schema\":\"segment\"}],\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true,\"labels\":{\"show\":false,\"values\":true,\"last_level\":true,\"truncate\":100}}}",
          uiStateJSON: '{}',
          description: '',
          version: 1,
          kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"wazuh-alerts-*","filter":[],"query":{"query":"","language":"lucene"}}'
          }
        }
      },
      {
        id: 'Workbench-Alert-bruteForce-statistical',
        type: "visualization",
        _version: 1,
        attributes: {
          title: "入侵威胁",
          visState: "{\"title\":\"入侵威胁\",\"type\":\"histogram\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{\"customLabel\":\"数量\"},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"params\":{\"field\":\"timestamp\",\"timeRange\":{\"from\":\"now-24h\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"h\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{},\"customLabel\":\"时间\"},\"schema\":\"segment\"}],\"params\":{\"type\":\"histogram\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"数量\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"histogram\",\"mode\":\"stacked\",\"data\":{\"label\":\"数量\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"labels\":{\"show\":false},\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"}}}",
          uiStateJSON: '{}',
          description: '',
          version: 1,
          kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"wazuh-alerts-*","filter":[],"query":{"query":"","language":"lucene"}}'
          }
        }
      },
      {
        id: 'Workbench-Alert-abnormalFile-statistical',
        type: "visualization",
        _version: 1,
        attributes: {
          title: "病毒木马",
          visState: "{\"title\":\"病毒木马\",\"type\":\"histogram\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{\"customLabel\":\"数量\"},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"date_histogram\",\"params\":{\"field\":\"timestamp\",\"timeRange\":{\"from\":\"now-24h\",\"to\":\"now\"},\"useNormalizedEsInterval\":true,\"scaleMetricValues\":false,\"interval\":\"h\",\"drop_partials\":false,\"min_doc_count\":1,\"extended_bounds\":{},\"customLabel\":\"时间\"},\"schema\":\"segment\"}],\"params\":{\"type\":\"histogram\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"数量\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"histogram\",\"mode\":\"stacked\",\"data\":{\"label\":\"数量\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"labels\":{\"show\":false},\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"}}}",
          uiStateJSON: '{}',
          description: '',
          version: 1,
          kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"wazuh-alerts-*","filter":[],"query":{"query":"","language":"lucene"}}'
          }
        }
      }
    ],
    searchSource: {
      'Workbench-Alert-Trend-analyse': [],
      'Workbench-Attack-Source-distribution': [],
      'Workbench-Alert-Agent-distribution': [],
      'Workbench-Alert-Vuln-statistical': [
        {
          type: 'phraseFilter', // phrasesFilter => 属于 类型筛选, phraseFilter => 是 类型筛选
          params: {
            name: 'rule.groups',
            params: 'vulnerability-detector' // 属于 类型筛选为数组，是 类型筛选为字符串
          }
        },
      ],
      'Workbench-Alert-bruteForce-statistical': [
        {
          type: 'phrasesFilter',
          params: {
            name: 'rule.id',
            params: ['5720', '5551', '5712', '60122', '60204']
          }
        },
      ],
      'Workbench-Alert-abnormalFile-statistical': [
        {
          type: 'phrasesFilter',
          params: {
            name: 'rule.id',
            params: ['552', '100020', '100021', '100022', '100023']
          }
        },
      ]
    }
  }
}