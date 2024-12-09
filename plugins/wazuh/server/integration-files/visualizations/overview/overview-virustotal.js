"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Wazuh app - Module for Overview/VirusTotal visualizations
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
  _id: 'Wazuh-App-Overview-Virustotal-Last-Files-Pie',
  _type: 'visualization',
  _source: {
    title: 'Last files',
    visState: '{"title":"Last files","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Files"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.virustotal.source.file","size":5,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{"vis":{"legendOpen":true}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-Virustotal-Files-Table',
  _type: 'visualization',
  _source: {
    title: 'Files',
    visState: '{"title":"Files","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":2,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Count"}},{"id":"4","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.virustotal.source.file","size":10,"order":"desc","orderBy":"1","customLabel":"File"}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.virustotal.permalink","size":1,"order":"desc","orderBy":"1","customLabel":"Link"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":2,"direction":"desc"}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Overview-Virustotal-Total-Malicious',
  _type: 'visualization',
  _source: {
    title: 'Total Malicious',
    visState: '{"title":"Total Malicious","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"metric","metric":{"percentageMode":false,"useRanges":false,"colorSchema":"Green to Red","metricColorMode":"None","colorsRange":[{"from":0,"to":10000}],"labels":{"show":true},"invertColors":false,"style":{"bgFill":"#000","bgColor":false,"labelColor":false,"subText":"","fontSize":20}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Total malicious files"}}]}',
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
                              "key": "data.virustotal.malicious",
                              "value": "1",
                              "params": {
                                "query": "1",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.virustotal.malicious": {
                                  "query": "1",
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
  _id: 'Wazuh-App-Overview-Virustotal-Total-Positives',
  _type: 'visualization',
  _source: {
    title: 'Total Positives',
    visState: '{"title":"Total Positives","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"metric","metric":{"percentageMode":false,"useRanges":false,"colorSchema":"Green to Red","metricColorMode":"None","colorsRange":[{"from":0,"to":10000}],"labels":{"show":true},"invertColors":false,"style":{"bgFill":"#000","bgColor":false,"labelColor":false,"subText":"","fontSize":20}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Total positive files"}}]}',
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
                              "type": "exists",
                              "key": "data.virustotal.positives",
                              "value": "exists"
                            },
                            "exists": {
                              "field": "data.virustotal.positives"
                            },
                            "$state": {
                              "store": "appState"
                            }
                          },
                          {
                            "meta": {
                              "index": "wazuh-alerts",
                              "negate": true,
                              "disabled": false,
                              "alias": null,
                              "type": "phrase",
                              "key": "data.virustotal.positives",
                              "value": "0",
                              "params": {
                                "query": 0,
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.virustotal.positives": {
                                  "query": 0,
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
  _id: 'Wazuh-App-Overview-Virustotal-Malicious-Evolution',
  _type: 'visualization',
  _source: {
    title: 'Malicious Evolution',
    visState: '{"title":"Malicious Evolution","type":"histogram","params":{"type":"histogram","grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Malicious"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Malicious","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":false,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Malicious"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{}}}]}',
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
                              "type": "exists",
                              "key": "data.virustotal.malicious",
                              "value": "exists"
                            },
                            "exists": {
                              "field": "data.virustotal.malicious"
                            },
                            "$state": {
                              "store": "appState"
                            }
                          },
                          {
                            "meta": {
                              "index": "wazuh-alerts",
                              "negate": true,
                              "disabled": false,
                              "alias": null,
                              "type": "phrase",
                              "key": "data.virustotal.malicious",
                              "value": "0",
                              "params": {
                                "query": 0,
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.virustotal.malicious": {
                                  "query": 0,
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
  _id: 'Wazuh-App-Overview-Virustotal-Total',
  _type: 'visualization',
  _source: {
    title: 'Total',
    visState: '{"title":"Total","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"metric","metric":{"percentageMode":false,"useRanges":false,"colorSchema":"Green to Red","metricColorMode":"None","colorsRange":[{"from":0,"to":10000}],"labels":{"show":true},"invertColors":false,"style":{"bgFill":"#000","bgColor":false,"labelColor":false,"subText":"","fontSize":20}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Total scans"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: `{
                    "index":"wazuh-alerts",
                    "filter":[{
                        "meta": {
                        "index": "wazuh-alerts",
                        "negate": false,
                        "disabled": false,
                        "alias": null,
                        "type": "exists",
                        "key": "data.virustotal",
                        "value": "exists"
                        },
                        "exists": {
                        "field": "data.virustotal"
                        },
                        "$state": {
                        "store": "appState"
                        }
                    }],
                    "query":{"query":"","language":"lucene"}
                }`
    }
  }
}, {
  _id: 'Wazuh-App-Overview-Virustotal-Malicious-Per-Agent-Table',
  _type: 'visualization',
  _source: {
    title: 'Malicious Per Agent Table',
    visState: '{"title":"Malicious Per Agent Table","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":2,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"cardinality","schema":"metric","params":{"field":"data.virustotal.source.md5","customLabel":"Malicious detected files"}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"agent.name","size":16,"order":"desc","orderBy":"1","customLabel":"Agent"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":2,"direction":"desc"}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: `{
                    "index":"wazuh-alerts",
                    "filter":[
                        {
                            "meta": {
                              "index": "wazuh-alerts",
                              "negate": true,
                              "disabled": false,
                              "alias": null,
                              "type": "phrase",
                              "key": "data.virustotal.malicious",
                              "value": "0",
                              "params": {
                                "query": "0",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.virustotal.malicious": {
                                  "query": "0",
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
  _id: 'Wazuh-App-Overview-Virustotal-Malicious-Per-Agent',
  _type: 'visualization',
  _source: {
    title: 'Top 5 agents with unique malicious files',
    visState: '{"title":"Top 5 agents with unique malicious files","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"cardinality","schema":"metric","params":{"field":"data.virustotal.source.md5"}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"agent.name","size":5,"order":"desc","orderBy":"1"}}]}',
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
                              "negate": true,
                              "disabled": false,
                              "alias": null,
                              "type": "phrase",
                              "key": "data.virustotal.malicious",
                              "value": "0",
                              "params": {
                                "query": "0",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.virustotal.malicious": {
                                  "query": "0",
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
  _id: 'Wazuh-App-Overview-Virustotal-Alerts-Evolution',
  _type: 'visualization',
  _source: {
    title: 'Positives Heatmap',
    visState: '{ "title": "Alerts evolution by agents", "type": "histogram", "params": { "type": "histogram", "grid": { "categoryLines": false }, "categoryAxes": [ { "id": "CategoryAxis-1", "type": "category", "position": "bottom", "show": true, "style": {}, "scale": { "type": "linear" }, "labels": { "show": true, "filter": true, "truncate": 100 }, "title": {} } ], "valueAxes": [ { "id": "ValueAxis-1", "name": "LeftAxis-1", "type": "value", "position": "left", "show": true, "style": {}, "scale": { "type": "linear", "mode": "normal" }, "labels": { "show": true, "rotate": 0, "filter": false, "truncate": 100 }, "title": { "text": "Count" } } ], "seriesParams": [ { "show": true, "type": "histogram", "mode": "stacked", "data": { "label": "Count", "id": "1" }, "valueAxis": "ValueAxis-1", "drawLinesBetweenPoints": true, "lineWidth": 2, "showCircles": true } ], "addTooltip": true, "addLegend": true, "legendPosition": "right", "times": [], "addTimeMarker": false, "labels": { "show": false }, "thresholdLine": { "show": false, "value": 10, "width": 1, "style": "full", "color": "#E7664C" }, "dimensions": { "x": { "accessor": 0, "format": { "id": "date", "params": { "pattern": "YYYY-MM-DD HH:mm" } }, "params": { "date": true, "interval": "PT3H", "intervalESValue": 3, "intervalESUnit": "h", "format": "YYYY-MM-DD HH:mm", "bounds": { "min": "2020-04-17T12:11:35.943Z", "max": "2020-04-24T12:11:35.944Z" } }, "label": "timestamp per 3 hours", "aggType": "date_histogram" }, "y": [ { "accessor": 2, "format": { "id": "number" }, "params": {}, "label": "Count", "aggType": "count" } ], "series": [ { "accessor": 1, "format": { "id": "string", "params": { "parsedUrl": { "origin": "http://localhost:5601", "pathname": "/app/kibana", "basePath": "" } } }, "params": {}, "label": "Top 5 unusual terms in agent.name", "aggType": "significant_terms" } ] }, "radiusRatio": 50 }, "aggs": [ { "id": "1", "enabled": true, "type": "count", "schema": "metric", "params": {} }, { "id": "2", "enabled": true, "type": "date_histogram", "schema": "segment", "params": { "field": "timestamp", "timeRange": { "from": "now-7d", "to": "now" }, "useNormalizedEsInterval": true, "scaleMetricValues": false, "interval": "auto", "drop_partials": false, "min_doc_count": 1, "extended_bounds": {} } }, { "id": "3", "enabled": true, "type": "terms", "schema": "group", "params": { "field": "agent.name", "orderBy": "1", "order": "desc", "size": 5, "otherBucket": false, "otherBucketLabel": "Other", "missingBucket": false, "missingBucketLabel": "Missing" } } ] }',
    uiStateJSON: '{"vis":{"defaultColors":{"0 - 7":"rgb(247,251,255)","7 - 13":"rgb(219,233,246)","13 - 20":"rgb(187,214,235)","20 - 26":"rgb(137,190,220)","26 - 33":"rgb(83,158,205)","33 - 39":"rgb(42,123,186)","39 - 45":"rgb(11,85,159)"},"legendOpen":true}}',
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
                              "type": "exists",
                              "key": "data.virustotal.positives",
                              "value": "exists"
                            },
                            "exists": {
                              "field": "data.virustotal.positives"
                            },
                            "$state": {
                              "store": "appState"
                            }
                          },
                          {
                            "meta": {
                              "index": "wazuh-alerts",
                              "negate": true,
                              "disabled": false,
                              "alias": null,
                              "type": "phrase",
                              "key": "data.virustotal.positives",
                              "value": "0",
                              "params": {
                                "query": 0,
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.virustotal.positives": {
                                  "query": 0,
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
  _id: 'Wazuh-App-Overview-Virustotal-Alerts-summary',
  _type: 'visualization',
  _source: {
    title: 'Alerts summary',
    visState: '{"title":"Alerts summary","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":3,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.id","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":50,"order":"desc","orderBy":"1","customLabel":"Rule ID"}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.description","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":20,"order":"desc","orderBy":"1","customLabel":"Description"}},{"id":"4","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.level","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":12,"order":"desc","orderBy":"1","customLabel":"Level"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":3,"direction":"desc"}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}];
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm92ZXJ2aWV3LXZpcnVzdG90YWwudHMiXSwibmFtZXMiOlsiX2lkIiwiX3R5cGUiLCJfc291cmNlIiwidGl0bGUiLCJ2aXNTdGF0ZSIsInVpU3RhdGVKU09OIiwiZGVzY3JpcHRpb24iLCJ2ZXJzaW9uIiwia2liYW5hU2F2ZWRPYmplY3RNZXRhIiwic2VhcmNoU291cmNlSlNPTiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7Ozs7OztlQVdlLENBQ2I7QUFDRUEsRUFBQUEsR0FBRyxFQUFFLDhDQURQO0FBRUVDLEVBQUFBLEtBQUssRUFBRSxlQUZUO0FBR0VDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsWUFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04sdWNBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLDZCQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVBoQjtBQUhYLENBRGEsRUFpQmI7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLDJDQURQO0FBRUVDLEVBQUFBLEtBQUssRUFBRSxlQUZUO0FBR0VDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsT0FEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04sa25CQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFDVCxrRUFMSztBQU1QQyxJQUFBQSxXQUFXLEVBQUUsRUFOTjtBQU9QQyxJQUFBQSxPQUFPLEVBQUUsQ0FQRjtBQVFQQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQ2Q7QUFGbUI7QUFSaEI7QUFIWCxDQWpCYSxFQWtDYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUsK0NBRFA7QUFFRUMsRUFBQUEsS0FBSyxFQUFFLGVBRlQ7QUFHRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxpQkFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04scWZBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLElBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQURFO0FBUGhCO0FBSFgsQ0FsQ2EsRUFnRmI7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLCtDQURQO0FBRUVDLEVBQUFBLEtBQUssRUFBRSxlQUZUO0FBR0VDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsaUJBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLG9mQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFBRSxJQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQURFO0FBUGhCO0FBSFgsQ0FoRmEsRUErSWI7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLG1EQURQO0FBRUVDLEVBQUFBLEtBQUssRUFBRSxlQUZUO0FBR0VDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUscUJBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLGltQ0FISztBQUlQQyxJQUFBQSxXQUFXLEVBQUUsSUFKTjtBQUtQQyxJQUFBQSxXQUFXLEVBQUUsRUFMTjtBQU1QQyxJQUFBQSxPQUFPLEVBQUUsQ0FORjtBQU9QQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFERTtBQVBoQjtBQUhYLENBL0lhLEVBOE1iO0FBQ0VULEVBQUFBLEdBQUcsRUFBRSxxQ0FEUDtBQUVFQyxFQUFBQSxLQUFLLEVBQUUsZUFGVDtBQUdFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLE9BREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLGllQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFBRSxJQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBREU7QUFQaEI7QUFIWCxDQTlNYSxFQWlQYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUseURBRFA7QUFFRUMsRUFBQUEsS0FBSyxFQUFFLGVBRlQ7QUFHRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSwyQkFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04sK2dCQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFDVCxrRUFMSztBQU1QQyxJQUFBQSxXQUFXLEVBQUUsRUFOTjtBQU9QQyxJQUFBQSxPQUFPLEVBQUUsQ0FQRjtBQVFQQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBREU7QUFSaEI7QUFIWCxDQWpQYSxFQWdTYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUsbURBRFA7QUFFRUMsRUFBQUEsS0FBSyxFQUFFLGVBRlQ7QUFHRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSwwQ0FEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04seWVBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLElBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQURFO0FBUGhCO0FBSFgsQ0FoU2EsRUE4VWI7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLGdEQURQO0FBRUVDLEVBQUFBLEtBQUssRUFBRSxlQUZUO0FBR0VDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsbUJBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLDg5RUFISztBQUlQQyxJQUFBQSxXQUFXLEVBQ1QsbVBBTEs7QUFNUEMsSUFBQUEsV0FBVyxFQUFFLEVBTk47QUFPUEMsSUFBQUEsT0FBTyxFQUFFLENBUEY7QUFRUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBREU7QUFSaEI7QUFIWCxDQTlVYSxFQThZYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUsOENBRFA7QUFFRUMsRUFBQUEsS0FBSyxFQUFFLGVBRlQ7QUFHRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxnQkFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04sd2hDQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFDVCxrRUFMSztBQU1QQyxJQUFBQSxXQUFXLEVBQUUsRUFOTjtBQU9QQyxJQUFBQSxPQUFPLEVBQUUsQ0FQRjtBQVFQQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQ2Q7QUFGbUI7QUFSaEI7QUFIWCxDQTlZYSxDIiwic291cmNlc0NvbnRlbnQiOlsiLypcbiAqIFdhenVoIGFwcCAtIE1vZHVsZSBmb3IgT3ZlcnZpZXcvVmlydXNUb3RhbCB2aXN1YWxpemF0aW9uc1xuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IFtcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1WaXJ1c3RvdGFsLUxhc3QtRmlsZXMtUGllJyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnTGFzdCBmaWxlcycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJMYXN0IGZpbGVzXCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZSxcImxhYmVsc1wiOntcInNob3dcIjpmYWxzZSxcInZhbHVlc1wiOnRydWUsXCJsYXN0X2xldmVsXCI6dHJ1ZSxcInRydW5jYXRlXCI6MTAwfX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiY3VzdG9tTGFiZWxcIjpcIkZpbGVzXCJ9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52aXJ1c3RvdGFsLnNvdXJjZS5maWxlXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne1widmlzXCI6e1wibGVnZW5kT3BlblwiOnRydWV9fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctVmlydXN0b3RhbC1GaWxlcy1UYWJsZScsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0ZpbGVzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkZpbGVzXCIsXCJ0eXBlXCI6XCJ0YWJsZVwiLFwicGFyYW1zXCI6e1wicGVyUGFnZVwiOjEwLFwic2hvd1BhcnRpYWxSb3dzXCI6ZmFsc2UsXCJzaG93TWV0aWNzQXRBbGxMZXZlbHNcIjpmYWxzZSxcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOjIsXCJkaXJlY3Rpb25cIjpcImRlc2NcIn0sXCJzaG93VG90YWxcIjpmYWxzZSxcInRvdGFsRnVuY1wiOlwic3VtXCJ9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImN1c3RvbUxhYmVsXCI6XCJDb3VudFwifX0se1wiaWRcIjpcIjRcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52aXJ1c3RvdGFsLnNvdXJjZS5maWxlXCIsXCJzaXplXCI6MTAsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIkZpbGVcIn19LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEudmlydXN0b3RhbC5wZXJtYWxpbmtcIixcInNpemVcIjoxLFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcImN1c3RvbUxhYmVsXCI6XCJMaW5rXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOlxuICAgICAgICAne1widmlzXCI6e1wicGFyYW1zXCI6e1wic29ydFwiOntcImNvbHVtbkluZGV4XCI6MixcImRpcmVjdGlvblwiOlwiZGVzY1wifX19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctVmlydXN0b3RhbC1Ub3RhbC1NYWxpY2lvdXMnLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdUb3RhbCBNYWxpY2lvdXMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiVG90YWwgTWFsaWNpb3VzXCIsXCJ0eXBlXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6ZmFsc2UsXCJ0eXBlXCI6XCJtZXRyaWNcIixcIm1ldHJpY1wiOntcInBlcmNlbnRhZ2VNb2RlXCI6ZmFsc2UsXCJ1c2VSYW5nZXNcIjpmYWxzZSxcImNvbG9yU2NoZW1hXCI6XCJHcmVlbiB0byBSZWRcIixcIm1ldHJpY0NvbG9yTW9kZVwiOlwiTm9uZVwiLFwiY29sb3JzUmFuZ2VcIjpbe1wiZnJvbVwiOjAsXCJ0b1wiOjEwMDAwfV0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZX0sXCJpbnZlcnRDb2xvcnNcIjpmYWxzZSxcInN0eWxlXCI6e1wiYmdGaWxsXCI6XCIjMDAwXCIsXCJiZ0NvbG9yXCI6ZmFsc2UsXCJsYWJlbENvbG9yXCI6ZmFsc2UsXCJzdWJUZXh0XCI6XCJcIixcImZvbnRTaXplXCI6MjB9fX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiY3VzdG9tTGFiZWxcIjpcIlRvdGFsIG1hbGljaW91cyBmaWxlc1wifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiZGF0YS52aXJ1c3RvdGFsLm1hbGljaW91c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIjFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcIjFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS52aXJ1c3RvdGFsLm1hbGljaW91c1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcIjFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLU92ZXJ2aWV3LVZpcnVzdG90YWwtVG90YWwtUG9zaXRpdmVzJyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnVG90YWwgUG9zaXRpdmVzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIlRvdGFsIFBvc2l0aXZlc1wiLFwidHlwZVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOmZhbHNlLFwidHlwZVwiOlwibWV0cmljXCIsXCJtZXRyaWNcIjp7XCJwZXJjZW50YWdlTW9kZVwiOmZhbHNlLFwidXNlUmFuZ2VzXCI6ZmFsc2UsXCJjb2xvclNjaGVtYVwiOlwiR3JlZW4gdG8gUmVkXCIsXCJtZXRyaWNDb2xvck1vZGVcIjpcIk5vbmVcIixcImNvbG9yc1JhbmdlXCI6W3tcImZyb21cIjowLFwidG9cIjoxMDAwMH1dLFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWV9LFwiaW52ZXJ0Q29sb3JzXCI6ZmFsc2UsXCJzdHlsZVwiOntcImJnRmlsbFwiOlwiIzAwMFwiLFwiYmdDb2xvclwiOmZhbHNlLFwibGFiZWxDb2xvclwiOmZhbHNlLFwic3ViVGV4dFwiOlwiXCIsXCJmb250U2l6ZVwiOjIwfX19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImN1c3RvbUxhYmVsXCI6XCJUb3RhbCBwb3NpdGl2ZSBmaWxlc1wifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJleGlzdHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiZGF0YS52aXJ1c3RvdGFsLnBvc2l0aXZlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcImV4aXN0c1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImV4aXN0c1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImZpZWxkXCI6IFwiZGF0YS52aXJ1c3RvdGFsLnBvc2l0aXZlc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJkYXRhLnZpcnVzdG90YWwucG9zaXRpdmVzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiMFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEudmlydXN0b3RhbC5wb3NpdGl2ZXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLU92ZXJ2aWV3LVZpcnVzdG90YWwtTWFsaWNpb3VzLUV2b2x1dGlvbicsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01hbGljaW91cyBFdm9sdXRpb24nLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTWFsaWNpb3VzIEV2b2x1dGlvblwiLFwidHlwZVwiOlwiaGlzdG9ncmFtXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJoaXN0b2dyYW1cIixcImdyaWRcIjp7XCJjYXRlZ29yeUxpbmVzXCI6ZmFsc2UsXCJzdHlsZVwiOntcImNvbG9yXCI6XCIjZWVlXCJ9fSxcImNhdGVnb3J5QXhlc1wiOlt7XCJpZFwiOlwiQ2F0ZWdvcnlBeGlzLTFcIixcInR5cGVcIjpcImNhdGVnb3J5XCIsXCJwb3NpdGlvblwiOlwiYm90dG9tXCIsXCJzaG93XCI6dHJ1ZSxcInN0eWxlXCI6e30sXCJzY2FsZVwiOntcInR5cGVcIjpcImxpbmVhclwifSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwidHJ1bmNhdGVcIjoxMDB9LFwidGl0bGVcIjp7fX1dLFwidmFsdWVBeGVzXCI6W3tcImlkXCI6XCJWYWx1ZUF4aXMtMVwiLFwibmFtZVwiOlwiTGVmdEF4aXMtMVwiLFwidHlwZVwiOlwidmFsdWVcIixcInBvc2l0aW9uXCI6XCJsZWZ0XCIsXCJzaG93XCI6dHJ1ZSxcInN0eWxlXCI6e30sXCJzY2FsZVwiOntcInR5cGVcIjpcImxpbmVhclwiLFwibW9kZVwiOlwibm9ybWFsXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJyb3RhdGVcIjowLFwiZmlsdGVyXCI6ZmFsc2UsXCJ0cnVuY2F0ZVwiOjEwMH0sXCJ0aXRsZVwiOntcInRleHRcIjpcIk1hbGljaW91c1wifX1dLFwic2VyaWVzUGFyYW1zXCI6W3tcInNob3dcIjpcInRydWVcIixcInR5cGVcIjpcImhpc3RvZ3JhbVwiLFwibW9kZVwiOlwic3RhY2tlZFwiLFwiZGF0YVwiOntcImxhYmVsXCI6XCJNYWxpY2lvdXNcIixcImlkXCI6XCIxXCJ9LFwidmFsdWVBeGlzXCI6XCJWYWx1ZUF4aXMtMVwiLFwiZHJhd0xpbmVzQmV0d2VlblBvaW50c1wiOnRydWUsXCJzaG93Q2lyY2xlc1wiOnRydWV9XSxcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6ZmFsc2UsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcInRpbWVzXCI6W10sXCJhZGRUaW1lTWFya2VyXCI6ZmFsc2V9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImN1c3RvbUxhYmVsXCI6XCJNYWxpY2lvdXNcIn19LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImRhdGVfaGlzdG9ncmFtXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJ0aW1lc3RhbXBcIixcImludGVydmFsXCI6XCJhdXRvXCIsXCJjdXN0b21JbnRlcnZhbFwiOlwiMmhcIixcIm1pbl9kb2NfY291bnRcIjoxLFwiZXh0ZW5kZWRfYm91bmRzXCI6e319fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOiBge1xuICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWx0ZXJcIjpbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImV4aXN0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJkYXRhLnZpcnVzdG90YWwubWFsaWNpb3VzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiZXhpc3RzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZXhpc3RzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZmllbGRcIjogXCJkYXRhLnZpcnVzdG90YWwubWFsaWNpb3VzXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcImRhdGEudmlydXN0b3RhbC5tYWxpY2lvdXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCIwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS52aXJ1c3RvdGFsLm1hbGljaW91c1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctVmlydXN0b3RhbC1Ub3RhbCcsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1RvdGFsJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIlRvdGFsXCIsXCJ0eXBlXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6ZmFsc2UsXCJ0eXBlXCI6XCJtZXRyaWNcIixcIm1ldHJpY1wiOntcInBlcmNlbnRhZ2VNb2RlXCI6ZmFsc2UsXCJ1c2VSYW5nZXNcIjpmYWxzZSxcImNvbG9yU2NoZW1hXCI6XCJHcmVlbiB0byBSZWRcIixcIm1ldHJpY0NvbG9yTW9kZVwiOlwiTm9uZVwiLFwiY29sb3JzUmFuZ2VcIjpbe1wiZnJvbVwiOjAsXCJ0b1wiOjEwMDAwfV0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZX0sXCJpbnZlcnRDb2xvcnNcIjpmYWxzZSxcInN0eWxlXCI6e1wiYmdGaWxsXCI6XCIjMDAwXCIsXCJiZ0NvbG9yXCI6ZmFsc2UsXCJsYWJlbENvbG9yXCI6ZmFsc2UsXCJzdWJUZXh0XCI6XCJcIixcImZvbnRTaXplXCI6MjB9fX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiY3VzdG9tTGFiZWxcIjpcIlRvdGFsIHNjYW5zXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOiBge1xuICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWx0ZXJcIjpbe1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcImV4aXN0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJkYXRhLnZpcnVzdG90YWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJleGlzdHNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZXhpc3RzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZmllbGRcIjogXCJkYXRhLnZpcnVzdG90YWxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfVxuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLU92ZXJ2aWV3LVZpcnVzdG90YWwtTWFsaWNpb3VzLVBlci1BZ2VudC1UYWJsZScsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01hbGljaW91cyBQZXIgQWdlbnQgVGFibGUnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTWFsaWNpb3VzIFBlciBBZ2VudCBUYWJsZVwiLFwidHlwZVwiOlwidGFibGVcIixcInBhcmFtc1wiOntcInBlclBhZ2VcIjoxMCxcInNob3dQYXJ0aWFsUm93c1wiOmZhbHNlLFwic2hvd01ldGljc0F0QWxsTGV2ZWxzXCI6ZmFsc2UsXCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjoyLFwiZGlyZWN0aW9uXCI6XCJkZXNjXCJ9LFwic2hvd1RvdGFsXCI6ZmFsc2UsXCJ0b3RhbEZ1bmNcIjpcInN1bVwifSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY2FyZGluYWxpdHlcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS52aXJ1c3RvdGFsLnNvdXJjZS5tZDVcIixcImN1c3RvbUxhYmVsXCI6XCJNYWxpY2lvdXMgZGV0ZWN0ZWQgZmlsZXNcIn19LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImFnZW50Lm5hbWVcIixcInNpemVcIjoxNixcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJjdXN0b21MYWJlbFwiOlwiQWdlbnRcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046XG4gICAgICAgICd7XCJ2aXNcIjp7XCJwYXJhbXNcIjp7XCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjoyLFwiZGlyZWN0aW9uXCI6XCJkZXNjXCJ9fX19JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJkYXRhLnZpcnVzdG90YWwubWFsaWNpb3VzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiMFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiMFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLnZpcnVzdG90YWwubWFsaWNpb3VzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiMFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctVmlydXN0b3RhbC1NYWxpY2lvdXMtUGVyLUFnZW50JyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnVG9wIDUgYWdlbnRzIHdpdGggdW5pcXVlIG1hbGljaW91cyBmaWxlcycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJUb3AgNSBhZ2VudHMgd2l0aCB1bmlxdWUgbWFsaWNpb3VzIGZpbGVzXCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZSxcImxhYmVsc1wiOntcInNob3dcIjpmYWxzZSxcInZhbHVlc1wiOnRydWUsXCJsYXN0X2xldmVsXCI6dHJ1ZSxcInRydW5jYXRlXCI6MTAwfX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNhcmRpbmFsaXR5XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEudmlydXN0b3RhbC5zb3VyY2UubWQ1XCJ9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiYWdlbnQubmFtZVwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJkYXRhLnZpcnVzdG90YWwubWFsaWNpb3VzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiMFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiMFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLnZpcnVzdG90YWwubWFsaWNpb3VzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiMFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctVmlydXN0b3RhbC1BbGVydHMtRXZvbHV0aW9uJyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnUG9zaXRpdmVzIEhlYXRtYXAnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7IFwidGl0bGVcIjogXCJBbGVydHMgZXZvbHV0aW9uIGJ5IGFnZW50c1wiLCBcInR5cGVcIjogXCJoaXN0b2dyYW1cIiwgXCJwYXJhbXNcIjogeyBcInR5cGVcIjogXCJoaXN0b2dyYW1cIiwgXCJncmlkXCI6IHsgXCJjYXRlZ29yeUxpbmVzXCI6IGZhbHNlIH0sIFwiY2F0ZWdvcnlBeGVzXCI6IFsgeyBcImlkXCI6IFwiQ2F0ZWdvcnlBeGlzLTFcIiwgXCJ0eXBlXCI6IFwiY2F0ZWdvcnlcIiwgXCJwb3NpdGlvblwiOiBcImJvdHRvbVwiLCBcInNob3dcIjogdHJ1ZSwgXCJzdHlsZVwiOiB7fSwgXCJzY2FsZVwiOiB7IFwidHlwZVwiOiBcImxpbmVhclwiIH0sIFwibGFiZWxzXCI6IHsgXCJzaG93XCI6IHRydWUsIFwiZmlsdGVyXCI6IHRydWUsIFwidHJ1bmNhdGVcIjogMTAwIH0sIFwidGl0bGVcIjoge30gfSBdLCBcInZhbHVlQXhlc1wiOiBbIHsgXCJpZFwiOiBcIlZhbHVlQXhpcy0xXCIsIFwibmFtZVwiOiBcIkxlZnRBeGlzLTFcIiwgXCJ0eXBlXCI6IFwidmFsdWVcIiwgXCJwb3NpdGlvblwiOiBcImxlZnRcIiwgXCJzaG93XCI6IHRydWUsIFwic3R5bGVcIjoge30sIFwic2NhbGVcIjogeyBcInR5cGVcIjogXCJsaW5lYXJcIiwgXCJtb2RlXCI6IFwibm9ybWFsXCIgfSwgXCJsYWJlbHNcIjogeyBcInNob3dcIjogdHJ1ZSwgXCJyb3RhdGVcIjogMCwgXCJmaWx0ZXJcIjogZmFsc2UsIFwidHJ1bmNhdGVcIjogMTAwIH0sIFwidGl0bGVcIjogeyBcInRleHRcIjogXCJDb3VudFwiIH0gfSBdLCBcInNlcmllc1BhcmFtc1wiOiBbIHsgXCJzaG93XCI6IHRydWUsIFwidHlwZVwiOiBcImhpc3RvZ3JhbVwiLCBcIm1vZGVcIjogXCJzdGFja2VkXCIsIFwiZGF0YVwiOiB7IFwibGFiZWxcIjogXCJDb3VudFwiLCBcImlkXCI6IFwiMVwiIH0sIFwidmFsdWVBeGlzXCI6IFwiVmFsdWVBeGlzLTFcIiwgXCJkcmF3TGluZXNCZXR3ZWVuUG9pbnRzXCI6IHRydWUsIFwibGluZVdpZHRoXCI6IDIsIFwic2hvd0NpcmNsZXNcIjogdHJ1ZSB9IF0sIFwiYWRkVG9vbHRpcFwiOiB0cnVlLCBcImFkZExlZ2VuZFwiOiB0cnVlLCBcImxlZ2VuZFBvc2l0aW9uXCI6IFwicmlnaHRcIiwgXCJ0aW1lc1wiOiBbXSwgXCJhZGRUaW1lTWFya2VyXCI6IGZhbHNlLCBcImxhYmVsc1wiOiB7IFwic2hvd1wiOiBmYWxzZSB9LCBcInRocmVzaG9sZExpbmVcIjogeyBcInNob3dcIjogZmFsc2UsIFwidmFsdWVcIjogMTAsIFwid2lkdGhcIjogMSwgXCJzdHlsZVwiOiBcImZ1bGxcIiwgXCJjb2xvclwiOiBcIiNFNzY2NENcIiB9LCBcImRpbWVuc2lvbnNcIjogeyBcInhcIjogeyBcImFjY2Vzc29yXCI6IDAsIFwiZm9ybWF0XCI6IHsgXCJpZFwiOiBcImRhdGVcIiwgXCJwYXJhbXNcIjogeyBcInBhdHRlcm5cIjogXCJZWVlZLU1NLUREIEhIOm1tXCIgfSB9LCBcInBhcmFtc1wiOiB7IFwiZGF0ZVwiOiB0cnVlLCBcImludGVydmFsXCI6IFwiUFQzSFwiLCBcImludGVydmFsRVNWYWx1ZVwiOiAzLCBcImludGVydmFsRVNVbml0XCI6IFwiaFwiLCBcImZvcm1hdFwiOiBcIllZWVktTU0tREQgSEg6bW1cIiwgXCJib3VuZHNcIjogeyBcIm1pblwiOiBcIjIwMjAtMDQtMTdUMTI6MTE6MzUuOTQzWlwiLCBcIm1heFwiOiBcIjIwMjAtMDQtMjRUMTI6MTE6MzUuOTQ0WlwiIH0gfSwgXCJsYWJlbFwiOiBcInRpbWVzdGFtcCBwZXIgMyBob3Vyc1wiLCBcImFnZ1R5cGVcIjogXCJkYXRlX2hpc3RvZ3JhbVwiIH0sIFwieVwiOiBbIHsgXCJhY2Nlc3NvclwiOiAyLCBcImZvcm1hdFwiOiB7IFwiaWRcIjogXCJudW1iZXJcIiB9LCBcInBhcmFtc1wiOiB7fSwgXCJsYWJlbFwiOiBcIkNvdW50XCIsIFwiYWdnVHlwZVwiOiBcImNvdW50XCIgfSBdLCBcInNlcmllc1wiOiBbIHsgXCJhY2Nlc3NvclwiOiAxLCBcImZvcm1hdFwiOiB7IFwiaWRcIjogXCJzdHJpbmdcIiwgXCJwYXJhbXNcIjogeyBcInBhcnNlZFVybFwiOiB7IFwib3JpZ2luXCI6IFwiaHR0cDovL2xvY2FsaG9zdDo1NjAxXCIsIFwicGF0aG5hbWVcIjogXCIvYXBwL2tpYmFuYVwiLCBcImJhc2VQYXRoXCI6IFwiXCIgfSB9IH0sIFwicGFyYW1zXCI6IHt9LCBcImxhYmVsXCI6IFwiVG9wIDUgdW51c3VhbCB0ZXJtcyBpbiBhZ2VudC5uYW1lXCIsIFwiYWdnVHlwZVwiOiBcInNpZ25pZmljYW50X3Rlcm1zXCIgfSBdIH0sIFwicmFkaXVzUmF0aW9cIjogNTAgfSwgXCJhZ2dzXCI6IFsgeyBcImlkXCI6IFwiMVwiLCBcImVuYWJsZWRcIjogdHJ1ZSwgXCJ0eXBlXCI6IFwiY291bnRcIiwgXCJzY2hlbWFcIjogXCJtZXRyaWNcIiwgXCJwYXJhbXNcIjoge30gfSwgeyBcImlkXCI6IFwiMlwiLCBcImVuYWJsZWRcIjogdHJ1ZSwgXCJ0eXBlXCI6IFwiZGF0ZV9oaXN0b2dyYW1cIiwgXCJzY2hlbWFcIjogXCJzZWdtZW50XCIsIFwicGFyYW1zXCI6IHsgXCJmaWVsZFwiOiBcInRpbWVzdGFtcFwiLCBcInRpbWVSYW5nZVwiOiB7IFwiZnJvbVwiOiBcIm5vdy03ZFwiLCBcInRvXCI6IFwibm93XCIgfSwgXCJ1c2VOb3JtYWxpemVkRXNJbnRlcnZhbFwiOiB0cnVlLCBcInNjYWxlTWV0cmljVmFsdWVzXCI6IGZhbHNlLCBcImludGVydmFsXCI6IFwiYXV0b1wiLCBcImRyb3BfcGFydGlhbHNcIjogZmFsc2UsIFwibWluX2RvY19jb3VudFwiOiAxLCBcImV4dGVuZGVkX2JvdW5kc1wiOiB7fSB9IH0sIHsgXCJpZFwiOiBcIjNcIiwgXCJlbmFibGVkXCI6IHRydWUsIFwidHlwZVwiOiBcInRlcm1zXCIsIFwic2NoZW1hXCI6IFwiZ3JvdXBcIiwgXCJwYXJhbXNcIjogeyBcImZpZWxkXCI6IFwiYWdlbnQubmFtZVwiLCBcIm9yZGVyQnlcIjogXCIxXCIsIFwib3JkZXJcIjogXCJkZXNjXCIsIFwic2l6ZVwiOiA1LCBcIm90aGVyQnVja2V0XCI6IGZhbHNlLCBcIm90aGVyQnVja2V0TGFiZWxcIjogXCJPdGhlclwiLCBcIm1pc3NpbmdCdWNrZXRcIjogZmFsc2UsIFwibWlzc2luZ0J1Y2tldExhYmVsXCI6IFwiTWlzc2luZ1wiIH0gfSBdIH0nLFxuICAgICAgdWlTdGF0ZUpTT046XG4gICAgICAgICd7XCJ2aXNcIjp7XCJkZWZhdWx0Q29sb3JzXCI6e1wiMCAtIDdcIjpcInJnYigyNDcsMjUxLDI1NSlcIixcIjcgLSAxM1wiOlwicmdiKDIxOSwyMzMsMjQ2KVwiLFwiMTMgLSAyMFwiOlwicmdiKDE4NywyMTQsMjM1KVwiLFwiMjAgLSAyNlwiOlwicmdiKDEzNywxOTAsMjIwKVwiLFwiMjYgLSAzM1wiOlwicmdiKDgzLDE1OCwyMDUpXCIsXCIzMyAtIDM5XCI6XCJyZ2IoNDIsMTIzLDE4NilcIixcIjM5IC0gNDVcIjpcInJnYigxMSw4NSwxNTkpXCJ9LFwibGVnZW5kT3BlblwiOnRydWV9fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwiZXhpc3RzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcImRhdGEudmlydXN0b3RhbC5wb3NpdGl2ZXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJleGlzdHNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJleGlzdHNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmaWVsZFwiOiBcImRhdGEudmlydXN0b3RhbC5wb3NpdGl2ZXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkc3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiZGF0YS52aXJ1c3RvdGFsLnBvc2l0aXZlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIjBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLnZpcnVzdG90YWwucG9zaXRpdmVzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkc3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn1cbiAgICAgICAgICAgICAgICB9YFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1WaXJ1c3RvdGFsLUFsZXJ0cy1zdW1tYXJ5JyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnQWxlcnRzIHN1bW1hcnknLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiQWxlcnRzIHN1bW1hcnlcIixcInR5cGVcIjpcInRhYmxlXCIsXCJwYXJhbXNcIjp7XCJwZXJQYWdlXCI6MTAsXCJzaG93UGFydGlhbFJvd3NcIjpmYWxzZSxcInNob3dNZXRpY3NBdEFsbExldmVsc1wiOmZhbHNlLFwic29ydFwiOntcImNvbHVtbkluZGV4XCI6MyxcImRpcmVjdGlvblwiOlwiZGVzY1wifSxcInNob3dUb3RhbFwiOmZhbHNlLFwidG90YWxGdW5jXCI6XCJzdW1cIn0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcInJ1bGUuaWRcIixcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCIsXCJzaXplXCI6NTAsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIlJ1bGUgSURcIn19LHtcImlkXCI6XCIzXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcInJ1bGUuZGVzY3JpcHRpb25cIixcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCIsXCJzaXplXCI6MjAsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIkRlc2NyaXB0aW9uXCJ9fSx7XCJpZFwiOlwiNFwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJydWxlLmxldmVsXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwic2l6ZVwiOjEyLFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcImN1c3RvbUxhYmVsXCI6XCJMZXZlbFwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjpcbiAgICAgICAgJ3tcInZpc1wiOntcInBhcmFtc1wiOntcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOjMsXCJkaXJlY3Rpb25cIjpcImRlc2NcIn19fX0nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfVxuICB9LFxuXTtcbiJdfQ==