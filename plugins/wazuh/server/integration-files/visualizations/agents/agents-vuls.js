"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Wazuh app - Module for Agents/Vulnerabilities visualizations
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
  _id: 'Wazuh-App-Agents-vuls-Alerts-severity-over-time',
  _type: 'visualization',
  _source: {
    title: 'Alerts severity over time',
    visState: '{"title":"Alerts by action over time","type":"area","params":{"type":"area","grid":{"categoryLines":true,"style":{"color":"#eee"},"valueAxis":"ValueAxis-1"},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"数量"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"cardinal","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","timeRange":{"from":"now-24h","to":"now","mode":"quick"},"useNormalizedEsInterval":true,"interval":"auto","time_zone":"Europe/Berlin","drop_partials":false,"customInterval":"2h","min_doc_count":1,"extended_bounds":{}}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"data.vulnerability.severity","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Agents-vuls-Alert-summary',
  _type: 'visualization',
  _source: {
    title: 'Alerts summary',
    visState: '{"title":"vulnerability","type":"table","params":{"perPage":10,"showPartialRows":false,"showMetricsAtAllLevels":false,"sort":{"columnIndex":4,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.vulnerability.severity","size":5,"order":"asc","orderBy":"_key","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Severity"}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.vulnerability.title","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Title"}},{"id":"6","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.vulnerability.published","size":2,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"Published"}},{"id":"5","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.vulnerability.cve","size":1,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","customLabel":"CVE"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":4,"direction":"desc"}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Agents-vuls-Commonly-affected-packages',
  _type: 'visualization',
  _source: {
    title: 'Top 5 affected packages',
    visState: '{"title":"Top 5 affected packages","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.vulnerability.package.name","size":5,"order":"desc","orderBy":"1","customLabel":"Affected package"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Agents-vuls-Metric-Critical-severity',
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
  _id: 'Wazuh-App-Agents-vuls-Metric-High-severity',
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
  _id: 'Wazuh-App-Agents-vuls-Metric-Medium-severity',
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
  _id: 'Wazuh-App-Agents-vuls-Metric-Low-severity',
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
  _id: 'Wazuh-App-Agents-vuls-Top-Agents-severity',
  _type: 'visualization',
  _source: {
    title: 'Top Agents severity',
    visState: '{"title":"Top Agents severity","type":"histogram","params":{"type":"histogram","grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"agent.name","size":5,"order":"desc","orderBy":"1","customLabel":"Agent name"}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"data.vulnerability.severity","size":5,"order":"desc","orderBy":"1","customLabel":"Severity"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Agents-vuls-Most-common-rules',
  _type: 'visualization',
  _source: {
    title: 'Most common rules',
    visState: "{\"type\":\"table\",\"aggs\":[{\"id\":\"1\",\"enabled\":true,\"type\":\"count\",\"schema\":\"metric\",\"params\":{}},{\"id\":\"2\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"bucket\",\"params\":{\"field\":\"rule.id\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":20,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\",\"customLabel\":\"Rule ID\"}},{\"id\":\"3\",\"enabled\":true,\"type\":\"terms\",\"schema\":\"bucket\",\"params\":{\"field\":\"rule.description\",\"orderBy\":\"1\",\"order\":\"desc\",\"size\":20,\"otherBucket\":false,\"otherBucketLabel\":\"Other\",\"missingBucket\":false,\"missingBucketLabel\":\"Missing\",\"customLabel\":\"Description\"}}],\"params\":{\"perPage\":5,\"showPartialRows\":false,\"showMetricsAtAllLevels\":false,\"sort\":{\"columnIndex\":null,\"direction\":null},\"showTotal\":false,\"totalFunc\":\"sum\",\"percentageCol\":\"\"},\"title\":\"common rules\"}",
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":2,"direction":"desc"}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Agents-vuls-Vulnerability-severity-distribution',
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
  _id: 'Wazuh-App-Agents-vuls-Vulnerability-Most-common-CVEs',
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
  _id: 'Wazuh-App-Agents-vuls-top-CWEs',
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
  _id: 'Wazuh-App-Agents-vuls-evolution-affected-packages',
  _type: 'visualization',
  _source: {
    title: 'Alerts evolution: Commonly affected packages',
    visState: '{"title":"Alerts evolution: Commonly affected packages","type":"histogram","params":{"type":"histogram","grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"数量"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"data.vulnerability.package.name","size":5,"order":"desc","orderBy":"1"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{}}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Agents-vuls-Most-common-CWEs',
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
  _id: 'Wazuh-App-Agents-vuls-packages-CVEs',
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
}];
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFnZW50cy12dWxzLnRzIl0sIm5hbWVzIjpbIl9pZCIsIl90eXBlIiwiX3NvdXJjZSIsInRpdGxlIiwidmlzU3RhdGUiLCJ1aVN0YXRlSlNPTiIsImRlc2NyaXB0aW9uIiwidmVyc2lvbiIsImtpYmFuYVNhdmVkT2JqZWN0TWV0YSIsInNlYXJjaFNvdXJjZUpTT04iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7ZUFXZSxDQUNiO0FBQ0VBLEVBQUFBLEdBQUcsRUFBRSxpREFEUDtBQUVFQyxFQUFBQSxLQUFLLEVBQUUsZUFGVDtBQUdFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLDJCQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTix3K0NBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLElBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUNkO0FBRm1CO0FBUGhCO0FBSFgsQ0FEYSxFQWlCYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUscUNBRFA7QUFFRUMsRUFBQUEsS0FBSyxFQUFFLGVBRlQ7QUFHRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxnQkFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04seTBDQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFDVCxrRUFMSztBQU1QQyxJQUFBQSxXQUFXLEVBQUUsRUFOTjtBQU9QQyxJQUFBQSxPQUFPLEVBQUUsQ0FQRjtBQVFQQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQ2Q7QUFGbUI7QUFSaEI7QUFIWCxDQWpCYSxFQWtDYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUsa0RBRFA7QUFFRUMsRUFBQUEsS0FBSyxFQUFFLGVBRlQ7QUFHRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUss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QSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLCtCQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTiw2L0NBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLElBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUNkO0FBRm1CO0FBUGhCO0FBSFgsQ0EzVmEsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBXYXp1aCBhcHAgLSBNb2R1bGUgZm9yIEFnZW50cy9WdWxuZXJhYmlsaXRpZXMgdmlzdWFsaXphdGlvbnNcbiAqIENvcHlyaWdodCAoQykgMjAxNS0yMDIxIFdhenVoLCBJbmMuXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAyIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBGaW5kIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBvbiB0aGUgTElDRU5TRSBmaWxlLlxuICovXG5leHBvcnQgZGVmYXVsdCBbXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLXZ1bHMtQWxlcnRzLXNldmVyaXR5LW92ZXItdGltZScsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0FsZXJ0cyBzZXZlcml0eSBvdmVyIHRpbWUnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiQWxlcnRzIGJ5IGFjdGlvbiBvdmVyIHRpbWVcIixcInR5cGVcIjpcImFyZWFcIixcInBhcmFtc1wiOntcInR5cGVcIjpcImFyZWFcIixcImdyaWRcIjp7XCJjYXRlZ29yeUxpbmVzXCI6dHJ1ZSxcInN0eWxlXCI6e1wiY29sb3JcIjpcIiNlZWVcIn0sXCJ2YWx1ZUF4aXNcIjpcIlZhbHVlQXhpcy0xXCJ9LFwiY2F0ZWdvcnlBeGVzXCI6W3tcImlkXCI6XCJDYXRlZ29yeUF4aXMtMVwiLFwidHlwZVwiOlwiY2F0ZWdvcnlcIixcInBvc2l0aW9uXCI6XCJib3R0b21cIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH0sXCJ0aXRsZVwiOnt9fV0sXCJ2YWx1ZUF4ZXNcIjpbe1wiaWRcIjpcIlZhbHVlQXhpcy0xXCIsXCJuYW1lXCI6XCJMZWZ0QXhpcy0xXCIsXCJ0eXBlXCI6XCJ2YWx1ZVwiLFwicG9zaXRpb25cIjpcImxlZnRcIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCIsXCJtb2RlXCI6XCJub3JtYWxcIn0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcInJvdGF0ZVwiOjAsXCJmaWx0ZXJcIjpmYWxzZSxcInRydW5jYXRlXCI6MTAwfSxcInRpdGxlXCI6e1widGV4dFwiOlwiQ291bnRcIn19XSxcInNlcmllc1BhcmFtc1wiOlt7XCJzaG93XCI6XCJ0cnVlXCIsXCJ0eXBlXCI6XCJhcmVhXCIsXCJtb2RlXCI6XCJzdGFja2VkXCIsXCJkYXRhXCI6e1wibGFiZWxcIjpcIkNvdW50XCIsXCJpZFwiOlwiMVwifSxcImRyYXdMaW5lc0JldHdlZW5Qb2ludHNcIjp0cnVlLFwic2hvd0NpcmNsZXNcIjp0cnVlLFwiaW50ZXJwb2xhdGVcIjpcImNhcmRpbmFsXCIsXCJ2YWx1ZUF4aXNcIjpcIlZhbHVlQXhpcy0xXCJ9XSxcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwidGltZXNcIjpbXSxcImFkZFRpbWVNYXJrZXJcIjpmYWxzZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImRhdGVfaGlzdG9ncmFtXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJ0aW1lc3RhbXBcIixcInRpbWVSYW5nZVwiOntcImZyb21cIjpcIm5vdy0yNGhcIixcInRvXCI6XCJub3dcIixcIm1vZGVcIjpcInF1aWNrXCJ9LFwidXNlTm9ybWFsaXplZEVzSW50ZXJ2YWxcIjp0cnVlLFwiaW50ZXJ2YWxcIjpcImF1dG9cIixcInRpbWVfem9uZVwiOlwiRXVyb3BlL0JlcmxpblwiLFwiZHJvcF9wYXJ0aWFsc1wiOmZhbHNlLFwiY3VzdG9tSW50ZXJ2YWxcIjpcIjJoXCIsXCJtaW5fZG9jX2NvdW50XCI6MSxcImV4dGVuZGVkX2JvdW5kc1wiOnt9fX0se1wiaWRcIjpcIjNcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiZ3JvdXBcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLnZ1bG5lcmFiaWxpdHkuc2V2ZXJpdHlcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy12dWxzLUFsZXJ0LXN1bW1hcnknLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdBbGVydHMgc3VtbWFyeScsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJ2dWxuZXJhYmlsaXR5XCIsXCJ0eXBlXCI6XCJ0YWJsZVwiLFwicGFyYW1zXCI6e1wicGVyUGFnZVwiOjEwLFwic2hvd1BhcnRpYWxSb3dzXCI6ZmFsc2UsXCJzaG93TWV0cmljc0F0QWxsTGV2ZWxzXCI6ZmFsc2UsXCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjo0LFwiZGlyZWN0aW9uXCI6XCJkZXNjXCJ9LFwic2hvd1RvdGFsXCI6ZmFsc2UsXCJ0b3RhbEZ1bmNcIjpcInN1bVwifSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LnNldmVyaXR5XCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJhc2NcIixcIm9yZGVyQnlcIjpcIl9rZXlcIixcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCIsXCJjdXN0b21MYWJlbFwiOlwiU2V2ZXJpdHlcIn19LHtcImlkXCI6XCIzXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEudnVsbmVyYWJpbGl0eS50aXRsZVwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIixcImN1c3RvbUxhYmVsXCI6XCJUaXRsZVwifX0se1wiaWRcIjpcIjZcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LnB1Ymxpc2hlZFwiLFwic2l6ZVwiOjIsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIixcImN1c3RvbUxhYmVsXCI6XCJQdWJsaXNoZWRcIn19LHtcImlkXCI6XCI1XCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEudnVsbmVyYWJpbGl0eS5jdmVcIixcInNpemVcIjoxLFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCIsXCJjdXN0b21MYWJlbFwiOlwiQ1ZFXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOlxuICAgICAgICAne1widmlzXCI6e1wicGFyYW1zXCI6e1wic29ydFwiOntcImNvbHVtbkluZGV4XCI6NCxcImRpcmVjdGlvblwiOlwiZGVzY1wifX19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLXZ1bHMtQ29tbW9ubHktYWZmZWN0ZWQtcGFja2FnZXMnLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdUb3AgNSBhZmZlY3RlZCBwYWNrYWdlcycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJUb3AgNSBhZmZlY3RlZCBwYWNrYWdlc1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWUsXCJsYWJlbHNcIjp7XCJzaG93XCI6ZmFsc2UsXCJ2YWx1ZXNcIjp0cnVlLFwibGFzdF9sZXZlbFwiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LnBhY2thZ2UubmFtZVwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIkFmZmVjdGVkIHBhY2thZ2VcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLXZ1bHMtTWV0cmljLUNyaXRpY2FsLXNldmVyaXR5JyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnTWV0cmljIENyaXRpY2FsIHNldmVyaXR5JyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIk1ldHJpYyBDcml0aWNhbCBzZXZlcml0eVwiLFwidHlwZVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOmZhbHNlLFwidHlwZVwiOlwibWV0cmljXCIsXCJtZXRyaWNcIjp7XCJwZXJjZW50YWdlTW9kZVwiOmZhbHNlLFwidXNlUmFuZ2VzXCI6ZmFsc2UsXCJjb2xvclNjaGVtYVwiOlwiR3JlZW4gdG8gUmVkXCIsXCJtZXRyaWNDb2xvck1vZGVcIjpcIk5vbmVcIixcImNvbG9yc1JhbmdlXCI6W3tcImZyb21cIjowLFwidG9cIjoxMDAwMH1dLFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWV9LFwiaW52ZXJ0Q29sb3JzXCI6ZmFsc2UsXCJzdHlsZVwiOntcImJnRmlsbFwiOlwiIzAwMFwiLFwiYmdDb2xvclwiOmZhbHNlLFwibGFiZWxDb2xvclwiOmZhbHNlLFwic3ViVGV4dFwiOlwiXCIsXCJmb250U2l6ZVwiOjIwfX19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImN1c3RvbUxhYmVsXCI6XCJDcml0aWNhbCBzZXZlcml0eSBhbGVydHNcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcImRhdGEudnVsbmVyYWJpbGl0eS5zZXZlcml0eVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkNyaXRpY2FsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJDcml0aWNhbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLnZ1bG5lcmFiaWxpdHkuc2V2ZXJpdHlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJDcml0aWNhbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy12dWxzLU1ldHJpYy1IaWdoLXNldmVyaXR5JyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnTWV0cmljIEhpZ2ggc2V2ZXJpdHknLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTWV0cmljIEhpZ2ggc2V2ZXJpdHlcIixcInR5cGVcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjpmYWxzZSxcInR5cGVcIjpcIm1ldHJpY1wiLFwibWV0cmljXCI6e1wicGVyY2VudGFnZU1vZGVcIjpmYWxzZSxcInVzZVJhbmdlc1wiOmZhbHNlLFwiY29sb3JTY2hlbWFcIjpcIkdyZWVuIHRvIFJlZFwiLFwibWV0cmljQ29sb3JNb2RlXCI6XCJOb25lXCIsXCJjb2xvcnNSYW5nZVwiOlt7XCJmcm9tXCI6MCxcInRvXCI6MTAwMDB9XSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlfSxcImludmVydENvbG9yc1wiOmZhbHNlLFwic3R5bGVcIjp7XCJiZ0ZpbGxcIjpcIiMwMDBcIixcImJnQ29sb3JcIjpmYWxzZSxcImxhYmVsQ29sb3JcIjpmYWxzZSxcInN1YlRleHRcIjpcIlwiLFwiZm9udFNpemVcIjoyMH19fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJjdXN0b21MYWJlbFwiOlwiSGlnaCBzZXZlcml0eSBhbGVydHNcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcImRhdGEudnVsbmVyYWJpbGl0eS5zZXZlcml0eVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIkhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcIkhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS52dWxuZXJhYmlsaXR5LnNldmVyaXR5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiSGlnaFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy12dWxzLU1ldHJpYy1NZWRpdW0tc2V2ZXJpdHknLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdNZXRyaWMgTWVkaXVtIHNldmVyaXR5JyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIk1ldHJpYyBNZWRpdW0gc2V2ZXJpdHlcIixcInR5cGVcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjpmYWxzZSxcInR5cGVcIjpcIm1ldHJpY1wiLFwibWV0cmljXCI6e1wicGVyY2VudGFnZU1vZGVcIjpmYWxzZSxcInVzZVJhbmdlc1wiOmZhbHNlLFwiY29sb3JTY2hlbWFcIjpcIkdyZWVuIHRvIFJlZFwiLFwibWV0cmljQ29sb3JNb2RlXCI6XCJOb25lXCIsXCJjb2xvcnNSYW5nZVwiOlt7XCJmcm9tXCI6MCxcInRvXCI6MTAwMDB9XSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlfSxcImludmVydENvbG9yc1wiOmZhbHNlLFwic3R5bGVcIjp7XCJiZ0ZpbGxcIjpcIiMwMDBcIixcImJnQ29sb3JcIjpmYWxzZSxcImxhYmVsQ29sb3JcIjpmYWxzZSxcInN1YlRleHRcIjpcIlwiLFwiZm9udFNpemVcIjoyMH19fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJjdXN0b21MYWJlbFwiOlwiTWVkaXVtIHNldmVyaXR5IGFsZXJ0c1wifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiZGF0YS52dWxuZXJhYmlsaXR5LnNldmVyaXR5XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiTWVkaXVtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJNZWRpdW1cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS52dWxuZXJhYmlsaXR5LnNldmVyaXR5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiTWVkaXVtXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkc3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLXZ1bHMtTWV0cmljLUxvdy1zZXZlcml0eScsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01ldHJpYyBMb3cgc2V2ZXJpdHknLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTWV0cmljIExvdyBzZXZlcml0eVwiLFwidHlwZVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOmZhbHNlLFwidHlwZVwiOlwibWV0cmljXCIsXCJtZXRyaWNcIjp7XCJwZXJjZW50YWdlTW9kZVwiOmZhbHNlLFwidXNlUmFuZ2VzXCI6ZmFsc2UsXCJjb2xvclNjaGVtYVwiOlwiR3JlZW4gdG8gUmVkXCIsXCJtZXRyaWNDb2xvck1vZGVcIjpcIk5vbmVcIixcImNvbG9yc1JhbmdlXCI6W3tcImZyb21cIjowLFwidG9cIjoxMDAwMH1dLFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWV9LFwiaW52ZXJ0Q29sb3JzXCI6ZmFsc2UsXCJzdHlsZVwiOntcImJnRmlsbFwiOlwiIzAwMFwiLFwiYmdDb2xvclwiOmZhbHNlLFwibGFiZWxDb2xvclwiOmZhbHNlLFwic3ViVGV4dFwiOlwiXCIsXCJmb250U2l6ZVwiOjIwfX19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImN1c3RvbUxhYmVsXCI6XCJMb3cgc2V2ZXJpdHkgYWxlcnRzXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOiBge1xuICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWx0ZXJcIjpbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJkYXRhLnZ1bG5lcmFiaWxpdHkuc2V2ZXJpdHlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJMb3dcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcIkxvd1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLnZ1bG5lcmFiaWxpdHkuc2V2ZXJpdHlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJMb3dcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn1cbiAgICAgICAgICAgICAgICB9YFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtdnVscy1Ub3AtQWdlbnRzLXNldmVyaXR5JyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnVG9wIEFnZW50cyBzZXZlcml0eScsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJUb3AgQWdlbnRzIHNldmVyaXR5XCIsXCJ0eXBlXCI6XCJoaXN0b2dyYW1cIixcInBhcmFtc1wiOntcInR5cGVcIjpcImhpc3RvZ3JhbVwiLFwiZ3JpZFwiOntcImNhdGVnb3J5TGluZXNcIjpmYWxzZSxcInN0eWxlXCI6e1wiY29sb3JcIjpcIiNlZWVcIn19LFwiY2F0ZWdvcnlBeGVzXCI6W3tcImlkXCI6XCJDYXRlZ29yeUF4aXMtMVwiLFwidHlwZVwiOlwiY2F0ZWdvcnlcIixcInBvc2l0aW9uXCI6XCJib3R0b21cIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH0sXCJ0aXRsZVwiOnt9fV0sXCJ2YWx1ZUF4ZXNcIjpbe1wiaWRcIjpcIlZhbHVlQXhpcy0xXCIsXCJuYW1lXCI6XCJMZWZ0QXhpcy0xXCIsXCJ0eXBlXCI6XCJ2YWx1ZVwiLFwicG9zaXRpb25cIjpcImxlZnRcIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCIsXCJtb2RlXCI6XCJub3JtYWxcIn0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcInJvdGF0ZVwiOjAsXCJmaWx0ZXJcIjpmYWxzZSxcInRydW5jYXRlXCI6MTAwfSxcInRpdGxlXCI6e1widGV4dFwiOlwiQ291bnRcIn19XSxcInNlcmllc1BhcmFtc1wiOlt7XCJzaG93XCI6XCJ0cnVlXCIsXCJ0eXBlXCI6XCJoaXN0b2dyYW1cIixcIm1vZGVcIjpcInN0YWNrZWRcIixcImRhdGFcIjp7XCJsYWJlbFwiOlwiQ291bnRcIixcImlkXCI6XCIxXCJ9LFwidmFsdWVBeGlzXCI6XCJWYWx1ZUF4aXMtMVwiLFwiZHJhd0xpbmVzQmV0d2VlblBvaW50c1wiOnRydWUsXCJzaG93Q2lyY2xlc1wiOnRydWV9XSxcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwidGltZXNcIjpbXSxcImFkZFRpbWVNYXJrZXJcIjpmYWxzZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJhZ2VudC5uYW1lXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJjdXN0b21MYWJlbFwiOlwiQWdlbnQgbmFtZVwifX0se1wiaWRcIjpcIjNcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiZ3JvdXBcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLnZ1bG5lcmFiaWxpdHkuc2V2ZXJpdHlcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcImN1c3RvbUxhYmVsXCI6XCJTZXZlcml0eVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtdnVscy1Nb3N0LWNvbW1vbi1ydWxlcycsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01vc3QgY29tbW9uIHJ1bGVzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgXCJ7XFxcInR5cGVcXFwiOlxcXCJ0YWJsZVxcXCIsXFxcImFnZ3NcXFwiOlt7XFxcImlkXFxcIjpcXFwiMVxcXCIsXFxcImVuYWJsZWRcXFwiOnRydWUsXFxcInR5cGVcXFwiOlxcXCJjb3VudFxcXCIsXFxcInNjaGVtYVxcXCI6XFxcIm1ldHJpY1xcXCIsXFxcInBhcmFtc1xcXCI6e319LHtcXFwiaWRcXFwiOlxcXCIyXFxcIixcXFwiZW5hYmxlZFxcXCI6dHJ1ZSxcXFwidHlwZVxcXCI6XFxcInRlcm1zXFxcIixcXFwic2NoZW1hXFxcIjpcXFwiYnVja2V0XFxcIixcXFwicGFyYW1zXFxcIjp7XFxcImZpZWxkXFxcIjpcXFwicnVsZS5pZFxcXCIsXFxcIm9yZGVyQnlcXFwiOlxcXCIxXFxcIixcXFwib3JkZXJcXFwiOlxcXCJkZXNjXFxcIixcXFwic2l6ZVxcXCI6MjAsXFxcIm90aGVyQnVja2V0XFxcIjpmYWxzZSxcXFwib3RoZXJCdWNrZXRMYWJlbFxcXCI6XFxcIk90aGVyXFxcIixcXFwibWlzc2luZ0J1Y2tldFxcXCI6ZmFsc2UsXFxcIm1pc3NpbmdCdWNrZXRMYWJlbFxcXCI6XFxcIk1pc3NpbmdcXFwiLFxcXCJjdXN0b21MYWJlbFxcXCI6XFxcIlJ1bGUgSURcXFwifX0se1xcXCJpZFxcXCI6XFxcIjNcXFwiLFxcXCJlbmFibGVkXFxcIjp0cnVlLFxcXCJ0eXBlXFxcIjpcXFwidGVybXNcXFwiLFxcXCJzY2hlbWFcXFwiOlxcXCJidWNrZXRcXFwiLFxcXCJwYXJhbXNcXFwiOntcXFwiZmllbGRcXFwiOlxcXCJydWxlLmRlc2NyaXB0aW9uXFxcIixcXFwib3JkZXJCeVxcXCI6XFxcIjFcXFwiLFxcXCJvcmRlclxcXCI6XFxcImRlc2NcXFwiLFxcXCJzaXplXFxcIjoyMCxcXFwib3RoZXJCdWNrZXRcXFwiOmZhbHNlLFxcXCJvdGhlckJ1Y2tldExhYmVsXFxcIjpcXFwiT3RoZXJcXFwiLFxcXCJtaXNzaW5nQnVja2V0XFxcIjpmYWxzZSxcXFwibWlzc2luZ0J1Y2tldExhYmVsXFxcIjpcXFwiTWlzc2luZ1xcXCIsXFxcImN1c3RvbUxhYmVsXFxcIjpcXFwiRGVzY3JpcHRpb25cXFwifX1dLFxcXCJwYXJhbXNcXFwiOntcXFwicGVyUGFnZVxcXCI6NSxcXFwic2hvd1BhcnRpYWxSb3dzXFxcIjpmYWxzZSxcXFwic2hvd01ldHJpY3NBdEFsbExldmVsc1xcXCI6ZmFsc2UsXFxcInNvcnRcXFwiOntcXFwiY29sdW1uSW5kZXhcXFwiOm51bGwsXFxcImRpcmVjdGlvblxcXCI6bnVsbH0sXFxcInNob3dUb3RhbFxcXCI6ZmFsc2UsXFxcInRvdGFsRnVuY1xcXCI6XFxcInN1bVxcXCIsXFxcInBlcmNlbnRhZ2VDb2xcXFwiOlxcXCJcXFwifSxcXFwidGl0bGVcXFwiOlxcXCJjb21tb24gcnVsZXNcXFwifVwiLFxuICAgICAgdWlTdGF0ZUpTT046XG4gICAgICAgICd7XCJ2aXNcIjp7XCJwYXJhbXNcIjp7XCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjoyLFwiZGlyZWN0aW9uXCI6XCJkZXNjXCJ9fX19JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtdnVscy1WdWxuZXJhYmlsaXR5LXNldmVyaXR5LWRpc3RyaWJ1dGlvbicsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1NldmVyaXR5IGRpc3RyaWJ1dGlvbicsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJTZXZlcml0eSBkaXN0cmlidXRpb25cIixcInR5cGVcIjpcInBpZVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwicGllXCIsXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcImlzRG9udXRcIjp0cnVlLFwibGFiZWxzXCI6e1wic2hvd1wiOmZhbHNlLFwidmFsdWVzXCI6dHJ1ZSxcImxhc3RfbGV2ZWxcIjp0cnVlLFwidHJ1bmNhdGVcIjoxMDB9fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEudnVsbmVyYWJpbGl0eS5zZXZlcml0eVwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIlNldmVyaXR5XCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy12dWxzLVZ1bG5lcmFiaWxpdHktTW9zdC1jb21tb24tQ1ZFcycsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01vc3QgY29tbW9uIENWRXMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTW9zdCBjb21tb24gQ1ZFc1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWUsXCJsYWJlbHNcIjp7XCJzaG93XCI6ZmFsc2UsXCJ2YWx1ZXNcIjp0cnVlLFwibGFzdF9sZXZlbFwiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LmN2ZVwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIkNWRVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtdnVscy10b3AtQ1dFcycsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1RvcCBDV0VzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widHlwZVwiOlwidGFibGVcIixcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LmN3ZV9yZWZlcmVuY2VcIixcIm9yZGVyQnlcIjpcIjFcIixcIm9yZGVyXCI6XCJkZXNjXCIsXCJzaXplXCI6NTAsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwiY3VzdG9tTGFiZWxcIjpcIkNXRVwifX1dLFwicGFyYW1zXCI6e1wicGVyUGFnZVwiOjUsXCJzaG93UGFydGlhbFJvd3NcIjpmYWxzZSxcInNob3dNZXRyaWNzQXRBbGxMZXZlbHNcIjpmYWxzZSxcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOm51bGwsXCJkaXJlY3Rpb25cIjpudWxsfSxcInNob3dUb3RhbFwiOmZhbHNlLFwidG90YWxGdW5jXCI6XCJzdW1cIixcInBlcmNlbnRhZ2VDb2xcIjpcIlwiLFwicm93XCI6dHJ1ZX0sXCJ0aXRsZVwiOlwiQ1dFIHRhYmxlXCJ9JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy12dWxzLWV2b2x1dGlvbi1hZmZlY3RlZC1wYWNrYWdlcycsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0FsZXJ0cyBldm9sdXRpb246IENvbW1vbmx5IGFmZmVjdGVkIHBhY2thZ2VzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkFsZXJ0cyBldm9sdXRpb246IENvbW1vbmx5IGFmZmVjdGVkIHBhY2thZ2VzXCIsXCJ0eXBlXCI6XCJoaXN0b2dyYW1cIixcInBhcmFtc1wiOntcInR5cGVcIjpcImhpc3RvZ3JhbVwiLFwiZ3JpZFwiOntcImNhdGVnb3J5TGluZXNcIjpmYWxzZSxcInN0eWxlXCI6e1wiY29sb3JcIjpcIiNlZWVcIn19LFwiY2F0ZWdvcnlBeGVzXCI6W3tcImlkXCI6XCJDYXRlZ29yeUF4aXMtMVwiLFwidHlwZVwiOlwiY2F0ZWdvcnlcIixcInBvc2l0aW9uXCI6XCJib3R0b21cIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH0sXCJ0aXRsZVwiOnt9fV0sXCJ2YWx1ZUF4ZXNcIjpbe1wiaWRcIjpcIlZhbHVlQXhpcy0xXCIsXCJuYW1lXCI6XCJMZWZ0QXhpcy0xXCIsXCJ0eXBlXCI6XCJ2YWx1ZVwiLFwicG9zaXRpb25cIjpcImxlZnRcIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCIsXCJtb2RlXCI6XCJub3JtYWxcIn0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcInJvdGF0ZVwiOjAsXCJmaWx0ZXJcIjpmYWxzZSxcInRydW5jYXRlXCI6MTAwfSxcInRpdGxlXCI6e1widGV4dFwiOlwiQ291bnRcIn19XSxcInNlcmllc1BhcmFtc1wiOlt7XCJzaG93XCI6XCJ0cnVlXCIsXCJ0eXBlXCI6XCJoaXN0b2dyYW1cIixcIm1vZGVcIjpcInN0YWNrZWRcIixcImRhdGFcIjp7XCJsYWJlbFwiOlwiQ291bnRcIixcImlkXCI6XCIxXCJ9LFwidmFsdWVBeGlzXCI6XCJWYWx1ZUF4aXMtMVwiLFwiZHJhd0xpbmVzQmV0d2VlblBvaW50c1wiOnRydWUsXCJzaG93Q2lyY2xlc1wiOnRydWV9XSxcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwidGltZXNcIjpbXSxcImFkZFRpbWVNYXJrZXJcIjpmYWxzZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIzXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImdyb3VwXCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LnBhY2thZ2UubmFtZVwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiZGF0ZV9oaXN0b2dyYW1cIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcInRpbWVzdGFtcFwiLFwiaW50ZXJ2YWxcIjpcImF1dG9cIixcImN1c3RvbUludGVydmFsXCI6XCIyaFwiLFwibWluX2RvY19jb3VudFwiOjEsXCJleHRlbmRlZF9ib3VuZHNcIjp7fX19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLXZ1bHMtTW9zdC1jb21tb24tQ1dFcycsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01vc3QgY29tbW9uIENXRXMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTW9zdCBjb21tb24gQ1dFc1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWUsXCJsYWJlbHNcIjp7XCJzaG93XCI6ZmFsc2UsXCJ2YWx1ZXNcIjp0cnVlLFwibGFzdF9sZXZlbFwiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52dWxuZXJhYmlsaXR5LmN3ZV9yZWZlcmVuY2VcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcImN1c3RvbUxhYmVsXCI6XCJTZXZlcml0eVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtdnVscy1wYWNrYWdlcy1DVkVzJyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnVG9wIGFmZmVjdGVkIHBhY2thZ2VzIGJ5IENWRXMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0eXBlXCI6XCJoaXN0b2dyYW1cIixcIm1vZGVcIjpcInN0YWNrZWRcIixcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEudnVsbmVyYWJpbGl0eS5jdmVcIixcIm9yZGVyQnlcIjpcIjFcIixcIm9yZGVyXCI6XCJkZXNjXCIsXCJzaXplXCI6MTAsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wifX0se1wiaWRcIjpcIjNcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiZ3JvdXBcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLnZ1bG5lcmFiaWxpdHkucGFja2FnZS5uYW1lXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJvcmRlclwiOlwiZGVzY1wiLFwic2l6ZVwiOjUsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wifX1dLFwicGFyYW1zXCI6e1widHlwZVwiOlwiYXJlYVwiLFwiZ3JpZFwiOntcImNhdGVnb3J5TGluZXNcIjpmYWxzZX0sXCJjYXRlZ29yeUF4ZXNcIjpbe1wiaWRcIjpcIkNhdGVnb3J5QXhpcy0xXCIsXCJ0eXBlXCI6XCJjYXRlZ29yeVwiLFwicG9zaXRpb25cIjpcImJvdHRvbVwiLFwic2hvd1wiOnRydWUsXCJzdHlsZVwiOnt9LFwic2NhbGVcIjp7XCJ0eXBlXCI6XCJsaW5lYXJcIn0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcImZpbHRlclwiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH0sXCJ0aXRsZVwiOnt9fV0sXCJ2YWx1ZUF4ZXNcIjpbe1wiaWRcIjpcIlZhbHVlQXhpcy0xXCIsXCJuYW1lXCI6XCJMZWZ0QXhpcy0xXCIsXCJ0eXBlXCI6XCJ2YWx1ZVwiLFwicG9zaXRpb25cIjpcImxlZnRcIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCIsXCJtb2RlXCI6XCJub3JtYWxcIn0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcInJvdGF0ZVwiOjAsXCJmaWx0ZXJcIjpmYWxzZSxcInRydW5jYXRlXCI6MTAwfSxcInRpdGxlXCI6e1widGV4dFwiOlwiQ291bnRcIn19XSxcInNlcmllc1BhcmFtc1wiOlt7XCJzaG93XCI6dHJ1ZSxcInR5cGVcIjpcImhpc3RvZ3JhbVwiLFwibW9kZVwiOlwic3RhY2tlZFwiLFwiZGF0YVwiOntcImxhYmVsXCI6XCJDb3VudFwiLFwiaWRcIjpcIjFcIn0sXCJkcmF3TGluZXNCZXR3ZWVuUG9pbnRzXCI6dHJ1ZSxcImxpbmVXaWR0aFwiOjIsXCJzaG93Q2lyY2xlc1wiOnRydWUsXCJpbnRlcnBvbGF0ZVwiOlwibGluZWFyXCIsXCJ2YWx1ZUF4aXNcIjpcIlZhbHVlQXhpcy0xXCJ9XSxcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwidGltZXNcIjpbXSxcImFkZFRpbWVNYXJrZXJcIjpmYWxzZSxcInRocmVzaG9sZExpbmVcIjp7XCJzaG93XCI6ZmFsc2UsXCJ2YWx1ZVwiOjEwLFwid2lkdGhcIjoxLFwic3R5bGVcIjpcImZ1bGxcIixcImNvbG9yXCI6XCIjRTc2NjRDXCJ9LFwibGFiZWxzXCI6e319LFwidGl0bGVcIjpcInRvcCBwYWNrYWdlcyBieSBDVkVcIn0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5dO1xuIl19