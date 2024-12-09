"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Wazuh app - Module for Agents/General visualizations
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
  _id: 'Wazuh-App-Agents-General-Top-5-alerts',
  _source: {
    title: 'Top 5 alerts',
    visState: '{"title":"Top 5 alerts","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"rule.description","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
    uiStateJSON: '{"vis":{"legendOpen":true}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-General-Metric-alerts',
  _source: {
    title: 'Metric alerts',
    visState: '{"title":"Metric Alerts","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"gauge","gauge":{"verticalSplit":false,"autoExtend":false,"percentageMode":false,"gaugeType":"Metric","gaugeStyle":"Full","backStyle":"Full","orientation":"vertical","colorSchema":"Green to Red","gaugeColorMode":"None","useRange":false,"colorsRange":[{"from":0,"to":100}],"invertColors":false,"labels":{"show":true,"color":"black"},"scale":{"show":false,"labels":false,"color":"#333","width":2},"type":"simple","style":{"fontSize":20,"bgColor":false,"labelColor":false,"subText":""}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Alerts"}}]}',
    uiStateJSON: '{"vis":{"defaultColors":{"0 - 100":"rgb(0,104,55)"}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-General-Level-12-alerts',
  _source: {
    title: 'Level 12 alerts',
    visState: '{"title":"Count Level 12 Alerts","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"gauge","gauge":{"verticalSplit":false,"autoExtend":false,"percentageMode":false,"gaugeType":"Metric","gaugeStyle":"Full","backStyle":"Full","orientation":"vertical","colorSchema":"Green to Red","gaugeColorMode":"None","useRange":false,"colorsRange":[{"from":0,"to":100}],"invertColors":false,"labels":{"show":true,"color":"black"},"scale":{"show":false,"labels":false,"color":"#333","width":2},"type":"simple","style":{"fontSize":20,"bgColor":false,"labelColor":false,"subText":""}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Level 12 or above alerts"}}]}',
    uiStateJSON: '{"vis":{"defaultColors":{"0 - 100":"rgb(0,104,55)"}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: `{
                    "index":"wazuh-alerts",
                    "filter":[
                        {
                        "$state": {
                          "store": "appState"
                        },
                        "meta": {
                          "alias": null,
                          "disabled": false,
                          "index": "wazuh-alerts",
                          "key": "rule.level",
                          "negate": false,
                          "params": {
                            "gte": 12,
                            "lt": null
                          },
                          "type": "range",
                          "value": "12 to +∞"
                        },
                        "range": {
                          "rule.level": {
                            "gte": 12,
                            "lt": null
                          }
                        }
                      }
                    ],
                    "query":{ "query": "", "language": "lucene" } 
                }`
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-General-Authentication-failure',
  _source: {
    title: 'Authentication failure',
    visState: '{"title":"Count Authentication Failure","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"gauge","gauge":{"verticalSplit":false,"autoExtend":false,"percentageMode":false,"gaugeType":"Metric","gaugeStyle":"Full","backStyle":"Full","orientation":"vertical","colorSchema":"Green to Red","gaugeColorMode":"None","useRange":false,"colorsRange":[{"from":0,"to":100}],"invertColors":false,"labels":{"show":true,"color":"black"},"scale":{"show":false,"labels":false,"color":"#333","width":2},"type":"simple","style":{"fontSize":20,"bgColor":false,"labelColor":false,"subText":""}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Authentication failure"}}]}',
    uiStateJSON: '{"vis":{"defaultColors":{"0 - 100":"rgb(0,104,55)"}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: `{
                    "index":"wazuh-alerts",
                    "filter":[
                        {
                            "meta": {
                              "index": "wazuh-alerts",
                              "type": "phrases",
                              "key": "rule.groups",
                              "value": "win_authentication_failed, authentication_failed, authentication_failures",
                              "params": [
                                "win_authentication_failed",
                                "authentication_failed",
                                "authentication_failures"
                              ],
                              "negate": false,
                              "disabled": false,
                              "alias": null
                            },
                            "query": {
                              "bool": {
                                "should": [
                                  {
                                    "match_phrase": {
                                      "rule.groups": "win_authentication_failed"
                                    }
                                  },
                                  {
                                    "match_phrase": {
                                      "rule.groups": "authentication_failed"
                                    }
                                  },
                                  {
                                    "match_phrase": {
                                      "rule.groups": "authentication_failures"
                                    }
                                  }
                                ],
                                "minimum_should_match": 1
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
  _id: 'Wazuh-App-Agents-General-Authentication-success',
  _source: {
    title: 'Authentication success',
    visState: '{"title":"Count Authentication Success","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"gauge","gauge":{"verticalSplit":false,"autoExtend":false,"percentageMode":false,"gaugeType":"Metric","gaugeStyle":"Full","backStyle":"Full","orientation":"vertical","colorSchema":"Green to Red","gaugeColorMode":"None","useRange":false,"colorsRange":[{"from":0,"to":100}],"invertColors":false,"labels":{"show":true,"color":"black"},"scale":{"show":false,"labels":false,"color":"#333","width":2},"type":"simple","style":{"fontSize":20,"bgColor":false,"labelColor":false,"subText":""}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Authentication success"}}]}',
    uiStateJSON: '{"vis":{"defaultColors":{"0 - 100":"rgb(0,104,55)"}}}',
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
                              "key": "rule.groups",
                              "value": "authentication_success",
                              "params": {
                                "query": "authentication_success",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "rule.groups": {
                                  "query": "authentication_success",
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
  _id: 'Wazuh-App-Agents-General-Top-10-groups',
  _source: {
    title: 'Top 5 rule groups',
    visState: '{"title":"Top 5 rule groups","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":false,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"rule.groups","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
    uiStateJSON: '{"vis":{"legendOpen":true}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-General-Top-5-PCI-DSS-Requirements',
  _source: {
    title: 'Top 5 PCI DSS requirements',
    visState: '{"title":"Top 5 PCI DSS requirements","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"rule.pci_dss","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
    uiStateJSON: '{"vis":{"legendOpen":true}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-General-Alert-groups-evolution',
  _source: {
    title: 'Alert groups evolution',
    visState: '{"title":"Alerts by group over time","type":"area","params":{"type":"area","grid":{"categoryLines":true,"style":{"color":"#eee"},"valueAxis":"ValueAxis-1"},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"area","mode":"stacked","data":{"label":"Count","id":"1"},"drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"cardinal","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","timeRange":{"from":"now-24h","to":"now","mode":"quick"},"useNormalizedEsInterval":true,"interval":"auto","time_zone":"Europe/Berlin","drop_partials":false,"customInterval":"2h","min_doc_count":1,"extended_bounds":{}}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"rule.groups","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-General-Alerts',
  _source: {
    title: 'Alerts',
    visState: '{"title":"Alerts by action over time","type":"area","params":{"type":"area","grid":{"categoryLines":true,"style":{"color":"#eee"},"valueAxis":"ValueAxis-1"},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"数量"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"cardinal","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","timeRange":{"from":"now-24h","to":"now","mode":"quick"},"useNormalizedEsInterval":true,"interval":"auto","time_zone":"Europe/Berlin","drop_partials":false,"customInterval":"2h","min_doc_count":1,"extended_bounds":{}}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"rule.level","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-General-Alerts-summary',
  _type: 'visualization',
  _source: {
    title: 'Alerts summary',
    visState: '{"title":"Alerts summary","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":3,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.id","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":50,"order":"desc","orderBy":"1","customLabel":"Rule ID"}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.description","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":1,"order":"desc","orderBy":"1","customLabel":"Description"}},{"id":"4","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.level","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":1,"order":"desc","orderBy":"1","customLabel":"Level"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":3,"direction":"desc"}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Agents-General-Groups-summary',
  _type: 'visualization',
  _source: {
    title: 'Groups summary',
    visState: '{"title":"Groups summary","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":1,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.groups","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":50,"order":"desc","orderBy":"1","customLabel":"Group"}}]}',
    uiStateJSON: '{"vis":{"params":{"sort":{"columnIndex":1,"direction":"desc"}}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}];
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFnZW50cy1nZW5lcmFsLnRzIl0sIm5hbWVzIjpbIl9pZCIsIl9zb3VyY2UiLCJ0aXRsZSIsInZpc1N0YXRlIiwidWlTdGF0ZUpTT04iLCJkZXNjcmlwdGlvbiIsInZlcnNpb24iLCJraWJhbmFTYXZlZE9iamVjdE1ldGEiLCJzZWFyY2hTb3VyY2VKU09OIiwiX3R5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7ZUFXZSxDQUNiO0FBQ0VBLEVBQUFBLEdBQUcsRUFBRSx1Q0FEUDtBQUVFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLGNBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLDZnQkFISztBQUlQQyxJQUFBQSxXQUFXLEVBQUUsNkJBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUNkO0FBRm1CO0FBUGhCLEdBRlg7QUFjRUMsRUFBQUEsS0FBSyxFQUFFO0FBZFQsQ0FEYSxFQWlCYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUsd0NBRFA7QUFFRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxlQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTiwycUJBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLHVEQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVBoQixHQUZYO0FBY0VDLEVBQUFBLEtBQUssRUFBRTtBQWRULENBakJhLEVBaUNiO0FBQ0VULEVBQUFBLEdBQUcsRUFBRSwwQ0FEUDtBQUVFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLGlCQURBO0FBRVBDLElBQUFBLFFB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ZSBmb3IgQWdlbnRzL0dlbmVyYWwgdmlzdWFsaXphdGlvbnNcbiAqIENvcHlyaWdodCAoQykgMjAxNS0yMDIxIFdhenVoLCBJbmMuXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAyIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBGaW5kIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBvbiB0aGUgTElDRU5TRSBmaWxlLlxuICovXG5leHBvcnQgZGVmYXVsdCBbXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLUdlbmVyYWwtVG9wLTUtYWxlcnRzJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1RvcCA1IGFsZXJ0cycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJUb3AgNSBhbGVydHNcIixcInR5cGVcIjpcInBpZVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwicGllXCIsXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcImlzRG9udXRcIjp0cnVlLFwibGFiZWxzXCI6e1wic2hvd1wiOmZhbHNlLFwidmFsdWVzXCI6dHJ1ZSxcImxhc3RfbGV2ZWxcIjp0cnVlLFwidHJ1bmNhdGVcIjoxMDB9fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcInJ1bGUuZGVzY3JpcHRpb25cIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne1widmlzXCI6e1wibGVnZW5kT3BlblwiOnRydWV9fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtR2VuZXJhbC1NZXRyaWMtYWxlcnRzJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01ldHJpYyBhbGVydHMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTWV0cmljIEFsZXJ0c1wiLFwidHlwZVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOmZhbHNlLFwidHlwZVwiOlwiZ2F1Z2VcIixcImdhdWdlXCI6e1widmVydGljYWxTcGxpdFwiOmZhbHNlLFwiYXV0b0V4dGVuZFwiOmZhbHNlLFwicGVyY2VudGFnZU1vZGVcIjpmYWxzZSxcImdhdWdlVHlwZVwiOlwiTWV0cmljXCIsXCJnYXVnZVN0eWxlXCI6XCJGdWxsXCIsXCJiYWNrU3R5bGVcIjpcIkZ1bGxcIixcIm9yaWVudGF0aW9uXCI6XCJ2ZXJ0aWNhbFwiLFwiY29sb3JTY2hlbWFcIjpcIkdyZWVuIHRvIFJlZFwiLFwiZ2F1Z2VDb2xvck1vZGVcIjpcIk5vbmVcIixcInVzZVJhbmdlXCI6ZmFsc2UsXCJjb2xvcnNSYW5nZVwiOlt7XCJmcm9tXCI6MCxcInRvXCI6MTAwfV0sXCJpbnZlcnRDb2xvcnNcIjpmYWxzZSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwiY29sb3JcIjpcImJsYWNrXCJ9LFwic2NhbGVcIjp7XCJzaG93XCI6ZmFsc2UsXCJsYWJlbHNcIjpmYWxzZSxcImNvbG9yXCI6XCIjMzMzXCIsXCJ3aWR0aFwiOjJ9LFwidHlwZVwiOlwic2ltcGxlXCIsXCJzdHlsZVwiOntcImZvbnRTaXplXCI6MjAsXCJiZ0NvbG9yXCI6ZmFsc2UsXCJsYWJlbENvbG9yXCI6ZmFsc2UsXCJzdWJUZXh0XCI6XCJcIn19fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJjdXN0b21MYWJlbFwiOlwiQWxlcnRzXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne1widmlzXCI6e1wiZGVmYXVsdENvbG9yc1wiOntcIjAgLSAxMDBcIjpcInJnYigwLDEwNCw1NSlcIn19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtR2VuZXJhbC1MZXZlbC0xMi1hbGVydHMnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnTGV2ZWwgMTIgYWxlcnRzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkNvdW50IExldmVsIDEyIEFsZXJ0c1wiLFwidHlwZVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOmZhbHNlLFwidHlwZVwiOlwiZ2F1Z2VcIixcImdhdWdlXCI6e1widmVydGljYWxTcGxpdFwiOmZhbHNlLFwiYXV0b0V4dGVuZFwiOmZhbHNlLFwicGVyY2VudGFnZU1vZGVcIjpmYWxzZSxcImdhdWdlVHlwZVwiOlwiTWV0cmljXCIsXCJnYXVnZVN0eWxlXCI6XCJGdWxsXCIsXCJiYWNrU3R5bGVcIjpcIkZ1bGxcIixcIm9yaWVudGF0aW9uXCI6XCJ2ZXJ0aWNhbFwiLFwiY29sb3JTY2hlbWFcIjpcIkdyZWVuIHRvIFJlZFwiLFwiZ2F1Z2VDb2xvck1vZGVcIjpcIk5vbmVcIixcInVzZVJhbmdlXCI6ZmFsc2UsXCJjb2xvcnNSYW5nZVwiOlt7XCJmcm9tXCI6MCxcInRvXCI6MTAwfV0sXCJpbnZlcnRDb2xvcnNcIjpmYWxzZSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwiY29sb3JcIjpcImJsYWNrXCJ9LFwic2NhbGVcIjp7XCJzaG93XCI6ZmFsc2UsXCJsYWJlbHNcIjpmYWxzZSxcImNvbG9yXCI6XCIjMzMzXCIsXCJ3aWR0aFwiOjJ9LFwidHlwZVwiOlwic2ltcGxlXCIsXCJzdHlsZVwiOntcImZvbnRTaXplXCI6MjAsXCJiZ0NvbG9yXCI6ZmFsc2UsXCJsYWJlbENvbG9yXCI6ZmFsc2UsXCJzdWJUZXh0XCI6XCJcIn19fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7XCJjdXN0b21MYWJlbFwiOlwiTGV2ZWwgMTIgb3IgYWJvdmUgYWxlcnRzXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne1widmlzXCI6e1wiZGVmYXVsdENvbG9yc1wiOntcIjAgLSAxMDBcIjpcInJnYigwLDEwNCw1NSlcIn19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJydWxlLmxldmVsXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJndGVcIjogMTIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJsdFwiOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInJhbmdlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCIxMiB0byAr4oieXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcInJhbmdlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJydWxlLmxldmVsXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImd0ZVwiOiAxMixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImx0XCI6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOnsgXCJxdWVyeVwiOiBcIlwiLCBcImxhbmd1YWdlXCI6IFwibHVjZW5lXCIgfSBcbiAgICAgICAgICAgICAgICB9YFxuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1HZW5lcmFsLUF1dGhlbnRpY2F0aW9uLWZhaWx1cmUnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnQXV0aGVudGljYXRpb24gZmFpbHVyZScsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJDb3VudCBBdXRoZW50aWNhdGlvbiBGYWlsdXJlXCIsXCJ0eXBlXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6ZmFsc2UsXCJ0eXBlXCI6XCJnYXVnZVwiLFwiZ2F1Z2VcIjp7XCJ2ZXJ0aWNhbFNwbGl0XCI6ZmFsc2UsXCJhdXRvRXh0ZW5kXCI6ZmFsc2UsXCJwZXJjZW50YWdlTW9kZVwiOmZhbHNlLFwiZ2F1Z2VUeXBlXCI6XCJNZXRyaWNcIixcImdhdWdlU3R5bGVcIjpcIkZ1bGxcIixcImJhY2tTdHlsZVwiOlwiRnVsbFwiLFwib3JpZW50YXRpb25cIjpcInZlcnRpY2FsXCIsXCJjb2xvclNjaGVtYVwiOlwiR3JlZW4gdG8gUmVkXCIsXCJnYXVnZUNvbG9yTW9kZVwiOlwiTm9uZVwiLFwidXNlUmFuZ2VcIjpmYWxzZSxcImNvbG9yc1JhbmdlXCI6W3tcImZyb21cIjowLFwidG9cIjoxMDB9XSxcImludmVydENvbG9yc1wiOmZhbHNlLFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJjb2xvclwiOlwiYmxhY2tcIn0sXCJzY2FsZVwiOntcInNob3dcIjpmYWxzZSxcImxhYmVsc1wiOmZhbHNlLFwiY29sb3JcIjpcIiMzMzNcIixcIndpZHRoXCI6Mn0sXCJ0eXBlXCI6XCJzaW1wbGVcIixcInN0eWxlXCI6e1wiZm9udFNpemVcIjoyMCxcImJnQ29sb3JcIjpmYWxzZSxcImxhYmVsQ29sb3JcIjpmYWxzZSxcInN1YlRleHRcIjpcIlwifX19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImN1c3RvbUxhYmVsXCI6XCJBdXRoZW50aWNhdGlvbiBmYWlsdXJlXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne1widmlzXCI6e1wiZGVmYXVsdENvbG9yc1wiOntcIjAgLSAxMDBcIjpcInJnYigwLDEwNCw1NSlcIn19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJydWxlLmdyb3Vwc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIndpbl9hdXRoZW50aWNhdGlvbl9mYWlsZWQsIGF1dGhlbnRpY2F0aW9uX2ZhaWxlZCwgYXV0aGVudGljYXRpb25fZmFpbHVyZXNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aW5fYXV0aGVudGljYXRpb25fZmFpbGVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXV0aGVudGljYXRpb25fZmFpbGVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYXV0aGVudGljYXRpb25fZmFpbHVyZXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImJvb2xcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInNob3VsZFwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaF9waHJhc2VcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJ1bGUuZ3JvdXBzXCI6IFwid2luX2F1dGhlbnRpY2F0aW9uX2ZhaWxlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoX3BocmFzZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicnVsZS5ncm91cHNcIjogXCJhdXRoZW50aWNhdGlvbl9mYWlsZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaF9waHJhc2VcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJ1bGUuZ3JvdXBzXCI6IFwiYXV0aGVudGljYXRpb25fZmFpbHVyZXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtaW5pbXVtX3Nob3VsZF9tYXRjaFwiOiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLUdlbmVyYWwtQXV0aGVudGljYXRpb24tc3VjY2VzcycsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdBdXRoZW50aWNhdGlvbiBzdWNjZXNzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkNvdW50IEF1dGhlbnRpY2F0aW9uIFN1Y2Nlc3NcIixcInR5cGVcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjpmYWxzZSxcInR5cGVcIjpcImdhdWdlXCIsXCJnYXVnZVwiOntcInZlcnRpY2FsU3BsaXRcIjpmYWxzZSxcImF1dG9FeHRlbmRcIjpmYWxzZSxcInBlcmNlbnRhZ2VNb2RlXCI6ZmFsc2UsXCJnYXVnZVR5cGVcIjpcIk1ldHJpY1wiLFwiZ2F1Z2VTdHlsZVwiOlwiRnVsbFwiLFwiYmFja1N0eWxlXCI6XCJGdWxsXCIsXCJvcmllbnRhdGlvblwiOlwidmVydGljYWxcIixcImNvbG9yU2NoZW1hXCI6XCJHcmVlbiB0byBSZWRcIixcImdhdWdlQ29sb3JNb2RlXCI6XCJOb25lXCIsXCJ1c2VSYW5nZVwiOmZhbHNlLFwiY29sb3JzUmFuZ2VcIjpbe1wiZnJvbVwiOjAsXCJ0b1wiOjEwMH1dLFwiaW52ZXJ0Q29sb3JzXCI6ZmFsc2UsXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcImNvbG9yXCI6XCJibGFja1wifSxcInNjYWxlXCI6e1wic2hvd1wiOmZhbHNlLFwibGFiZWxzXCI6ZmFsc2UsXCJjb2xvclwiOlwiIzMzM1wiLFwid2lkdGhcIjoyfSxcInR5cGVcIjpcInNpbXBsZVwiLFwic3R5bGVcIjp7XCJmb250U2l6ZVwiOjIwLFwiYmdDb2xvclwiOmZhbHNlLFwibGFiZWxDb2xvclwiOmZhbHNlLFwic3ViVGV4dFwiOlwiXCJ9fX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiY3VzdG9tTGFiZWxcIjpcIkF1dGhlbnRpY2F0aW9uIHN1Y2Nlc3NcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7XCJ2aXNcIjp7XCJkZWZhdWx0Q29sb3JzXCI6e1wiMCAtIDEwMFwiOlwicmdiKDAsMTA0LDU1KVwifX19JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwicnVsZS5ncm91cHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJhdXRoZW50aWNhdGlvbl9zdWNjZXNzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJhdXRoZW50aWNhdGlvbl9zdWNjZXNzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJ1bGUuZ3JvdXBzXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiYXV0aGVudGljYXRpb25fc3VjY2Vzc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtR2VuZXJhbC1Ub3AtMTAtZ3JvdXBzJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1RvcCA1IHJ1bGUgZ3JvdXBzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIlRvcCA1IHJ1bGUgZ3JvdXBzXCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6ZmFsc2UsXCJsYWJlbHNcIjp7XCJzaG93XCI6ZmFsc2UsXCJ2YWx1ZXNcIjp0cnVlLFwibGFzdF9sZXZlbFwiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS5ncm91cHNcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne1widmlzXCI6e1wibGVnZW5kT3BlblwiOnRydWV9fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtR2VuZXJhbC1Ub3AtNS1QQ0ktRFNTLVJlcXVpcmVtZW50cycsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdUb3AgNSBQQ0kgRFNTIHJlcXVpcmVtZW50cycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJUb3AgNSBQQ0kgRFNTIHJlcXVpcmVtZW50c1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWUsXCJsYWJlbHNcIjp7XCJzaG93XCI6ZmFsc2UsXCJ2YWx1ZXNcIjp0cnVlLFwibGFzdF9sZXZlbFwiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS5wY2lfZHNzXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3tcInZpc1wiOntcImxlZ2VuZE9wZW5cIjp0cnVlfX0nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLUdlbmVyYWwtQWxlcnQtZ3JvdXBzLWV2b2x1dGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdBbGVydCBncm91cHMgZXZvbHV0aW9uJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkFsZXJ0cyBieSBncm91cCBvdmVyIHRpbWVcIixcInR5cGVcIjpcImFyZWFcIixcInBhcmFtc1wiOntcInR5cGVcIjpcImFyZWFcIixcImdyaWRcIjp7XCJjYXRlZ29yeUxpbmVzXCI6dHJ1ZSxcInN0eWxlXCI6e1wiY29sb3JcIjpcIiNlZWVcIn0sXCJ2YWx1ZUF4aXNcIjpcIlZhbHVlQXhpcy0xXCJ9LFwiY2F0ZWdvcnlBeGVzXCI6W3tcImlkXCI6XCJDYXRlZ29yeUF4aXMtMVwiLFwidHlwZVwiOlwiY2F0ZWdvcnlcIixcInBvc2l0aW9uXCI6XCJib3R0b21cIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH0sXCJ0aXRsZVwiOnt9fV0sXCJ2YWx1ZUF4ZXNcIjpbe1wiaWRcIjpcIlZhbHVlQXhpcy0xXCIsXCJuYW1lXCI6XCJMZWZ0QXhpcy0xXCIsXCJ0eXBlXCI6XCJ2YWx1ZVwiLFwicG9zaXRpb25cIjpcImxlZnRcIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCIsXCJtb2RlXCI6XCJub3JtYWxcIn0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcInJvdGF0ZVwiOjAsXCJmaWx0ZXJcIjpmYWxzZSxcInRydW5jYXRlXCI6MTAwfSxcInRpdGxlXCI6e1widGV4dFwiOlwiQ291bnRcIn19XSxcInNlcmllc1BhcmFtc1wiOlt7XCJzaG93XCI6XCJ0cnVlXCIsXCJ0eXBlXCI6XCJhcmVhXCIsXCJtb2RlXCI6XCJzdGFja2VkXCIsXCJkYXRhXCI6e1wibGFiZWxcIjpcIkNvdW50XCIsXCJpZFwiOlwiMVwifSxcImRyYXdMaW5lc0JldHdlZW5Qb2ludHNcIjp0cnVlLFwic2hvd0NpcmNsZXNcIjp0cnVlLFwiaW50ZXJwb2xhdGVcIjpcImNhcmRpbmFsXCIsXCJ2YWx1ZUF4aXNcIjpcIlZhbHVlQXhpcy0xXCJ9XSxcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwidGltZXNcIjpbXSxcImFkZFRpbWVNYXJrZXJcIjpmYWxzZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImRhdGVfaGlzdG9ncmFtXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJ0aW1lc3RhbXBcIixcInRpbWVSYW5nZVwiOntcImZyb21cIjpcIm5vdy0yNGhcIixcInRvXCI6XCJub3dcIixcIm1vZGVcIjpcInF1aWNrXCJ9LFwidXNlTm9ybWFsaXplZEVzSW50ZXJ2YWxcIjp0cnVlLFwiaW50ZXJ2YWxcIjpcImF1dG9cIixcInRpbWVfem9uZVwiOlwiRXVyb3BlL0JlcmxpblwiLFwiZHJvcF9wYXJ0aWFsc1wiOmZhbHNlLFwiY3VzdG9tSW50ZXJ2YWxcIjpcIjJoXCIsXCJtaW5fZG9jX2NvdW50XCI6MSxcImV4dGVuZGVkX2JvdW5kc1wiOnt9fX0se1wiaWRcIjpcIjNcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiZ3JvdXBcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJydWxlLmdyb3Vwc1wiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtR2VuZXJhbC1BbGVydHMnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnQWxlcnRzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkFsZXJ0cyBieSBhY3Rpb24gb3ZlciB0aW1lXCIsXCJ0eXBlXCI6XCJhcmVhXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJhcmVhXCIsXCJncmlkXCI6e1wiY2F0ZWdvcnlMaW5lc1wiOnRydWUsXCJzdHlsZVwiOntcImNvbG9yXCI6XCIjZWVlXCJ9LFwidmFsdWVBeGlzXCI6XCJWYWx1ZUF4aXMtMVwifSxcImNhdGVnb3J5QXhlc1wiOlt7XCJpZFwiOlwiQ2F0ZWdvcnlBeGlzLTFcIixcInR5cGVcIjpcImNhdGVnb3J5XCIsXCJwb3NpdGlvblwiOlwiYm90dG9tXCIsXCJzaG93XCI6dHJ1ZSxcInN0eWxlXCI6e30sXCJzY2FsZVwiOntcInR5cGVcIjpcImxpbmVhclwifSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwidHJ1bmNhdGVcIjoxMDB9LFwidGl0bGVcIjp7fX1dLFwidmFsdWVBeGVzXCI6W3tcImlkXCI6XCJWYWx1ZUF4aXMtMVwiLFwibmFtZVwiOlwiTGVmdEF4aXMtMVwiLFwidHlwZVwiOlwidmFsdWVcIixcInBvc2l0aW9uXCI6XCJsZWZ0XCIsXCJzaG93XCI6dHJ1ZSxcInN0eWxlXCI6e30sXCJzY2FsZVwiOntcInR5cGVcIjpcImxpbmVhclwiLFwibW9kZVwiOlwibm9ybWFsXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJyb3RhdGVcIjowLFwiZmlsdGVyXCI6ZmFsc2UsXCJ0cnVuY2F0ZVwiOjEwMH0sXCJ0aXRsZVwiOntcInRleHRcIjpcIkNvdW50XCJ9fV0sXCJzZXJpZXNQYXJhbXNcIjpbe1wic2hvd1wiOlwidHJ1ZVwiLFwidHlwZVwiOlwiYXJlYVwiLFwibW9kZVwiOlwic3RhY2tlZFwiLFwiZGF0YVwiOntcImxhYmVsXCI6XCJDb3VudFwiLFwiaWRcIjpcIjFcIn0sXCJkcmF3TGluZXNCZXR3ZWVuUG9pbnRzXCI6dHJ1ZSxcInNob3dDaXJjbGVzXCI6dHJ1ZSxcImludGVycG9sYXRlXCI6XCJjYXJkaW5hbFwiLFwidmFsdWVBeGlzXCI6XCJWYWx1ZUF4aXMtMVwifV0sXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcInRpbWVzXCI6W10sXCJhZGRUaW1lTWFya2VyXCI6ZmFsc2V9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJkYXRlX2hpc3RvZ3JhbVwiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwidGltZXN0YW1wXCIsXCJ0aW1lUmFuZ2VcIjp7XCJmcm9tXCI6XCJub3ctMjRoXCIsXCJ0b1wiOlwibm93XCIsXCJtb2RlXCI6XCJxdWlja1wifSxcInVzZU5vcm1hbGl6ZWRFc0ludGVydmFsXCI6dHJ1ZSxcImludGVydmFsXCI6XCJhdXRvXCIsXCJ0aW1lX3pvbmVcIjpcIkV1cm9wZS9CZXJsaW5cIixcImRyb3BfcGFydGlhbHNcIjpmYWxzZSxcImN1c3RvbUludGVydmFsXCI6XCIyaFwiLFwibWluX2RvY19jb3VudFwiOjEsXCJleHRlbmRlZF9ib3VuZHNcIjp7fX19LHtcImlkXCI6XCIzXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImdyb3VwXCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS5sZXZlbFwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtR2VuZXJhbC1BbGVydHMtc3VtbWFyeScsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0FsZXJ0cyBzdW1tYXJ5JyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkFsZXJ0cyBzdW1tYXJ5XCIsXCJ0eXBlXCI6XCJ0YWJsZVwiLFwicGFyYW1zXCI6e1wicGVyUGFnZVwiOjEwLFwic2hvd1BhcnRpYWxSb3dzXCI6ZmFsc2UsXCJzaG93TWV0aWNzQXRBbGxMZXZlbHNcIjpmYWxzZSxcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOjMsXCJkaXJlY3Rpb25cIjpcImRlc2NcIn0sXCJzaG93VG90YWxcIjpmYWxzZSxcInRvdGFsRnVuY1wiOlwic3VtXCJ9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJydWxlLmlkXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwic2l6ZVwiOjUwLFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcImN1c3RvbUxhYmVsXCI6XCJSdWxlIElEXCJ9fSx7XCJpZFwiOlwiM1wiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJydWxlLmRlc2NyaXB0aW9uXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwic2l6ZVwiOjEsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIkRlc2NyaXB0aW9uXCJ9fSx7XCJpZFwiOlwiNFwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJydWxlLmxldmVsXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwic2l6ZVwiOjEsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIkxldmVsXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOlxuICAgICAgICAne1widmlzXCI6e1wicGFyYW1zXCI6e1wic29ydFwiOntcImNvbHVtbkluZGV4XCI6MyxcImRpcmVjdGlvblwiOlwiZGVzY1wifX19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLUdlbmVyYWwtR3JvdXBzLXN1bW1hcnknLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdHcm91cHMgc3VtbWFyeScsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJHcm91cHMgc3VtbWFyeVwiLFwidHlwZVwiOlwidGFibGVcIixcInBhcmFtc1wiOntcInBlclBhZ2VcIjoxMCxcInNob3dQYXJ0aWFsUm93c1wiOmZhbHNlLFwic2hvd01ldGljc0F0QWxsTGV2ZWxzXCI6ZmFsc2UsXCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjoxLFwiZGlyZWN0aW9uXCI6XCJkZXNjXCJ9LFwic2hvd1RvdGFsXCI6ZmFsc2UsXCJ0b3RhbEZ1bmNcIjpcInN1bVwifSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS5ncm91cHNcIixcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCIsXCJzaXplXCI6NTAsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIkdyb3VwXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOlxuICAgICAgICAne1widmlzXCI6e1wicGFyYW1zXCI6e1wic29ydFwiOntcImNvbHVtbkluZGV4XCI6MSxcImRpcmVjdGlvblwiOlwiZGVzY1wifX19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH1cbl07XG4iXX0=