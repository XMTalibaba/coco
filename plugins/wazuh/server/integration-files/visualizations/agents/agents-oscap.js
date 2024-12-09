"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Wazuh app - Module for Agents/OSCAP visualizations
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
  _id: 'Wazuh-App-Agents-OSCAP-Higher-score-metric',
  _source: {
    title: 'Higher score metric',
    visState: '{"title":"Higher score metric","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"gauge","gauge":{"verticalSplit":false,"autoExtend":false,"percentageMode":false,"gaugeType":"Metric","gaugeStyle":"Full","backStyle":"Full","orientation":"vertical","colorSchema":"Green to Red","gaugeColorMode":"None","useRange":false,"colorsRange":[{"from":0,"to":100}],"invertColors":false,"labels":{"show":true,"color":"black"},"scale":{"show":false,"labels":false,"color":"#333","width":2},"type":"simple","style":{"fontSize":20,"bgColor":false,"labelColor":false,"subText":""}}},"aggs":[{"id":"1","enabled":true,"type":"max","schema":"metric","params":{"field":"data.oscap.scan.score","customLabel":"Higher score"}}]}',
    uiStateJSON: '{"vis":{"defaultColors":{"0 - 100":"rgb(0,104,55)"}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-OSCAP-Lower-score-metric',
  _source: {
    title: 'Lower score metric',
    visState: '{"title":"Lower score metric","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"gauge","gauge":{"verticalSplit":false,"autoExtend":false,"percentageMode":false,"gaugeType":"Metric","gaugeStyle":"Full","backStyle":"Full","orientation":"vertical","colorSchema":"Green to Red","gaugeColorMode":"None","useRange":false,"colorsRange":[{"from":0,"to":100}],"invertColors":false,"labels":{"show":true,"color":"black"},"scale":{"show":false,"labels":false,"color":"#333","width":2},"type":"simple","style":{"fontSize":20,"bgColor":false,"labelColor":false,"subText":""}}},"aggs":[{"id":"1","enabled":true,"type":"min","schema":"metric","params":{"field":"data.oscap.scan.score","customLabel":"Lower score"}}]}',
    uiStateJSON: '{"vis":{"defaultColors":{"0 - 100":"rgb(0,104,55)"}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-OSCAP-Last-score',
  _source: {
    title: 'Last score',
    visState: '{"title":"Last score","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"max","schema":"metric","params":{"field":"timestamp"}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.oscap.scan.score","size":1,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":null,"direction":null}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-OSCAP-Last-scan-profile',
  _source: {
    title: 'Last scan profile',
    visState: '{"title":"Last scan profile","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"max","schema":"metric","params":{"field":"timestamp"}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.oscap.scan.profile.title","size":1,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":null,"direction":null}}}}',
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
                              "key": "data.oscap.check.result",
                              "value": "fail",
                              "params": {
                                "query": "fail",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.oscap.check.result": {
                                  "query": "fail",
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
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-OSCAP-Scans',
  _source: {
    title: 'Scans',
    visState: '{"title":"Scans","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.oscap.scan.id","size":5,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-OSCAP-Profiles',
  _source: {
    title: 'Profiles',
    visState: '{"title":"Profiles","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.oscap.scan.profile.title","size":5,"order":"desc","orderBy":"1"}}]}',
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
                              "key": "data.oscap.check.result",
                              "value": "fail",
                              "params": {
                                "query": "fail",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.oscap.check.result": {
                                  "query": "fail",
                                  "type": "phrase"
                                }
                              }
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
                              "key": "rule.groups",
                              "value": "syslog",
                              "params": {
                                "query": "syslog",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "rule.groups": {
                                  "query": "syslog",
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
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-OSCAP-Content',
  _source: {
    title: 'Content',
    visState: '{"title":"Content","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.oscap.scan.content","size":5,"order":"desc","orderBy":"1"}}]}',
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
                              "key": "data.oscap.check.result",
                              "value": "fail",
                              "params": {
                                "query": "fail",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.oscap.check.result": {
                                  "query": "fail",
                                  "type": "phrase"
                                }
                              }
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
                              "key": "rule.groups",
                              "value": "syslog",
                              "params": {
                                "query": "syslog",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "rule.groups": {
                                  "query": "syslog",
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
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-OSCAP-Severity',
  _source: {
    title: 'Severity',
    visState: '{"title":"Severity","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.oscap.check.severity","size":5,"order":"desc","orderBy":"1"}}]}',
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
                              "key": "data.oscap.check.result",
                              "value": "fail",
                              "params": {
                                "query": "fail",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.oscap.check.result": {
                                  "query": "fail",
                                  "type": "phrase"
                                }
                              }
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
                              "key": "rule.groups",
                              "value": "syslog",
                              "params": {
                                "query": "syslog",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "rule.groups": {
                                  "query": "syslog",
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
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-OSCAP-Daily-scans-evolution',
  _source: {
    title: 'Daily scans evolution',
    visState: '{"title":"Daily scans evolution","type":"histogram","params":{"type":"histogram","grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":false,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{},"customLabel":"Daily scans"}}]}',
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
                              "key": "data.oscap.check.result",
                              "value": "fail",
                              "params": {
                                "query": "fail",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.oscap.check.result": {
                                  "query": "fail",
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
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-OSCAP-Top-5-Alerts',
  _source: {
    title: 'Top 5 Alerts',
    visState: '{"title":"Top 5 Alerts","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.oscap.check.title","size":5,"order":"desc","orderBy":"1"}}]}',
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
                              "key": "data.oscap.check.result",
                              "value": "fail",
                              "params": {
                                "query": "fail",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.oscap.check.result": {
                                  "query": "fail",
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
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-OSCAP-Top-5-High-risk-alerts',
  _source: {
    title: 'Top 5 High risk alerts',
    visState: '{"title":"Top 5 High risk alerts","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.oscap.check.title","size":5,"order":"desc","orderBy":"1"}}]}',
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
                              "key": "data.oscap.check.result",
                              "value": "fail",
                              "params": {
                                "query": "fail",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.oscap.check.result": {
                                  "query": "fail",
                                  "type": "phrase"
                                }
                              }
                            },
                            "$state": {
                              "store": "appState"
                            }
                        },
                        {
                            "meta": {
                              "index": "wazuh-alerts",
                              "negate": false,
                              "disabled": false,
                              "alias": null,
                              "type": "phrase",
                              "key": "data.oscap.check.severity",
                              "value": "high",
                              "params": {
                                "query": "high",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.oscap.check.severity": {
                                  "query": "high",
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
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-OSCAP-Top-alert',
  _source: {
    title: 'Top alert',
    visState: '{"title":"Top alert","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.oscap.check.title","size":1,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":null,"direction":null}}}}',
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
                              "key": "data.oscap.check.result",
                              "value": "fail",
                              "params": {
                                "query": "fail",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "data.oscap.check.result": {
                                  "query": "fail",
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
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-OSCAP-Last-alerts',
  _type: 'visualization',
  _source: {
    title: 'Last alerts',
    visState: '{"title":"Last alerts","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":2,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.oscap.check.title","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":50,"order":"desc","orderBy":"1","customLabel":"Title"}},{"id":"4","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.oscap.scan.profile.title","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":5,"order":"desc","orderBy":"1","customLabel":"Profile"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":2,"direction":"desc"}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}];
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFnZW50cy1vc2NhcC50cyJdLCJuYW1lcyI6WyJfaWQiLCJfc291cmNlIiwidGl0bGUiLCJ2aXNTdGF0ZSIsInVpU3RhdGVKU09OIiwiZGVzY3JpcHRpb24iLCJ2ZXJzaW9uIiwia2liYW5hU2F2ZWRPYmplY3RNZXRhIiwic2VhcmNoU291cmNlSlNPTiIsIl90eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7O2VBV2UsQ0FDYjtBQUNFQSxFQUFBQSxHQUFHLEVBQUUsNENBRFA7QUFFRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxxQkFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04scXRCQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFBRSx1REFKTjtBQUtQQyxJQUFBQSxXQUFXLEVBQUUsRUFMTjtBQU1QQyxJQUFBQSxPQUFPLEVBQUUsQ0FORjtBQU9QQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQ2Q7QUFGbUI7QUFQaEIsR0FGWDtBQWNFQyxFQUFBQSxLQUFLLEVBQUU7QUFkVCxDQURhLEVBaUJiO0FBQ0VULEVBQUFBLEdBQUcsRUFBRSwyQ0FEUDtBQUVFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLG9CQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTixtdEJBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLHVEQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVBoQixHQUZYO0FBY0VDLEVBQUFBLEtBQUssRUFBRTtBQWRULENBakJhLEVBaUNiO0FBQ0VULEVBQUFBLEdBQUcsRUFBRSxtQ0FEUDtBQUVFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLFlBREE7QUFFUEMsSUFBQUEsUUFB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T1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQURFO0FBUGhCLEdBRlg7QUFzRUVDLEVBQUFBLEtBQUssRUFBRTtBQXRFVCxDQXJhYSxFQTZlYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUsa0NBRFA7QUFFRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxXQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTixrYUFISztBQUlQQyxJQUFBQSxXQUFXLEVBQ1QsbUVBTEs7QUFNUEMsSUFBQUEsV0FBVyxFQUFFLEVBTk47QUFPUEMsSUFBQUEsT0FBTyxFQUFFLENBUEY7QUFRUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQURFO0FBUmhCLEdBRlg7QUE2Q0VDLEVBQUFBLEtBQUssRUFBRTtBQTdDVCxDQTdlYSxFQTRoQmI7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLG9DQURQO0FBRUVTLEVBQUFBLEtBQUssRUFBRSxlQUZUO0FBR0VSLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsYUFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04sOHlCQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFDVCxrRUFMSztBQU1QQyxJQUFBQSxXQUFXLEVBQUUsRUFOTjtBQU9QQyxJQUFBQSxPQUFPLEVBQUUsQ0FQRjtBQVFQQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQ2Q7QUFGbUI7QUFSaEI7QUFIWCxDQTVoQmEsQyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBXYXp1aCBhcHAgLSBNb2R1bGUgZm9yIEFnZW50cy9PU0NBUCB2aXN1YWxpemF0aW9uc1xuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IFtcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtT1NDQVAtSGlnaGVyLXNjb3JlLW1ldHJpYycsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdIaWdoZXIgc2NvcmUgbWV0cmljJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkhpZ2hlciBzY29yZSBtZXRyaWNcIixcInR5cGVcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjpmYWxzZSxcInR5cGVcIjpcImdhdWdlXCIsXCJnYXVnZVwiOntcInZlcnRpY2FsU3BsaXRcIjpmYWxzZSxcImF1dG9FeHRlbmRcIjpmYWxzZSxcInBlcmNlbnRhZ2VNb2RlXCI6ZmFsc2UsXCJnYXVnZVR5cGVcIjpcIk1ldHJpY1wiLFwiZ2F1Z2VTdHlsZVwiOlwiRnVsbFwiLFwiYmFja1N0eWxlXCI6XCJGdWxsXCIsXCJvcmllbnRhdGlvblwiOlwidmVydGljYWxcIixcImNvbG9yU2NoZW1hXCI6XCJHcmVlbiB0byBSZWRcIixcImdhdWdlQ29sb3JNb2RlXCI6XCJOb25lXCIsXCJ1c2VSYW5nZVwiOmZhbHNlLFwiY29sb3JzUmFuZ2VcIjpbe1wiZnJvbVwiOjAsXCJ0b1wiOjEwMH1dLFwiaW52ZXJ0Q29sb3JzXCI6ZmFsc2UsXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcImNvbG9yXCI6XCJibGFja1wifSxcInNjYWxlXCI6e1wic2hvd1wiOmZhbHNlLFwibGFiZWxzXCI6ZmFsc2UsXCJjb2xvclwiOlwiIzMzM1wiLFwid2lkdGhcIjoyfSxcInR5cGVcIjpcInNpbXBsZVwiLFwic3R5bGVcIjp7XCJmb250U2l6ZVwiOjIwLFwiYmdDb2xvclwiOmZhbHNlLFwibGFiZWxDb2xvclwiOmZhbHNlLFwic3ViVGV4dFwiOlwiXCJ9fX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcIm1heFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLm9zY2FwLnNjYW4uc2NvcmVcIixcImN1c3RvbUxhYmVsXCI6XCJIaWdoZXIgc2NvcmVcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7XCJ2aXNcIjp7XCJkZWZhdWx0Q29sb3JzXCI6e1wiMCAtIDEwMFwiOlwicmdiKDAsMTA0LDU1KVwifX19JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1PU0NBUC1Mb3dlci1zY29yZS1tZXRyaWMnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnTG93ZXIgc2NvcmUgbWV0cmljJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkxvd2VyIHNjb3JlIG1ldHJpY1wiLFwidHlwZVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOmZhbHNlLFwidHlwZVwiOlwiZ2F1Z2VcIixcImdhdWdlXCI6e1widmVydGljYWxTcGxpdFwiOmZhbHNlLFwiYXV0b0V4dGVuZFwiOmZhbHNlLFwicGVyY2VudGFnZU1vZGVcIjpmYWxzZSxcImdhdWdlVHlwZVwiOlwiTWV0cmljXCIsXCJnYXVnZVN0eWxlXCI6XCJGdWxsXCIsXCJiYWNrU3R5bGVcIjpcIkZ1bGxcIixcIm9yaWVudGF0aW9uXCI6XCJ2ZXJ0aWNhbFwiLFwiY29sb3JTY2hlbWFcIjpcIkdyZWVuIHRvIFJlZFwiLFwiZ2F1Z2VDb2xvck1vZGVcIjpcIk5vbmVcIixcInVzZVJhbmdlXCI6ZmFsc2UsXCJjb2xvcnNSYW5nZVwiOlt7XCJmcm9tXCI6MCxcInRvXCI6MTAwfV0sXCJpbnZlcnRDb2xvcnNcIjpmYWxzZSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwiY29sb3JcIjpcImJsYWNrXCJ9LFwic2NhbGVcIjp7XCJzaG93XCI6ZmFsc2UsXCJsYWJlbHNcIjpmYWxzZSxcImNvbG9yXCI6XCIjMzMzXCIsXCJ3aWR0aFwiOjJ9LFwidHlwZVwiOlwic2ltcGxlXCIsXCJzdHlsZVwiOntcImZvbnRTaXplXCI6MjAsXCJiZ0NvbG9yXCI6ZmFsc2UsXCJsYWJlbENvbG9yXCI6ZmFsc2UsXCJzdWJUZXh0XCI6XCJcIn19fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwibWluXCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEub3NjYXAuc2Nhbi5zY29yZVwiLFwiY3VzdG9tTGFiZWxcIjpcIkxvd2VyIHNjb3JlXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne1widmlzXCI6e1wiZGVmYXVsdENvbG9yc1wiOntcIjAgLSAxMDBcIjpcInJnYigwLDEwNCw1NSlcIn19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtT1NDQVAtTGFzdC1zY29yZScsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdMYXN0IHNjb3JlJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkxhc3Qgc2NvcmVcIixcInR5cGVcIjpcInRhYmxlXCIsXCJwYXJhbXNcIjp7XCJwZXJQYWdlXCI6MTAsXCJzaG93UGFydGlhbFJvd3NcIjpmYWxzZSxcInNob3dNZXRpY3NBdEFsbExldmVsc1wiOmZhbHNlLFwic29ydFwiOntcImNvbHVtbkluZGV4XCI6bnVsbCxcImRpcmVjdGlvblwiOm51bGx9LFwic2hvd1RvdGFsXCI6ZmFsc2UsXCJ0b3RhbEZ1bmNcIjpcInN1bVwifSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwibWF4XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcInRpbWVzdGFtcFwifX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS5vc2NhcC5zY2FuLnNjb3JlXCIsXCJzaXplXCI6MSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOlxuICAgICAgICAne1widmlzXCI6e1wicGFyYW1zXCI6e1wic29ydFwiOntcImNvbHVtbkluZGV4XCI6bnVsbCxcImRpcmVjdGlvblwiOm51bGx9fX19JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1PU0NBUC1MYXN0LXNjYW4tcHJvZmlsZScsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdMYXN0IHNjYW4gcHJvZmlsZScsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJMYXN0IHNjYW4gcHJvZmlsZVwiLFwidHlwZVwiOlwidGFibGVcIixcInBhcmFtc1wiOntcInBlclBhZ2VcIjoxMCxcInNob3dQYXJ0aWFsUm93c1wiOmZhbHNlLFwic2hvd01ldGljc0F0QWxsTGV2ZWxzXCI6ZmFsc2UsXCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjpudWxsLFwiZGlyZWN0aW9uXCI6bnVsbH0sXCJzaG93VG90YWxcIjpmYWxzZSxcInRvdGFsRnVuY1wiOlwic3VtXCJ9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJtYXhcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwidGltZXN0YW1wXCJ9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLm9zY2FwLnNjYW4ucHJvZmlsZS50aXRsZVwiLFwic2l6ZVwiOjEsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjpcbiAgICAgICAgJ3tcInZpc1wiOntcInBhcmFtc1wiOntcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOm51bGwsXCJkaXJlY3Rpb25cIjpudWxsfX19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcImRhdGEub3NjYXAuY2hlY2sucmVzdWx0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLm9zY2FwLmNoZWNrLnJlc3VsdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn1cbiAgICAgICAgICAgICAgICB9YFxuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1PU0NBUC1TY2FucycsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdTY2FucycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJTY2Fuc1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWV9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS5vc2NhcC5zY2FuLmlkXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLU9TQ0FQLVByb2ZpbGVzJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1Byb2ZpbGVzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIlByb2ZpbGVzXCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLm9zY2FwLnNjYW4ucHJvZmlsZS50aXRsZVwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiZGF0YS5vc2NhcC5jaGVjay5yZXN1bHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJmYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJmYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEub3NjYXAuY2hlY2sucmVzdWx0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcInJ1bGUuZ3JvdXBzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwic3lzbG9nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJzeXNsb2dcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicnVsZS5ncm91cHNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJzeXNsb2dcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn1cbiAgICAgICAgICAgICAgICB9YFxuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1PU0NBUC1Db250ZW50JyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0NvbnRlbnQnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiQ29udGVudFwiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWV9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS5vc2NhcC5zY2FuLmNvbnRlbnRcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcImRhdGEub3NjYXAuY2hlY2sucmVzdWx0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLm9zY2FwLmNoZWNrLnJlc3VsdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJydWxlLmdyb3Vwc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcInN5c2xvZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwic3lzbG9nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJ1bGUuZ3JvdXBzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwic3lzbG9nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkc3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtT1NDQVAtU2V2ZXJpdHknLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnU2V2ZXJpdHknLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiU2V2ZXJpdHlcIixcInR5cGVcIjpcInBpZVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwicGllXCIsXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcImlzRG9udXRcIjp0cnVlfSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEub3NjYXAuY2hlY2suc2V2ZXJpdHlcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcImRhdGEub3NjYXAuY2hlY2sucmVzdWx0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLm9zY2FwLmNoZWNrLnJlc3VsdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJydWxlLmdyb3Vwc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcInN5c2xvZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwic3lzbG9nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJ1bGUuZ3JvdXBzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwic3lzbG9nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkc3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtT1NDQVAtRGFpbHktc2NhbnMtZXZvbHV0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0RhaWx5IHNjYW5zIGV2b2x1dGlvbicsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJEYWlseSBzY2FucyBldm9sdXRpb25cIixcInR5cGVcIjpcImhpc3RvZ3JhbVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwiaGlzdG9ncmFtXCIsXCJncmlkXCI6e1wiY2F0ZWdvcnlMaW5lc1wiOmZhbHNlLFwic3R5bGVcIjp7XCJjb2xvclwiOlwiI2VlZVwifX0sXCJjYXRlZ29yeUF4ZXNcIjpbe1wiaWRcIjpcIkNhdGVnb3J5QXhpcy0xXCIsXCJ0eXBlXCI6XCJjYXRlZ29yeVwiLFwicG9zaXRpb25cIjpcImJvdHRvbVwiLFwic2hvd1wiOnRydWUsXCJzdHlsZVwiOnt9LFwic2NhbGVcIjp7XCJ0eXBlXCI6XCJsaW5lYXJcIn0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcInRydW5jYXRlXCI6MTAwfSxcInRpdGxlXCI6e319XSxcInZhbHVlQXhlc1wiOlt7XCJpZFwiOlwiVmFsdWVBeGlzLTFcIixcIm5hbWVcIjpcIkxlZnRBeGlzLTFcIixcInR5cGVcIjpcInZhbHVlXCIsXCJwb3NpdGlvblwiOlwibGVmdFwiLFwic2hvd1wiOnRydWUsXCJzdHlsZVwiOnt9LFwic2NhbGVcIjp7XCJ0eXBlXCI6XCJsaW5lYXJcIixcIm1vZGVcIjpcIm5vcm1hbFwifSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwicm90YXRlXCI6MCxcImZpbHRlclwiOmZhbHNlLFwidHJ1bmNhdGVcIjoxMDB9LFwidGl0bGVcIjp7XCJ0ZXh0XCI6XCJDb3VudFwifX1dLFwic2VyaWVzUGFyYW1zXCI6W3tcInNob3dcIjpcInRydWVcIixcInR5cGVcIjpcImhpc3RvZ3JhbVwiLFwibW9kZVwiOlwic3RhY2tlZFwiLFwiZGF0YVwiOntcImxhYmVsXCI6XCJDb3VudFwiLFwiaWRcIjpcIjFcIn0sXCJ2YWx1ZUF4aXNcIjpcIlZhbHVlQXhpcy0xXCIsXCJkcmF3TGluZXNCZXR3ZWVuUG9pbnRzXCI6dHJ1ZSxcInNob3dDaXJjbGVzXCI6dHJ1ZX1dLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjpmYWxzZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwidGltZXNcIjpbXSxcImFkZFRpbWVNYXJrZXJcIjpmYWxzZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImRhdGVfaGlzdG9ncmFtXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJ0aW1lc3RhbXBcIixcImludGVydmFsXCI6XCJhdXRvXCIsXCJjdXN0b21JbnRlcnZhbFwiOlwiMmhcIixcIm1pbl9kb2NfY291bnRcIjoxLFwiZXh0ZW5kZWRfYm91bmRzXCI6e30sXCJjdXN0b21MYWJlbFwiOlwiRGFpbHkgc2NhbnNcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcImRhdGEub3NjYXAuY2hlY2sucmVzdWx0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLm9zY2FwLmNoZWNrLnJlc3VsdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn1cbiAgICAgICAgICAgICAgICB9YFxuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1PU0NBUC1Ub3AtNS1BbGVydHMnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnVG9wIDUgQWxlcnRzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIlRvcCA1IEFsZXJ0c1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWV9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS5vc2NhcC5jaGVjay50aXRsZVwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiZGF0YS5vc2NhcC5jaGVjay5yZXN1bHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJmYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJmYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEub3NjYXAuY2hlY2sucmVzdWx0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLU9TQ0FQLVRvcC01LUhpZ2gtcmlzay1hbGVydHMnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnVG9wIDUgSGlnaCByaXNrIGFsZXJ0cycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJUb3AgNSBIaWdoIHJpc2sgYWxlcnRzXCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLm9zY2FwLmNoZWNrLnRpdGxlXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOiBge1xuICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWx0ZXJcIjpbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJkYXRhLm9zY2FwLmNoZWNrLnJlc3VsdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS5vc2NhcC5jaGVjay5yZXN1bHRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJmYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkc3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiZGF0YS5vc2NhcC5jaGVjay5zZXZlcml0eVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS5vc2NhcC5jaGVjay5zZXZlcml0eVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn1cbiAgICAgICAgICAgICAgICB9YFxuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1PU0NBUC1Ub3AtYWxlcnQnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnVG9wIGFsZXJ0JyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIlRvcCBhbGVydFwiLFwidHlwZVwiOlwidGFibGVcIixcInBhcmFtc1wiOntcInBlclBhZ2VcIjoxMCxcInNob3dQYXJ0aWFsUm93c1wiOmZhbHNlLFwic2hvd01ldGljc0F0QWxsTGV2ZWxzXCI6ZmFsc2UsXCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjpudWxsLFwiZGlyZWN0aW9uXCI6bnVsbH0sXCJzaG93VG90YWxcIjpmYWxzZSxcInRvdGFsRnVuY1wiOlwic3VtXCJ9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLm9zY2FwLmNoZWNrLnRpdGxlXCIsXCJzaXplXCI6MSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOlxuICAgICAgICAne1widmlzXCI6e1wicGFyYW1zXCI6e1wic29ydFwiOntcImNvbHVtbkluZGV4XCI6bnVsbCxcImRpcmVjdGlvblwiOm51bGx9fX19JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiZGF0YS5vc2NhcC5jaGVjay5yZXN1bHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJmYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJmYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEub3NjYXAuY2hlY2sucmVzdWx0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLU9TQ0FQLUxhc3QtYWxlcnRzJyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnTGFzdCBhbGVydHMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTGFzdCBhbGVydHNcIixcInR5cGVcIjpcInRhYmxlXCIsXCJwYXJhbXNcIjp7XCJwZXJQYWdlXCI6MTAsXCJzaG93UGFydGlhbFJvd3NcIjpmYWxzZSxcInNob3dNZXRpY3NBdEFsbExldmVsc1wiOmZhbHNlLFwic29ydFwiOntcImNvbHVtbkluZGV4XCI6MixcImRpcmVjdGlvblwiOlwiZGVzY1wifSxcInNob3dUb3RhbFwiOmZhbHNlLFwidG90YWxGdW5jXCI6XCJzdW1cIn0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIzXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEub3NjYXAuY2hlY2sudGl0bGVcIixcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCIsXCJzaXplXCI6NTAsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIlRpdGxlXCJ9fSx7XCJpZFwiOlwiNFwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLm9zY2FwLnNjYW4ucHJvZmlsZS50aXRsZVwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcImN1c3RvbUxhYmVsXCI6XCJQcm9maWxlXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOlxuICAgICAgICAne1widmlzXCI6e1wicGFyYW1zXCI6e1wic29ydFwiOntcImNvbHVtbkluZGV4XCI6MixcImRpcmVjdGlvblwiOlwiZGVzY1wifX19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH1cbl07XG4iXX0=