"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Wazuh app - Module for Overview/OSCAP visualizations
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
  _id: 'Wazuh-App-Overview-OSCAP-Last-score',
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
  _id: 'Wazuh-App-Overview-OSCAP-Last-agent-scanned',
  _source: {
    title: 'Last agent scanned',
    visState: '{"title":"Last agent scanned","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"max","schema":"metric","params":{"field":"timestamp"}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"agent.name","size":1,"order":"desc","orderBy":"1"}}]}',
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
  _id: 'Wazuh-App-Overview-OSCAP-Last-scan-profile',
  _source: {
    title: 'Last scan profile',
    visState: '{"title":"Last scan profile","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"max","schema":"metric","params":{"field":"timestamp"}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.oscap.scan.profile.title","size":1,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":null,"direction":null}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Overview-OSCAP-Agents',
  _source: {
    title: 'Agents',
    visState: '{"params": {"isDonut": false, "shareYAxis": true, "addTooltip": true, "addLegend": true}, "listeners": {}, "type": "pie", "aggs": [{"type": "count", "enabled": true, "id": "1", "params": {}, "schema": "metric"}, {"type": "terms", "enabled": true, "id": "2", "params": {"orderBy": "1", "field": "agent.name", "order": "desc", "size": 5}, "schema": "segment"}], "title": "Agents"}',
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
  _id: 'Wazuh-App-Overview-OSCAP-Profiles',
  _source: {
    title: 'Profiles',
    visState: '{"params": {"isDonut": false, "legendPosition": "right", "shareYAxis": true, "addTooltip": true, "addLegend": true}, "listeners": {}, "type": "pie", "aggs": [{"type": "count", "enabled": true, "id": "1", "params": {}, "schema": "metric"}, {"type": "terms", "enabled": true, "id": "3", "params": {"orderBy": "1", "field": "data.oscap.scan.profile.title", "order": "desc", "size": 5}, "schema": "segment"}], "title": "Profiles"}',
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
  _id: 'Wazuh-App-Overview-OSCAP-Content',
  _source: {
    title: 'Content',
    visState: '{"params": {"isDonut": false, "legendPosition": "right", "shareYAxis": true, "addTooltip": true, "addLegend": true}, "listeners": {}, "type": "pie", "aggs": [{"type": "count", "enabled": true, "id": "1", "params": {}, "schema": "metric"}, {"type": "terms", "enabled": true, "id": "2", "params": {"orderBy": "1", "field": "data.oscap.scan.content", "order": "desc", "size": 5}, "schema": "segment"}], "title": "Content"}',
    uiStateJSON: '{}',
    version: 1,
    description: '',
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
  _id: 'Wazuh-App-Overview-OSCAP-Severity',
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
  _id: 'Wazuh-App-Overview-OSCAP-Top-5-agents-Severity-high',
  _source: {
    title: 'Top 5 agents - Severity high',
    visState: '{"title":"Top 5 Agents - Severity high","type":"histogram","params":{"type":"histogram","grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":25,"rotate":0},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":false,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"agent.name","size":5,"order":"desc","orderBy":"1"}}]}',
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
  _id: 'Wazuh-App-Overview-OSCAP-Top-10-alerts',
  _source: {
    title: 'Top 10 alerts',
    visState: '{"title":"Wazuh App OSCAP Top 10 alerts","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.oscap.check.title","size":10,"order":"desc","orderBy":"1"}}]}',
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
  _id: 'Wazuh-App-Overview-OSCAP-Top-10-high-risk-alerts',
  _source: {
    title: 'Top 10 high risk alerts',
    visState: '{"title":"Wazuh App OSCAP Top 10 high risk alerts","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.oscap.check.title","size":10,"order":"desc","orderBy":"1"}}]}',
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
  _id: 'Wazuh-App-Overview-OSCAP-Highest-score',
  _source: {
    title: 'Highest score',
    visState: '{"title":"Highest score","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"max","schema":"metric","params":{"field":"data.oscap.scan.score"}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.oscap.scan.score","size":1,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":0,"direction":null}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Overview-OSCAP-Lowest-score',
  _source: {
    title: 'Lowest score',
    visState: '{"title":"Lowest score","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"min","schema":"metric","params":{"field":"data.oscap.scan.score"}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.oscap.scan.score","size":1,"order":"asc","orderBy":"1"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":null,"direction":null}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Overview-OSCAP-Latest-alert',
  _source: {
    title: 'Latest alert',
    visState: '{"title":"Latest alert","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":null,"direction":null},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"max","schema":"metric","params":{"field":"timestamp"}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.oscap.check.title","size":1,"order":"desc","orderBy":"1"}}]}',
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
  _id: 'Wazuh-App-Overview-OSCAP-Last-alerts',
  _type: 'visualization',
  _source: {
    title: 'Last alerts',
    visState: '{"title":"Last alerts","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":3,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"agent.name","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":40,"order":"desc","orderBy":"1","customLabel":"Agent"}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.oscap.check.title","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":5,"order":"desc","orderBy":"1","customLabel":"Title"}},{"id":"4","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.oscap.scan.profile.title","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":5,"order":"desc","orderBy":"1","customLabel":"Profile"}}]}',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm92ZXJ2aWV3LW9zY2FwLnRzIl0sIm5hbWVzIjpbIl9pZCIsIl9zb3VyY2UiLCJ0aXRsZSIsInZpc1N0YXRlIiwidWlTdGF0ZUpTT04iLCJkZXNjcmlwdGlvbiIsInZlcnNpb24iLCJraWJhbmFTYXZlZE9iamVjdE1ldGEiLCJzZWFyY2hTb3VyY2VKU09OIiwiX3R5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7ZUFXZSxDQUNiO0FBQ0VBLEVBQUFBLEdBQUcsRUFBRSxxQ0FEUDtBQUVFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLFlBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLG1iQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFDVCxtRUFMSztBQU1QQyxJQUFBQSxXQUFXLEVBQUUsRUFOTjtBQU9QQyxJQUFBQSxPQUFPLEVBQUUsQ0FQRjtBQVFQQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQ2Q7QUFGbUI7QUFSaEIsR0FGWDtBQWVFQyxFQUFBQSxLQUFLLEVBQUU7QUFmVCxDQURhLEVBa0JiO0FBQ0VULEVBQUFBLEdBQUcsRUFBRSw2Q0FEUDtBQUVFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLG9CQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTixnYkFISztBQUlQQyxJQUFBQSxXQUFXLEVBQ1QsbUVBTEs7QUFNUEMsSUFBQUEsV0FBVyxFQUFFLEVBTk47QUFPUEMsSUFBQUEsT0FBTyxFQUFFLENBUEY7QUFRUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQURFO0FBUmhCLEdBRlg7QUE2Q0VDLEVBQUFBLEtBQUssRUFBRTtBQTdDVCxDQWxCYSxFQWlFYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUsNENBRFA7QUFFRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFB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QSxXQUFXLEVBQ1Qsa0VBTEs7QUFNUEMsSUFBQUEsV0FBVyxFQUFFLEVBTk47QUFPUEMsSUFBQUEsT0FBTyxFQUFFLENBUEY7QUFRUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUNkO0FBRm1CO0FBUmhCO0FBSFgsQ0F6aEJhLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogV2F6dWggYXBwIC0gTW9kdWxlIGZvciBPdmVydmlldy9PU0NBUCB2aXN1YWxpemF0aW9uc1xuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IFtcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1PU0NBUC1MYXN0LXNjb3JlJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0xhc3Qgc2NvcmUnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTGFzdCBzY29yZVwiLFwidHlwZVwiOlwidGFibGVcIixcInBhcmFtc1wiOntcInBlclBhZ2VcIjoxMCxcInNob3dQYXJ0aWFsUm93c1wiOmZhbHNlLFwic2hvd01ldGljc0F0QWxsTGV2ZWxzXCI6ZmFsc2UsXCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjpudWxsLFwiZGlyZWN0aW9uXCI6bnVsbH0sXCJzaG93VG90YWxcIjpmYWxzZSxcInRvdGFsRnVuY1wiOlwic3VtXCJ9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJtYXhcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwidGltZXN0YW1wXCJ9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLm9zY2FwLnNjYW4uc2NvcmVcIixcInNpemVcIjoxLFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046XG4gICAgICAgICd7XCJ2aXNcIjp7XCJwYXJhbXNcIjp7XCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjpudWxsLFwiZGlyZWN0aW9uXCI6bnVsbH19fX0nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctT1NDQVAtTGFzdC1hZ2VudC1zY2FubmVkJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0xhc3QgYWdlbnQgc2Nhbm5lZCcsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJMYXN0IGFnZW50IHNjYW5uZWRcIixcInR5cGVcIjpcInRhYmxlXCIsXCJwYXJhbXNcIjp7XCJwZXJQYWdlXCI6MTAsXCJzaG93UGFydGlhbFJvd3NcIjpmYWxzZSxcInNob3dNZXRpY3NBdEFsbExldmVsc1wiOmZhbHNlLFwic29ydFwiOntcImNvbHVtbkluZGV4XCI6bnVsbCxcImRpcmVjdGlvblwiOm51bGx9LFwic2hvd1RvdGFsXCI6ZmFsc2UsXCJ0b3RhbEZ1bmNcIjpcInN1bVwifSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwibWF4XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcInRpbWVzdGFtcFwifX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiYWdlbnQubmFtZVwiLFwic2l6ZVwiOjEsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjpcbiAgICAgICAgJ3tcInZpc1wiOntcInBhcmFtc1wiOntcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOm51bGwsXCJkaXJlY3Rpb25cIjpudWxsfX19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcImRhdGEub3NjYXAuY2hlY2sucmVzdWx0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkYXRhLm9zY2FwLmNoZWNrLnJlc3VsdFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctT1NDQVAtTGFzdC1zY2FuLXByb2ZpbGUnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnTGFzdCBzY2FuIHByb2ZpbGUnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTGFzdCBzY2FuIHByb2ZpbGVcIixcInR5cGVcIjpcInRhYmxlXCIsXCJwYXJhbXNcIjp7XCJwZXJQYWdlXCI6MTAsXCJzaG93UGFydGlhbFJvd3NcIjpmYWxzZSxcInNob3dNZXRpY3NBdEFsbExldmVsc1wiOmZhbHNlLFwic29ydFwiOntcImNvbHVtbkluZGV4XCI6bnVsbCxcImRpcmVjdGlvblwiOm51bGx9LFwic2hvd1RvdGFsXCI6ZmFsc2UsXCJ0b3RhbEZ1bmNcIjpcInN1bVwifSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwibWF4XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcInRpbWVzdGFtcFwifX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS5vc2NhcC5zY2FuLnByb2ZpbGUudGl0bGVcIixcInNpemVcIjoxLFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046XG4gICAgICAgICd7XCJ2aXNcIjp7XCJwYXJhbXNcIjp7XCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjpudWxsLFwiZGlyZWN0aW9uXCI6bnVsbH19fX0nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctT1NDQVAtQWdlbnRzJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0FnZW50cycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInBhcmFtc1wiOiB7XCJpc0RvbnV0XCI6IGZhbHNlLCBcInNoYXJlWUF4aXNcIjogdHJ1ZSwgXCJhZGRUb29sdGlwXCI6IHRydWUsIFwiYWRkTGVnZW5kXCI6IHRydWV9LCBcImxpc3RlbmVyc1wiOiB7fSwgXCJ0eXBlXCI6IFwicGllXCIsIFwiYWdnc1wiOiBbe1widHlwZVwiOiBcImNvdW50XCIsIFwiZW5hYmxlZFwiOiB0cnVlLCBcImlkXCI6IFwiMVwiLCBcInBhcmFtc1wiOiB7fSwgXCJzY2hlbWFcIjogXCJtZXRyaWNcIn0sIHtcInR5cGVcIjogXCJ0ZXJtc1wiLCBcImVuYWJsZWRcIjogdHJ1ZSwgXCJpZFwiOiBcIjJcIiwgXCJwYXJhbXNcIjoge1wib3JkZXJCeVwiOiBcIjFcIiwgXCJmaWVsZFwiOiBcImFnZW50Lm5hbWVcIiwgXCJvcmRlclwiOiBcImRlc2NcIiwgXCJzaXplXCI6IDV9LCBcInNjaGVtYVwiOiBcInNlZ21lbnRcIn1dLCBcInRpdGxlXCI6IFwiQWdlbnRzXCJ9JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOiBge1xuICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWx0ZXJcIjpbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcInJ1bGUuZ3JvdXBzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwic3lzbG9nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJzeXNsb2dcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicnVsZS5ncm91cHNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJzeXNsb2dcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctT1NDQVAtUHJvZmlsZXMnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnUHJvZmlsZXMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJwYXJhbXNcIjoge1wiaXNEb251dFwiOiBmYWxzZSwgXCJsZWdlbmRQb3NpdGlvblwiOiBcInJpZ2h0XCIsIFwic2hhcmVZQXhpc1wiOiB0cnVlLCBcImFkZFRvb2x0aXBcIjogdHJ1ZSwgXCJhZGRMZWdlbmRcIjogdHJ1ZX0sIFwibGlzdGVuZXJzXCI6IHt9LCBcInR5cGVcIjogXCJwaWVcIiwgXCJhZ2dzXCI6IFt7XCJ0eXBlXCI6IFwiY291bnRcIiwgXCJlbmFibGVkXCI6IHRydWUsIFwiaWRcIjogXCIxXCIsIFwicGFyYW1zXCI6IHt9LCBcInNjaGVtYVwiOiBcIm1ldHJpY1wifSwge1widHlwZVwiOiBcInRlcm1zXCIsIFwiZW5hYmxlZFwiOiB0cnVlLCBcImlkXCI6IFwiM1wiLCBcInBhcmFtc1wiOiB7XCJvcmRlckJ5XCI6IFwiMVwiLCBcImZpZWxkXCI6IFwiZGF0YS5vc2NhcC5zY2FuLnByb2ZpbGUudGl0bGVcIiwgXCJvcmRlclwiOiBcImRlc2NcIiwgXCJzaXplXCI6IDV9LCBcInNjaGVtYVwiOiBcInNlZ21lbnRcIn1dLCBcInRpdGxlXCI6IFwiUHJvZmlsZXNcIn0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwicnVsZS5ncm91cHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJzeXNsb2dcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcInN5c2xvZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJydWxlLmdyb3Vwc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcInN5c2xvZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1PU0NBUC1Db250ZW50JyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0NvbnRlbnQnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJwYXJhbXNcIjoge1wiaXNEb251dFwiOiBmYWxzZSwgXCJsZWdlbmRQb3NpdGlvblwiOiBcInJpZ2h0XCIsIFwic2hhcmVZQXhpc1wiOiB0cnVlLCBcImFkZFRvb2x0aXBcIjogdHJ1ZSwgXCJhZGRMZWdlbmRcIjogdHJ1ZX0sIFwibGlzdGVuZXJzXCI6IHt9LCBcInR5cGVcIjogXCJwaWVcIiwgXCJhZ2dzXCI6IFt7XCJ0eXBlXCI6IFwiY291bnRcIiwgXCJlbmFibGVkXCI6IHRydWUsIFwiaWRcIjogXCIxXCIsIFwicGFyYW1zXCI6IHt9LCBcInNjaGVtYVwiOiBcIm1ldHJpY1wifSwge1widHlwZVwiOiBcInRlcm1zXCIsIFwiZW5hYmxlZFwiOiB0cnVlLCBcImlkXCI6IFwiMlwiLCBcInBhcmFtc1wiOiB7XCJvcmRlckJ5XCI6IFwiMVwiLCBcImZpZWxkXCI6IFwiZGF0YS5vc2NhcC5zY2FuLmNvbnRlbnRcIiwgXCJvcmRlclwiOiBcImRlc2NcIiwgXCJzaXplXCI6IDV9LCBcInNjaGVtYVwiOiBcInNlZ21lbnRcIn1dLCBcInRpdGxlXCI6IFwiQ29udGVudFwifScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJydWxlLmdyb3Vwc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcInN5c2xvZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwic3lzbG9nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJ1bGUuZ3JvdXBzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwic3lzbG9nXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkc3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn1cbiAgICAgICAgICAgICAgICB9YFxuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLU92ZXJ2aWV3LU9TQ0FQLVNldmVyaXR5JyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1NldmVyaXR5JyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIlNldmVyaXR5XCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLm9zY2FwLmNoZWNrLnNldmVyaXR5XCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOiBge1xuICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWx0ZXJcIjpbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJkYXRhLm9zY2FwLmNoZWNrLnJlc3VsdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS5vc2NhcC5jaGVjay5yZXN1bHRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJmYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkc3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwicnVsZS5ncm91cHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJzeXNsb2dcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcInN5c2xvZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJydWxlLmdyb3Vwc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcInN5c2xvZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctT1NDQVAtVG9wLTUtYWdlbnRzLVNldmVyaXR5LWhpZ2gnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnVG9wIDUgYWdlbnRzIC0gU2V2ZXJpdHkgaGlnaCcsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJUb3AgNSBBZ2VudHMgLSBTZXZlcml0eSBoaWdoXCIsXCJ0eXBlXCI6XCJoaXN0b2dyYW1cIixcInBhcmFtc1wiOntcInR5cGVcIjpcImhpc3RvZ3JhbVwiLFwiZ3JpZFwiOntcImNhdGVnb3J5TGluZXNcIjpmYWxzZSxcInN0eWxlXCI6e1wiY29sb3JcIjpcIiNlZWVcIn19LFwiY2F0ZWdvcnlBeGVzXCI6W3tcImlkXCI6XCJDYXRlZ29yeUF4aXMtMVwiLFwidHlwZVwiOlwiY2F0ZWdvcnlcIixcInBvc2l0aW9uXCI6XCJib3R0b21cIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJ0cnVuY2F0ZVwiOjI1LFwicm90YXRlXCI6MH0sXCJ0aXRsZVwiOnt9fV0sXCJ2YWx1ZUF4ZXNcIjpbe1wiaWRcIjpcIlZhbHVlQXhpcy0xXCIsXCJuYW1lXCI6XCJMZWZ0QXhpcy0xXCIsXCJ0eXBlXCI6XCJ2YWx1ZVwiLFwicG9zaXRpb25cIjpcImxlZnRcIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCIsXCJtb2RlXCI6XCJub3JtYWxcIn0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcInJvdGF0ZVwiOjAsXCJmaWx0ZXJcIjpmYWxzZSxcInRydW5jYXRlXCI6MTAwfSxcInRpdGxlXCI6e1widGV4dFwiOlwiQ291bnRcIn19XSxcInNlcmllc1BhcmFtc1wiOlt7XCJzaG93XCI6XCJ0cnVlXCIsXCJ0eXBlXCI6XCJoaXN0b2dyYW1cIixcIm1vZGVcIjpcInN0YWNrZWRcIixcImRhdGFcIjp7XCJsYWJlbFwiOlwiQ291bnRcIixcImlkXCI6XCIxXCJ9LFwidmFsdWVBeGlzXCI6XCJWYWx1ZUF4aXMtMVwiLFwiZHJhd0xpbmVzQmV0d2VlblBvaW50c1wiOnRydWUsXCJzaG93Q2lyY2xlc1wiOnRydWV9XSxcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6ZmFsc2UsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcInRpbWVzXCI6W10sXCJhZGRUaW1lTWFya2VyXCI6ZmFsc2V9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiYWdlbnQubmFtZVwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiZGF0YS5vc2NhcC5jaGVjay5zZXZlcml0eVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS5vc2NhcC5jaGVjay5zZXZlcml0eVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1PU0NBUC1Ub3AtMTAtYWxlcnRzJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1RvcCAxMCBhbGVydHMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiV2F6dWggQXBwIE9TQ0FQIFRvcCAxMCBhbGVydHNcIixcInR5cGVcIjpcInBpZVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwicGllXCIsXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcImlzRG9udXRcIjp0cnVlfSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEub3NjYXAuY2hlY2sudGl0bGVcIixcInNpemVcIjoxMCxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOiBge1xuICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWx0ZXJcIjpbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJkYXRhLm9zY2FwLmNoZWNrLnJlc3VsdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS5vc2NhcC5jaGVjay5yZXN1bHRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJmYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkc3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1PU0NBUC1Ub3AtMTAtaGlnaC1yaXNrLWFsZXJ0cycsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdUb3AgMTAgaGlnaCByaXNrIGFsZXJ0cycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJXYXp1aCBBcHAgT1NDQVAgVG9wIDEwIGhpZ2ggcmlzayBhbGVydHNcIixcInR5cGVcIjpcInBpZVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwicGllXCIsXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcImlzRG9udXRcIjp0cnVlfSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEub3NjYXAuY2hlY2sudGl0bGVcIixcInNpemVcIjoxMCxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOiBge1xuICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWx0ZXJcIjpbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJkYXRhLm9zY2FwLmNoZWNrLnJlc3VsdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImZhaWxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS5vc2NhcC5jaGVjay5yZXN1bHRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJmYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkc3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiZGF0YS5vc2NhcC5jaGVjay5zZXZlcml0eVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGF0YS5vc2NhcC5jaGVjay5zZXZlcml0eVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImhpZ2hcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn1cbiAgICAgICAgICAgICAgICB9YFxuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLU92ZXJ2aWV3LU9TQ0FQLUhpZ2hlc3Qtc2NvcmUnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnSGlnaGVzdCBzY29yZScsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJIaWdoZXN0IHNjb3JlXCIsXCJ0eXBlXCI6XCJ0YWJsZVwiLFwicGFyYW1zXCI6e1wicGVyUGFnZVwiOjEwLFwic2hvd1BhcnRpYWxSb3dzXCI6ZmFsc2UsXCJzaG93TWV0aWNzQXRBbGxMZXZlbHNcIjpmYWxzZSxcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOm51bGwsXCJkaXJlY3Rpb25cIjpudWxsfSxcInNob3dUb3RhbFwiOmZhbHNlLFwidG90YWxGdW5jXCI6XCJzdW1cIn0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcIm1heFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLm9zY2FwLnNjYW4uc2NvcmVcIn19LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEub3NjYXAuc2Nhbi5zY29yZVwiLFwic2l6ZVwiOjEsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjpcbiAgICAgICAgJ3tcInZpc1wiOntcInBhcmFtc1wiOntcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOjAsXCJkaXJlY3Rpb25cIjpudWxsfX19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1PU0NBUC1Mb3dlc3Qtc2NvcmUnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnTG93ZXN0IHNjb3JlJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkxvd2VzdCBzY29yZVwiLFwidHlwZVwiOlwidGFibGVcIixcInBhcmFtc1wiOntcInBlclBhZ2VcIjoxMCxcInNob3dQYXJ0aWFsUm93c1wiOmZhbHNlLFwic2hvd01ldGljc0F0QWxsTGV2ZWxzXCI6ZmFsc2UsXCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjpudWxsLFwiZGlyZWN0aW9uXCI6bnVsbH0sXCJzaG93VG90YWxcIjpmYWxzZSxcInRvdGFsRnVuY1wiOlwic3VtXCJ9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJtaW5cIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS5vc2NhcC5zY2FuLnNjb3JlXCJ9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLm9zY2FwLnNjYW4uc2NvcmVcIixcInNpemVcIjoxLFwib3JkZXJcIjpcImFzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjpcbiAgICAgICAgJ3tcInZpc1wiOntcInBhcmFtc1wiOntcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOm51bGwsXCJkaXJlY3Rpb25cIjpudWxsfX19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1PU0NBUC1MYXRlc3QtYWxlcnQnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnTGF0ZXN0IGFsZXJ0JyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkxhdGVzdCBhbGVydFwiLFwidHlwZVwiOlwidGFibGVcIixcInBhcmFtc1wiOntcInBlclBhZ2VcIjoxMCxcInNob3dQYXJ0aWFsUm93c1wiOmZhbHNlLFwic2hvd01ldGljc0F0QWxsTGV2ZWxzXCI6ZmFsc2UsXCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjpudWxsLFwiZGlyZWN0aW9uXCI6bnVsbH0sXCJzaG93VG90YWxcIjpmYWxzZSxcInRvdGFsRnVuY1wiOlwic3VtXCJ9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJtYXhcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwidGltZXN0YW1wXCJ9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLm9zY2FwLmNoZWNrLnRpdGxlXCIsXCJzaXplXCI6MSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOlxuICAgICAgICAne1widmlzXCI6e1wicGFyYW1zXCI6e1wic29ydFwiOntcImNvbHVtbkluZGV4XCI6bnVsbCxcImRpcmVjdGlvblwiOm51bGx9fX19JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwiZGF0YS5vc2NhcC5jaGVjay5yZXN1bHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJmYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJmYWlsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRhdGEub3NjYXAuY2hlY2sucmVzdWx0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiZmFpbFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtT3ZlcnZpZXctT1NDQVAtTGFzdC1hbGVydHMnLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdMYXN0IGFsZXJ0cycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJMYXN0IGFsZXJ0c1wiLFwidHlwZVwiOlwidGFibGVcIixcInBhcmFtc1wiOntcInBlclBhZ2VcIjoxMCxcInNob3dQYXJ0aWFsUm93c1wiOmZhbHNlLFwic2hvd01ldGljc0F0QWxsTGV2ZWxzXCI6ZmFsc2UsXCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjozLFwiZGlyZWN0aW9uXCI6XCJkZXNjXCJ9LFwic2hvd1RvdGFsXCI6ZmFsc2UsXCJ0b3RhbEZ1bmNcIjpcInN1bVwifSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiYWdlbnQubmFtZVwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIixcInNpemVcIjo0MCxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJjdXN0b21MYWJlbFwiOlwiQWdlbnRcIn19LHtcImlkXCI6XCIzXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEub3NjYXAuY2hlY2sudGl0bGVcIixcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJjdXN0b21MYWJlbFwiOlwiVGl0bGVcIn19LHtcImlkXCI6XCI0XCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEub3NjYXAuc2Nhbi5wcm9maWxlLnRpdGxlXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIlByb2ZpbGVcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046XG4gICAgICAgICd7XCJ2aXNcIjp7XCJwYXJhbXNcIjp7XCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjozLFwiZGlyZWN0aW9uXCI6XCJkZXNjXCJ9fX19JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH1cbiAgfVxuXTtcbiJdfQ==