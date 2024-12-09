"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Wazuh app - Module for Overview/Vulnerabilities visualizations
 * Copyright (C) 2015-2021 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
var _default = [{
  _id: 'Wazuh-App-Overview-vuls-Alerts-severity',
  _type: 'visualization',
  _source: {
    title: 'Severity count',
    visState: '{"title":"Alerts by action over time","type":"area","params":{"type":"area","grid":{"categoryLines":true,"style":{"color":"#eee"},"valueAxis":"ValueAxis-1"},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"数量"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"cardinal","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","timeRange":{"from":"now-24h","to":"now","mode":"quick"},"useNormalizedEsInterval":true,"interval":"auto","time_zone":"Europe/Berlin","drop_partials":false,"customInterval":"2h","min_doc_count":1,"extended_bounds":{}}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"data.vulnerability.severity","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-Alert-summary',
  _type: 'visualization',
  _source: {
    title: 'Alert summary',
    visState: '{"title":"vulnerability","type":"table","params":{"perPage":10,"showPartialRows":false,"showMetricsAtAllLevels":false,"sort":{"columnIndex":4,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.vulnerability.severity","size":5,"order":"asc","orderBy":"_key","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Severity"}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.vulnerability.title","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Title"}},{"id":"6","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.vulnerability.published","size":2,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Published"}},{"id":"5","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.vulnerability.cve","size":1,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"CVE"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":4,"direction":"desc"}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-Commonly-affected-packages',
  _type: 'visualization',
  _source: {
    title: 'Commonly affected packages',
    visState: '{"title":"Commonly affected packages","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.vulnerability.package.name","size":5,"order":"desc","orderBy":"1","customLabel":"Affected package"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-top-CVEs',
  _type: 'visualization',
  _source: {
    title: 'Top CVEs',
    visState: '{"type":"table","aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.vulnerability.cve","orderBy":"1","order":"desc","size":50,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"CVE"}}],"params":{"perPage":5,"showPartialRows":false,"showMetricsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum","percentageCol":"","row":true},"title":"CVE table"}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-Most-common-CVEs',
  _type: 'visualization',
  _source: {
    title: 'Most common CVEs',
    visState: '{"title":"Most common CVEs","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.vulnerability.cve","size":5,"order":"desc","orderBy":"1","customLabel":"CVE"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-packages-CVEs',
  _type: 'visualization',
  _source: {
    title: 'Top affected packages by CVEs',
    visState: '{"type":"histogram","mode":"stacked","aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.vulnerability.cve","orderBy":"1","order":"desc","size":10,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"data.vulnerability.package.name","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}],"params":{"type":"area","grid":{"categoryLines":false},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"filter":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"数量"}}],"seriesParams":[{"show":true,"type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"drawLinesBetweenPoints":true,"lineWidth":2,"showCircles":true,"interpolate":"linear","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false,"thresholdLine":{"show":false,"value":10,"width":1,"style":"full","color":"#E7664C"},"labels":{}},"title":"top packages by CVE"}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-agents-severities',
  _type: 'visualization',
  _source: {
    title: 'Agents by severity',
    visState: '{"type":"heatmap","aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"agent.name","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing", "customLabel": " "}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"data.vulnerability.severity","orderBy":"1","order":"desc","size":5,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}],"params":{"type":"heatmap","addTooltip":true,"addLegend":true,"enableHover":false,"legendPosition":"right","times":[],"colorsNumber":4,"colorSchema":"Greens","setColorRange":false,"colorsRange":[],"invertColors":false,"percentageMode":false,"valueAxes":[{"show":false,"id":"ValueAxis-1","type":"value","scale":{"type":"linear","defaultYExtents":false},"labels":{"show":false,"rotate":0,"overwriteColor":false,"color":"black"}}]},"title":"Agents by severity"}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-top-CWEs',
  _type: 'visualization',
  _source: {
    title: 'Top CWEs',
    visState: '{"type":"table","aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.vulnerability.cwe_reference","orderBy":"1","order":"desc","size":50,"otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"CWE"}}],"params":{"perPage":5,"showPartialRows":false,"showMetricsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum","percentageCol":"","row":true},"title":"CWE table"}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-Most-common-CWEs',
  _type: 'visualization',
  _source: {
    title: 'Most common CWEs',
    visState: '{"title":"Most common CWEs","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.vulnerability.cwe_reference","size":5,"order":"desc","orderBy":"1","customLabel":"Severity"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-Metric-Critical-severity',
  _type: 'visualization',
  _source: {
    title: 'Metric Critical severity',
    visState: '{"title":"Metric Critical severity","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"metric","metric":{"percentageMode":false,"useRanges":false,"colorSchema":"Green to Red","metricColorMode":"None","colorsRange":[{"from":0,"to":10000}],"labels":{"show":true},"invertColors":false,"style":{"bgFill":"#000","bgColor":false,"labelColor":false,"subText":"","fontSize":20}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Critical severity alerts"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: `{
                    "index":"wazuh-alerts",
                    "filter":[
                        {
                            "meta": {
                              "index": "wazuh-alerts",
                              "negate": false,
                              "disabled": false,
                              "alias": null,
                              "type": "phrase",
                              "key": "data.vulnerability.severity",
                              "value": "Critical",
                              "params": {
                                "query": "Critical",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.vulnerability.severity": {
                                  "query": "Critical",
                                  "type": "phrase"
                                }
                              }
                            },
                            "$state": {
                              "store": "appState"
                            }
                        }
                    ],
                    "query":{"query":"","language":"lucene"}
                }`
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-Metric-High-severity',
  _type: 'visualization',
  _source: {
    title: 'Metric High severity',
    visState: '{"title":"Metric High severity","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"metric","metric":{"percentageMode":false,"useRanges":false,"colorSchema":"Green to Red","metricColorMode":"None","colorsRange":[{"from":0,"to":10000}],"labels":{"show":true},"invertColors":false,"style":{"bgFill":"#000","bgColor":false,"labelColor":false,"subText":"","fontSize":20}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"High severity alerts"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: `{
                    "index":"wazuh-alerts",
                    "filter":[
                        {
                            "meta": {
                              "index": "wazuh-alerts",
                              "negate": false,
                              "disabled": false,
                              "alias": null,
                              "type": "phrase",
                              "key": "data.vulnerability.severity",
                              "value": "High",
                              "params": {
                                "query": "High",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.vulnerability.severity": {
                                  "query": "High",
                                  "type": "phrase"
                                }
                              }
                            },
                            "$state": {
                              "store": "appState"
                            }
                        }
                    ],
                    "query":{"query":"","language":"lucene"}
                }`
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-Metric-Medium-severity',
  _type: 'visualization',
  _source: {
    title: 'Metric Medium severity',
    visState: '{"title":"Metric Medium severity","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"metric","metric":{"percentageMode":false,"useRanges":false,"colorSchema":"Green to Red","metricColorMode":"None","colorsRange":[{"from":0,"to":10000}],"labels":{"show":true},"invertColors":false,"style":{"bgFill":"#000","bgColor":false,"labelColor":false,"subText":"","fontSize":20}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Medium severity alerts"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: `{
                    "index":"wazuh-alerts",
                    "filter":[
                        {
                            "meta": {
                              "index": "wazuh-alerts",
                              "negate": false,
                              "disabled": false,
                              "alias": null,
                              "type": "phrase",
                              "key": "data.vulnerability.severity",
                              "value": "Medium",
                              "params": {
                                "query": "Medium",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.vulnerability.severity": {
                                  "query": "Medium",
                                  "type": "phrase"
                                }
                              }
                            },
                            "$state": {
                              "store": "appState"
                            }
                        }
                    ],
                    "query":{"query":"","language":"lucene"}
                }`
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-Metric-Low-severity',
  _type: 'visualization',
  _source: {
    title: 'Metric Low severity',
    visState: '{"title":"Metric Low severity","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"metric","metric":{"percentageMode":false,"useRanges":false,"colorSchema":"Green to Red","metricColorMode":"None","colorsRange":[{"from":0,"to":10000}],"labels":{"show":true},"invertColors":false,"style":{"bgFill":"#000","bgColor":false,"labelColor":false,"subText":"","fontSize":20}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Low severity alerts"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: `{
                    "index":"wazuh-alerts",
                    "filter":[
                        {
                            "meta": {
                              "index": "wazuh-alerts",
                              "negate": false,
                              "disabled": false,
                              "alias": null,
                              "type": "phrase",
                              "key": "data.vulnerability.severity",
                              "value": "Low",
                              "params": {
                                "query": "Low",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.vulnerability.severity": {
                                  "query": "Low",
                                  "type": "phrase"
                                }
                              }
                            },
                            "$state": {
                              "store": "appState"
                            }
                        }
                    ],
                    "query":{"query":"","language":"lucene"}
                }`
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-Most-affected-agents',
  _type: 'visualization',
  _source: {
    title: 'Most affected agents',
    visState: '{"title":"Most affected agents","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"agent.name","size":5,"order":"desc","orderBy":"1","customLabel":"Affected agent"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-Vulnerability-severity-distribution',
  _type: 'visualization',
  _source: {
    title: 'Severity distribution',
    visState: '{"title":"Severity distribution","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.vulnerability.severity","size":5,"order":"desc","orderBy":"1","customLabel":"Severity"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-vuls-Vulnerability-evolution-affected-packages',
  _type: 'visualization',
  _source: {
    title: 'TOP affected packages alerts Evolution',
    visState: '{"title":"TOP affected packages alerts Evolution","type":"histogram","params":{"type":"histogram","grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"数量"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"data.vulnerability.package.name","size":5,"order":"desc","orderBy":"1"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{}}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}];
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm92ZXJ2aWV3LXZ1bHMudHMiXSwibmFtZXMiOlsiX2lkIiwiX3R5cGUiLCJfc291cmNlIiwidGl0bGUiLCJ2aXNTdGF0ZSIsInVpU3RhdGVKU09OIiwiZGVzY3JpcHRpb24iLCJ2ZXJzaW9uIiwia2liYW5hU2F2ZWRPYmplY3RNZXRhIiwic2VhcmNoU291cmNlSlNPTiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7Ozs7OztlQVdlLENBQ2I7QUFDRUEsRUFBQUEsR0FBRyxFQUFFLHlDQURQO0FBRUVDLEVBQUFBLEtBQUssRUFBRSxlQUZUO0FBR0VDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsZ0JBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLHcrQ0FISztBQUlQQyxJQUFBQSxXQUFXLEVBQUUsSUFKTjtBQUtQQyxJQUFBQSxXQUFXLEVBQUUsRUFMTjtBQU1QQyxJQUFBQSxPQUFPLEVBQUUsQ0FORjtBQU9QQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQ2Q7QUFGbUI7QUFQaEI7QUFIWCxDQURhLEVBaUJiO0FBQ0VULEVBQUFBLEdBQUcsRUFBRSx1Q0FEUDtBQUVFQyxFQUFBQSxLQUFLLEVBQUUsZUFGVDtBQUdFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLGVBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLHkwQ0FISztBQUlQQyxJQUFBQSxXQUFXLEVBQ1Qsa0VBTEs7QUFNUEMsSUFBQUEsV0FBVyxFQUFFLEVBTk47QUFPUEMsSUFBQUEsT0FBTyxFQUFFLENBUEY7QUFRUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUNkO0FBRm1CO0FBUmhCO0FBSFgsQ0FqQmEsRUFrQ2I7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLG9EQURQO0FBRUVDLEVBQUFBLEtBQUssRUFBRSxlQUZUO0FBR0VDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFL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LE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsdUJBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLHNkQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFBRSxJQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVBoQjtBQUhYLENBMVZhLEVBMFdiO0FBQ0VULEVBQUFBLEdBQUcsRUFBRSxtRUFEUDtBQUVFQyxFQUFBQSxLQUFLLEVBQUUsZUFGVDtBQUdFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLHdDQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTix1dUNBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLElBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUNkO0FBRm1CO0FBUGhCO0FBSFgsQ0ExV2EsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBXYXp1aCBhcHAgLSBNb2R1bGUgZm9yIE92ZXJ2aWV3L1Z1bG5lcmFiaWxpdGllcyB2aXN1YWxpemF0aW9uc1xuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IFtcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy12dWxzLUFsZXJ0cy1zZXZlcml0eScsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1NldmVyaXR5IGNvdW50JyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkFsZXJ0cyBieSBhY3Rpb24gb3ZlciB0aW1lXCIsXCJ0eXBlXCI6XCJhcmVhXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJhcmVhXCIsXCJncmlkXCI6e1wiY2F0ZWdvcnlMaW5lc1wiOnRydWUsXCJzdHlsZVwiOntcImNvbG9yXCI6XCIjZWVlXCJ9LFwidmFsdWVBeGlzXCI6XCJWYWx1ZUF4aXMtMVwifSxcImNhdGVnb3J5QXhlc1wiOlt7XCJpZFwiOlwiQ2F0ZWdvcnlBeGlzLTFcIixcInR5cGVcIjpcImNhdGVnb3J5XCIsXCJwb3NpdGlvblwiOlwiYm90dG9tXCIsXCJzaG93XCI6dHJ1ZSxcInN0eWxlXCI6e30sXCJzY2FsZVwiOntcInR5cGVcIjpcImxpbmVhclwifSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwidHJ1bmNhdGVcIjoxMDB9LFwidGl0bGVcIjp7fX1dLFwidmFsdWVBeGVzXCI6W3tcImlkXCI6XCJWYWx1ZUF4aXMtMVwiLFwibmFtZVwiOlwiTGVmdEF4aXMtMVwiLFwidHlwZVwiOlwidmFsdWVcIixcInBvc2l0aW9uXCI6XCJsZWZ0XCIsXCJzaG93XCI6dHJ1ZSxcInN0eWxlXCI6e30sXCJzY2FsZVwiOntcInR5cGVcIjpcImxpbmVhclwiLFwibW9kZVwiOlwibm9ybWFsXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJyb3RhdGVcIjowLFwiZmlsdGVyXCI6ZmFsc2UsXCJ0cnVuY2F0ZVwiOjEwMH0sXCJ0aXRsZVwiOntcInRleHRcIjpcIkNvdW50XCJ9fV0sXCJzZXJpZXNQYXJhbXNcIjpbe1wic2hvd1wiOlwidHJ1ZVwiLFwidHlwZVwiOlwiYXJlYVwiLFwibW9kZVwiOlwic3RhY2tlZFwiLFwiZGF0YVwiOntcImxhYmVsXCI6XCJDb3VudFwiLFwiaWRcIjpcIjFcIn0sXCJkcmF3TGluZXNCZXR3ZWVuUG9pbnRzXCI6dHJ1ZSxcInNob3dDaXJjbGVzXCI6dHJ1ZSxcImludGVycG9sYXRlXCI6XCJjYXJkaW5hbFwiLFwidmFsdWVBeGlzXCI6XCJWYWx1ZUF4aXMtMVwifV0sXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcInRpbWVzXCI6W10sXCJhZGRUaW1lTWFya2VyXCI6ZmFsc2V9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJkYXRlX2hpc3RvZ3JhbVwiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwidGltZXN0YW1wXCIsXCJ0aW1lUmFuZ2VcIjp7XCJmcm9tXCI6XCJub3ctMjRoXCIsXCJ0b1wiOlwibm93XCIsXCJtb2RlXCI6XCJxdWlja1wifSxcInVzZU5vcm1hbGl6ZWRFc0ludGVydmFsXCI6dHJ1ZSxcImludGVydmFsXCI6XCJhdXRvXCIsXCJ0aW1lX3pvbmVcIjpcIkV1cm9wZS9CZXJsaW5cIixcImRyb3BfcGFydGlhbHNcIjpmYWxzZSxcImN1c3RvbUludGVydmFsXCI6XCIyaFwiLFwibWluX2RvY19jb3VudFwiOjEsXCJleHRlbmRlZF9ib3VuZHNcIjp7fX19LHtcImlkXCI6XCIzXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImdyb3VwXCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LnNldmVyaXR5XCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy12dWxzLUFsZXJ0LXN1bW1hcnknLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdBbGVydCBzdW1tYXJ5JyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcInZ1bG5lcmFiaWxpdHlcIixcInR5cGVcIjpcInRhYmxlXCIsXCJwYXJhbXNcIjp7XCJwZXJQYWdlXCI6MTAsXCJzaG93UGFydGlhbFJvd3NcIjpmYWxzZSxcInNob3dNZXRyaWNzQXRBbGxMZXZlbHNcIjpmYWxzZSxcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOjQsXCJkaXJlY3Rpb25cIjpcImRlc2NcIn0sXCJzaG93VG90YWxcIjpmYWxzZSxcInRvdGFsRnVuY1wiOlwic3VtXCJ9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLnZ1bG5lcmFiaWxpdHkuc2V2ZXJpdHlcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImFzY1wiLFwib3JkZXJCeVwiOlwiX2tleVwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIixcImN1c3RvbUxhYmVsXCI6XCJTZXZlcml0eVwifX0se1wiaWRcIjpcIjNcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LnRpdGxlXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwiY3VzdG9tTGFiZWxcIjpcIlRpdGxlXCJ9fSx7XCJpZFwiOlwiNlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLnZ1bG5lcmFiaWxpdHkucHVibGlzaGVkXCIsXCJzaXplXCI6MixcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwiY3VzdG9tTGFiZWxcIjpcIlB1Ymxpc2hlZFwifX0se1wiaWRcIjpcIjVcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LmN2ZVwiLFwic2l6ZVwiOjEsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIixcImN1c3RvbUxhYmVsXCI6XCJDVkVcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046XG4gICAgICAgICd7XCJ2aXNcIjp7XCJwYXJhbXNcIjp7XCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjo0LFwiZGlyZWN0aW9uXCI6XCJkZXNjXCJ9fX19JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy12dWxzLUNvbW1vbmx5LWFmZmVjdGVkLXBhY2thZ2VzJyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnQ29tbW9ubHkgYWZmZWN0ZWQgcGFja2FnZXMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiQ29tbW9ubHkgYWZmZWN0ZWQgcGFja2FnZXNcIixcInR5cGVcIjpcInBpZVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwicGllXCIsXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcImlzRG9udXRcIjp0cnVlLFwibGFiZWxzXCI6e1wic2hvd1wiOmZhbHNlLFwidmFsdWVzXCI6dHJ1ZSxcImxhc3RfbGV2ZWxcIjp0cnVlLFwidHJ1bmNhdGVcIjoxMDB9fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEudnVsbmVyYWJpbGl0eS5wYWNrYWdlLm5hbWVcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcImN1c3RvbUxhYmVsXCI6XCJBZmZlY3RlZCBwYWNrYWdlXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLU92ZXJ2aWV3LXZ1bHMtdG9wLUNWRXMnLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdUb3AgQ1ZFcycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInR5cGVcIjpcInRhYmxlXCIsXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEudnVsbmVyYWJpbGl0eS5jdmVcIixcIm9yZGVyQnlcIjpcIjFcIixcIm9yZGVyXCI6XCJkZXNjXCIsXCJzaXplXCI6NTAsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwiY3VzdG9tTGFiZWxcIjpcIkNWRVwifX1dLFwicGFyYW1zXCI6e1wicGVyUGFnZVwiOjUsXCJzaG93UGFydGlhbFJvd3NcIjpmYWxzZSxcInNob3dNZXRyaWNzQXRBbGxMZXZlbHNcIjpmYWxzZSxcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOm51bGwsXCJkaXJlY3Rpb25cIjpudWxsfSxcInNob3dUb3RhbFwiOmZhbHNlLFwidG90YWxGdW5jXCI6XCJzdW1cIixcInBlcmNlbnRhZ2VDb2xcIjpcIlwiLFwicm93XCI6dHJ1ZX0sXCJ0aXRsZVwiOlwiQ1ZFIHRhYmxlXCJ9JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLU92ZXJ2aWV3LXZ1bHMtTW9zdC1jb21tb24tQ1ZFcycsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01vc3QgY29tbW9uIENWRXMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTW9zdCBjb21tb24gQ1ZFc1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWUsXCJsYWJlbHNcIjp7XCJzaG93XCI6ZmFsc2UsXCJ2YWx1ZXNcIjp0cnVlLFwibGFzdF9sZXZlbFwiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LmN2ZVwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIkNWRVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy12dWxzLXBhY2thZ2VzLUNWRXMnLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdUb3AgYWZmZWN0ZWQgcGFja2FnZXMgYnkgQ1ZFcycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInR5cGVcIjpcImhpc3RvZ3JhbVwiLFwibW9kZVwiOlwic3RhY2tlZFwiLFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LmN2ZVwiLFwib3JkZXJCeVwiOlwiMVwiLFwib3JkZXJcIjpcImRlc2NcIixcInNpemVcIjoxMCxcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCJ9fSx7XCJpZFwiOlwiM1wiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJncm91cFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEudnVsbmVyYWJpbGl0eS5wYWNrYWdlLm5hbWVcIixcIm9yZGVyQnlcIjpcIjFcIixcIm9yZGVyXCI6XCJkZXNjXCIsXCJzaXplXCI6NSxcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCJ9fV0sXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJhcmVhXCIsXCJncmlkXCI6e1wiY2F0ZWdvcnlMaW5lc1wiOmZhbHNlfSxcImNhdGVnb3J5QXhlc1wiOlt7XCJpZFwiOlwiQ2F0ZWdvcnlBeGlzLTFcIixcInR5cGVcIjpcImNhdGVnb3J5XCIsXCJwb3NpdGlvblwiOlwiYm90dG9tXCIsXCJzaG93XCI6dHJ1ZSxcInN0eWxlXCI6e30sXCJzY2FsZVwiOntcInR5cGVcIjpcImxpbmVhclwifSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwiZmlsdGVyXCI6dHJ1ZSxcInRydW5jYXRlXCI6MTAwfSxcInRpdGxlXCI6e319XSxcInZhbHVlQXhlc1wiOlt7XCJpZFwiOlwiVmFsdWVBeGlzLTFcIixcIm5hbWVcIjpcIkxlZnRBeGlzLTFcIixcInR5cGVcIjpcInZhbHVlXCIsXCJwb3NpdGlvblwiOlwibGVmdFwiLFwic2hvd1wiOnRydWUsXCJzdHlsZVwiOnt9LFwic2NhbGVcIjp7XCJ0eXBlXCI6XCJsaW5lYXJcIixcIm1vZGVcIjpcIm5vcm1hbFwifSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwicm90YXRlXCI6MCxcImZpbHRlclwiOmZhbHNlLFwidHJ1bmNhdGVcIjoxMDB9LFwidGl0bGVcIjp7XCJ0ZXh0XCI6XCJDb3VudFwifX1dLFwic2VyaWVzUGFyYW1zXCI6W3tcInNob3dcIjp0cnVlLFwidHlwZVwiOlwiaGlzdG9ncmFtXCIsXCJtb2RlXCI6XCJzdGFja2VkXCIsXCJkYXRhXCI6e1wibGFiZWxcIjpcIkNvdW50XCIsXCJpZFwiOlwiMVwifSxcImRyYXdMaW5lc0JldHdlZW5Qb2ludHNcIjp0cnVlLFwibGluZVdpZHRoXCI6MixcInNob3dDaXJjbGVzXCI6dHJ1ZSxcImludGVycG9sYXRlXCI6XCJsaW5lYXJcIixcInZhbHVlQXhpc1wiOlwiVmFsdWVBeGlzLTFcIn1dLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJ0aW1lc1wiOltdLFwiYWRkVGltZU1hcmtlclwiOmZhbHNlLFwidGhyZXNob2xkTGluZVwiOntcInNob3dcIjpmYWxzZSxcInZhbHVlXCI6MTAsXCJ3aWR0aFwiOjEsXCJzdHlsZVwiOlwiZnVsbFwiLFwiY29sb3JcIjpcIiNFNzY2NENcIn0sXCJsYWJlbHNcIjp7fX0sXCJ0aXRsZVwiOlwidG9wIHBhY2thZ2VzIGJ5IENWRVwifScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy12dWxzLWFnZW50cy1zZXZlcml0aWVzJyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnQWdlbnRzIGJ5IHNldmVyaXR5JyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widHlwZVwiOlwiaGVhdG1hcFwiLFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiYWdlbnQubmFtZVwiLFwib3JkZXJCeVwiOlwiMVwiLFwib3JkZXJcIjpcImRlc2NcIixcInNpemVcIjo1LFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIiwgXCJjdXN0b21MYWJlbFwiOiBcIiBcIn19LHtcImlkXCI6XCIzXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImdyb3VwXCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LnNldmVyaXR5XCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJvcmRlclwiOlwiZGVzY1wiLFwic2l6ZVwiOjUsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wifX1dLFwicGFyYW1zXCI6e1widHlwZVwiOlwiaGVhdG1hcFwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwiZW5hYmxlSG92ZXJcIjpmYWxzZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwidGltZXNcIjpbXSxcImNvbG9yc051bWJlclwiOjQsXCJjb2xvclNjaGVtYVwiOlwiR3JlZW5zXCIsXCJzZXRDb2xvclJhbmdlXCI6ZmFsc2UsXCJjb2xvcnNSYW5nZVwiOltdLFwiaW52ZXJ0Q29sb3JzXCI6ZmFsc2UsXCJwZXJjZW50YWdlTW9kZVwiOmZhbHNlLFwidmFsdWVBeGVzXCI6W3tcInNob3dcIjpmYWxzZSxcImlkXCI6XCJWYWx1ZUF4aXMtMVwiLFwidHlwZVwiOlwidmFsdWVcIixcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCIsXCJkZWZhdWx0WUV4dGVudHNcIjpmYWxzZX0sXCJsYWJlbHNcIjp7XCJzaG93XCI6ZmFsc2UsXCJyb3RhdGVcIjowLFwib3ZlcndyaXRlQ29sb3JcIjpmYWxzZSxcImNvbG9yXCI6XCJibGFja1wifX1dfSxcInRpdGxlXCI6XCJBZ2VudHMgYnkgc2V2ZXJpdHlcIn0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctdnVscy10b3AtQ1dFcycsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1RvcCBDV0VzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widHlwZVwiOlwidGFibGVcIixcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LmN3ZV9yZWZlcmVuY2VcIixcIm9yZGVyQnlcIjpcIjFcIixcIm9yZGVyXCI6XCJkZXNjXCIsXCJzaXplXCI6NTAsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwiY3VzdG9tTGFiZWxcIjpcIkNXRVwifX1dLFwicGFyYW1zXCI6e1wicGVyUGFnZVwiOjUsXCJzaG93UGFydGlhbFJvd3NcIjpmYWxzZSxcInNob3dNZXRyaWNzQXRBbGxMZXZlbHNcIjpmYWxzZSxcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOm51bGwsXCJkaXJlY3Rpb25cIjpudWxsfSxcInNob3dUb3RhbFwiOmZhbHNlLFwidG90YWxGdW5jXCI6XCJzdW1cIixcInBlcmNlbnRhZ2VDb2xcIjpcIlwiLFwicm93XCI6dHJ1ZX0sXCJ0aXRsZVwiOlwiQ1dFIHRhYmxlXCJ9JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLU92ZXJ2aWV3LXZ1bHMtTW9zdC1jb21tb24tQ1dFcycsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01vc3QgY29tbW9uIENXRXMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTW9zdCBjb21tb24gQ1dFc1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWUsXCJsYWJlbHNcIjp7XCJzaG93XCI6ZmFsc2UsXCJ2YWx1ZXNcIjp0cnVlLFwibGFzdF9sZXZlbFwiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LmN3ZV9yZWZlcmVuY2VcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcImN1c3RvbUxhYmVsXCI6XCJTZXZlcml0eVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy12dWxzLU1ldHJpYy1Dcml0aWNhbC1zZXZlcml0eScsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01ldHJpYyBDcml0aWNhbCBzZXZlcml0eScsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJNZXRyaWMgQ3JpdGljYWwgc2V2ZXJpdHlcIixcInR5cGVcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjpmYWxzZSxcInR5cGVcIjpcIm1ldHJpY1wiLFwibWV0cmljXCI6e1wicGVyY2VudGFnZU1vZGVcIjpmYWxzZSxcInVzZVJhbmdlc1wiOmZhbHNlLFwiY29sb3JTY2hlbWFcIjpcIkdyZWVuIHRvIFJlZFwiLFwibWV0cmljQ29sb3JNb2RlXCI6XCJOb25lXCIsXCJjb2xvcnNSYW5nZVwiOlt7XCJmcm9tXCI6MCxcInRvXCI6MTAwMDB9XSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlfSxcImludmVydENvbG9yc1wiOmZhbHNlLFwic3R5bGVcIjp7XCJiZ0ZpbGxcIjpcIiMwMDBcIixcImJnQ29sb3JcIjpmYWxzZSxcImxhYmVsQ29sb3JcIjpmYWxzZSxcInN1YlRleHRcIjpcIlwiLFwiZm9udFNpemVcIjoyMH19fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJjdXN0b21MYWJlbFwiOlwiQ3JpdGljYWwgc2V2ZXJpdHkgYWxlcnRzXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOiBge1xuICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWx0ZXJcIjpbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJkYXRhLnZ1bG5lcmFiaWxpdHkuc2V2ZXJpdHlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJDcml0aWNhbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiQ3JpdGljYWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS52dWxuZXJhYmlsaXR5LnNldmVyaXR5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiQ3JpdGljYWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn1cbiAgICAgICAgICAgICAgICB9YFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy12dWxzLU1ldHJpYy1IaWdoLXNldmVyaXR5JyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnTWV0cmljIEhpZ2ggc2V2ZXJpdHknLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTWV0cmljIEhpZ2ggc2V2ZXJpdHlcIixcInR5cGVcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjpmYWxzZSxcInR5cGVcIjpcIm1ldHJpY1wiLFwibWV0cmljXCI6e1wicGVyY2VudGFnZU1vZGVcIjpmYWxzZSxcInVzZVJhbmdlc1wiOmZhbHNlLFwiY29sb3JTY2hlbWFcIjpcIkdyZWVuIHRvIFJlZFwiLFwibWV0cmljQ29sb3JNb2RlXCI6XCJOb25lXCIsXCJjb2xvcnNSYW5nZVwiOlt7XCJmcm9tXCI6MCxcInRvXCI6MTAwMDB9XSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlfSxcImludmVydENvbG9yc1wiOmZhbHNlLFwic3R5bGVcIjp7XCJiZ0ZpbGxcIjpcIiMwMDBcIixcImJnQ29sb3JcIjpmYWxzZSxcImxhYmVsQ29sb3JcIjpmYWxzZSxcInN1YlRleHRcIjpcIlwiLFwiZm9udFNpemVcIjoyMH19fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJjdXN0b21MYWJlbFwiOlwiSGlnaCBzZXZlcml0eSBhbGVydHNcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcImRhdGEudnVsbmVyYWJpbGl0eS5zZXZlcml0eVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcIkhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS52dWxuZXJhYmlsaXR5LnNldmVyaXR5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiSGlnaFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLU92ZXJ2aWV3LXZ1bHMtTWV0cmljLU1lZGl1bS1zZXZlcml0eScsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01ldHJpYyBNZWRpdW0gc2V2ZXJpdHknLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTWV0cmljIE1lZGl1bSBzZXZlcml0eVwiLFwidHlwZVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOmZhbHNlLFwidHlwZVwiOlwibWV0cmljXCIsXCJtZXRyaWNcIjp7XCJwZXJjZW50YWdlTW9kZVwiOmZhbHNlLFwidXNlUmFuZ2VzXCI6ZmFsc2UsXCJjb2xvclNjaGVtYVwiOlwiR3JlZW4gdG8gUmVkXCIsXCJtZXRyaWNDb2xvck1vZGVcIjpcIk5vbmVcIixcImNvbG9yc1JhbmdlXCI6W3tcImZyb21cIjowLFwidG9cIjoxMDAwMH1dLFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWV9LFwiaW52ZXJ0Q29sb3JzXCI6ZmFsc2UsXCJzdHlsZVwiOntcImJnRmlsbFwiOlwiIzAwMFwiLFwiYmdDb2xvclwiOmZhbHNlLFwibGFiZWxDb2xvclwiOmZhbHNlLFwic3ViVGV4dFwiOlwiXCIsXCJmb250U2l6ZVwiOjIwfX19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImN1c3RvbUxhYmVsXCI6XCJNZWRpdW0gc2V2ZXJpdHkgYWxlcnRzXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOiBge1xuICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWx0ZXJcIjpbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJkYXRhLnZ1bG5lcmFiaWxpdHkuc2V2ZXJpdHlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJNZWRpdW1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcIk1lZGl1bVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLnZ1bG5lcmFiaWxpdHkuc2V2ZXJpdHlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJNZWRpdW1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn1cbiAgICAgICAgICAgICAgICB9YFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy12dWxzLU1ldHJpYy1Mb3ctc2V2ZXJpdHknLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdNZXRyaWMgTG93IHNldmVyaXR5JyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIk1ldHJpYyBMb3cgc2V2ZXJpdHlcIixcInR5cGVcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjpmYWxzZSxcInR5cGVcIjpcIm1ldHJpY1wiLFwibWV0cmljXCI6e1wicGVyY2VudGFnZU1vZGVcIjpmYWxzZSxcInVzZVJhbmdlc1wiOmZhbHNlLFwiY29sb3JTY2hlbWFcIjpcIkdyZWVuIHRvIFJlZFwiLFwibWV0cmljQ29sb3JNb2RlXCI6XCJOb25lXCIsXCJjb2xvcnNSYW5nZVwiOlt7XCJmcm9tXCI6MCxcInRvXCI6MTAwMDB9XSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlfSxcImludmVydENvbG9yc1wiOmZhbHNlLFwic3R5bGVcIjp7XCJiZ0ZpbGxcIjpcIiMwMDBcIixcImJnQ29sb3JcIjpmYWxzZSxcImxhYmVsQ29sb3JcIjpmYWxzZSxcInN1YlRleHRcIjpcIlwiLFwiZm9udFNpemVcIjoyMH19fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJjdXN0b21MYWJlbFwiOlwiTG93IHNldmVyaXR5IGFsZXJ0c1wifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiZGF0YS52dWxuZXJhYmlsaXR5LnNldmVyaXR5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiTG93XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJMb3dcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS52dWxuZXJhYmlsaXR5LnNldmVyaXR5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiTG93XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkc3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctdnVscy1Nb3N0LWFmZmVjdGVkLWFnZW50cycsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01vc3QgYWZmZWN0ZWQgYWdlbnRzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIk1vc3QgYWZmZWN0ZWQgYWdlbnRzXCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZSxcImxhYmVsc1wiOntcInNob3dcIjpmYWxzZSxcInZhbHVlc1wiOnRydWUsXCJsYXN0X2xldmVsXCI6dHJ1ZSxcInRydW5jYXRlXCI6MTAwfX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJhZ2VudC5uYW1lXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJjdXN0b21MYWJlbFwiOlwiQWZmZWN0ZWQgYWdlbnRcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctdnVscy1WdWxuZXJhYmlsaXR5LXNldmVyaXR5LWRpc3RyaWJ1dGlvbicsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1NldmVyaXR5IGRpc3RyaWJ1dGlvbicsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJTZXZlcml0eSBkaXN0cmlidXRpb25cIixcInR5cGVcIjpcInBpZVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwicGllXCIsXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcImlzRG9udXRcIjp0cnVlLFwibGFiZWxzXCI6e1wic2hvd1wiOmZhbHNlLFwidmFsdWVzXCI6dHJ1ZSxcImxhc3RfbGV2ZWxcIjp0cnVlLFwidHJ1bmNhdGVcIjoxMDB9fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEudnVsbmVyYWJpbGl0eS5zZXZlcml0eVwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIlNldmVyaXR5XCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLU92ZXJ2aWV3LXZ1bHMtVnVsbmVyYWJpbGl0eS1ldm9sdXRpb24tYWZmZWN0ZWQtcGFja2FnZXMnLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdUT1AgYWZmZWN0ZWQgcGFja2FnZXMgYWxlcnRzIEV2b2x1dGlvbicsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJUT1AgYWZmZWN0ZWQgcGFja2FnZXMgYWxlcnRzIEV2b2x1dGlvblwiLFwidHlwZVwiOlwiaGlzdG9ncmFtXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJoaXN0b2dyYW1cIixcImdyaWRcIjp7XCJjYXRlZ29yeUxpbmVzXCI6ZmFsc2UsXCJzdHlsZVwiOntcImNvbG9yXCI6XCIjZWVlXCJ9fSxcImNhdGVnb3J5QXhlc1wiOlt7XCJpZFwiOlwiQ2F0ZWdvcnlBeGlzLTFcIixcInR5cGVcIjpcImNhdGVnb3J5XCIsXCJwb3NpdGlvblwiOlwiYm90dG9tXCIsXCJzaG93XCI6dHJ1ZSxcInN0eWxlXCI6e30sXCJzY2FsZVwiOntcInR5cGVcIjpcImxpbmVhclwifSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwidHJ1bmNhdGVcIjoxMDB9LFwidGl0bGVcIjp7fX1dLFwidmFsdWVBeGVzXCI6W3tcImlkXCI6XCJWYWx1ZUF4aXMtMVwiLFwibmFtZVwiOlwiTGVmdEF4aXMtMVwiLFwidHlwZVwiOlwidmFsdWVcIixcInBvc2l0aW9uXCI6XCJsZWZ0XCIsXCJzaG93XCI6dHJ1ZSxcInN0eWxlXCI6e30sXCJzY2FsZVwiOntcInR5cGVcIjpcImxpbmVhclwiLFwibW9kZVwiOlwibm9ybWFsXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJyb3RhdGVcIjowLFwiZmlsdGVyXCI6ZmFsc2UsXCJ0cnVuY2F0ZVwiOjEwMH0sXCJ0aXRsZVwiOntcInRleHRcIjpcIkNvdW50XCJ9fV0sXCJzZXJpZXNQYXJhbXNcIjpbe1wic2hvd1wiOlwidHJ1ZVwiLFwidHlwZVwiOlwiaGlzdG9ncmFtXCIsXCJtb2RlXCI6XCJzdGFja2VkXCIsXCJkYXRhXCI6e1wibGFiZWxcIjpcIkNvdW50XCIsXCJpZFwiOlwiMVwifSxcInZhbHVlQXhpc1wiOlwiVmFsdWVBeGlzLTFcIixcImRyYXdMaW5lc0JldHdlZW5Qb2ludHNcIjp0cnVlLFwic2hvd0NpcmNsZXNcIjp0cnVlfV0sXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcInRpbWVzXCI6W10sXCJhZGRUaW1lTWFya2VyXCI6ZmFsc2V9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiM1wiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJncm91cFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEudnVsbmVyYWJpbGl0eS5wYWNrYWdlLm5hbWVcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImRhdGVfaGlzdG9ncmFtXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJ0aW1lc3RhbXBcIixcImludGVydmFsXCI6XCJhdXRvXCIsXCJjdXN0b21JbnRlcnZhbFwiOlwiMmhcIixcIm1pbl9kb2NfY291bnRcIjoxLFwiZXh0ZW5kZWRfYm91bmRzXCI6e319fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfVxuICB9XG5dO1xuIl19