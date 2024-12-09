export const visualizations = {
  workbench: {
    rows: [
      {
        height: 360,
        vis: [
          {
            title: '代理漏洞分布',
            id: 'Workbench-Vuln-Agent-distribution',
            width: 50
          },
          {
            title: '漏洞软件分布',
            id: 'Workbench-Vuln-Software-distribution',
            width: 50
          }
        ]
      }
    ],
    rawVis: [
      {
        id: 'Workbench-Vuln-Agent-distribution',
        type: "visualization",
        _version: 1,
        attributes: {
          title: "代理漏洞分布",
          visState: "{\"title\":\"代理漏洞分布\",\"type\":\"histogram\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"agent.name\",\"orderBy\":\"custom\",\"orderAgg\":{\"id\":\"2-orderAgg\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"orderAgg\"},\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\",\"customLabel\":\"代理\"},\"schema\":\"segment\"},{\"id\":\"3\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"data.vulnerability.severity\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\",\"customLabel\":\"\"},\"schema\":\"group\"}],\"params\":{\"type\":\"histogram\",\"grid\":{\"categoryLines\":false},\"categoryAxes\":[{\"id\":\"CategoryAxis-1\",\"type\":\"category\",\"position\":\"bottom\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\"},\"labels\":{\"show\":true,\"filter\":true,\"truncate\":100,\"rotate\":0},\"title\":{}}],\"valueAxes\":[{\"id\":\"ValueAxis-1\",\"name\":\"LeftAxis-1\",\"type\":\"value\",\"position\":\"left\",\"show\":true,\"style\":{},\"scale\":{\"type\":\"linear\",\"mode\":\"normal\"},\"labels\":{\"show\":true,\"rotate\":0,\"filter\":false,\"truncate\":100},\"title\":{\"text\":\"数量\"}}],\"seriesParams\":[{\"show\":true,\"type\":\"histogram\",\"mode\":\"stacked\",\"data\":{\"label\":\"计数\",\"id\":\"1\"},\"valueAxis\":\"ValueAxis-1\",\"drawLinesBetweenPoints\":true,\"lineWidth\":2,\"showCircles\":true}],\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"times\":[],\"addTimeMarker\":false,\"labels\":{\"show\":true},\"thresholdLine\":{\"show\":false,\"value\":10,\"width\":1,\"style\":\"full\",\"color\":\"#E7664C\"},\"orderBucketsBySum\":true}}",
          uiStateJSON: '{}',
          description: '',
          version: 1,
          kibanaSavedObjectMeta: {
            searchSourceJSON: '{"index":"wazuh-alerts-*","filter":[],"query":{"query":"","language":"lucene"}}'
          }
        }
      },
      {
        id: 'Workbench-Vuln-Software-distribution',
        type: "visualization",
        _version: 1,
        attributes: {
          title: "漏洞软件分布",
          visState: "{\"title\":\"漏洞软件分布\",\"type\":\"pie\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"params\":{},\"schema\":\"metric\"},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"params\":{\"field\":\"data.vulnerability.package.name\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":5,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\",\"customLabel\":\"软件\"},\"schema\":\"segment\"}],\"params\":{\"type\":\"pie\",\"addTooltip\":true,\"addLegend\":true,\"legendPosition\":\"right\",\"isDonut\":true,\"labels\":{\"show\":false,\"values\":true,\"last_level\":true,\"truncate\":100}}}",
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
      'Workbench-Vuln-Agent-distribution': [],
      'Workbench-Vuln-Software-distribution': [],
    }
  }
}