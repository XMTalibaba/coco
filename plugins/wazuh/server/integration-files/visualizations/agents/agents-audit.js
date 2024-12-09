"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Wazuh app - Module for Agents/Audit visualizations
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
  _id: 'Wazuh-App-Agents-Audit-New-files-metric',
  _source: {
    title: 'New files metric',
    visState: '{"title":"New files metric","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"gauge","gauge":{"verticalSplit":false,"autoExtend":false,"percentageMode":false,"gaugeType":"Metric","gaugeStyle":"Full","backStyle":"Full","orientation":"vertical","colorSchema":"Green to Red","gaugeColorMode":"None","useRange":false,"colorsRange":[{"from":0,"to":100}],"invertColors":false,"labels":{"show":true,"color":"black"},"scale":{"show":false,"labels":false,"color":"#333","width":2},"type":"simple","style":{"fontSize":20,"bgColor":false,"labelColor":false,"subText":""}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"New files"}}]}',
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
                                "key": "rule.id",
                                "value": "80790",
                                "params": {
                                "query": "80790",
                                "type": "phrase"
                                }
                            },
                            "query": {
                                "match": {
                                "rule.id": {
                                    "query": "80790",
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
  _id: 'Wazuh-App-Agents-Audit-Read-files-metric',
  _source: {
    title: 'Read files metric',
    visState: '{"title":"Read files metric","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"gauge","gauge":{"verticalSplit":false,"autoExtend":false,"percentageMode":false,"gaugeType":"Metric","gaugeStyle":"Full","backStyle":"Full","orientation":"vertical","colorSchema":"Green to Red","gaugeColorMode":"None","useRange":false,"colorsRange":[{"from":0,"to":100}],"invertColors":false,"labels":{"show":true,"color":"black"},"scale":{"show":false,"labels":false,"color":"#333","width":2},"type":"simple","style":{"fontSize":20,"bgColor":false,"labelColor":false,"subText":""}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Read files"}}]}',
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
                                "key": "rule.id",
                                "value": "80784",
                                "params": {
                                "query": "80784",
                                "type": "phrase"
                                }
                            },
                            "query": {
                                "match": {
                                "rule.id": {
                                    "query": "80784",
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
  _id: 'Wazuh-App-Agents-Audit-Modified-files-metric',
  _source: {
    title: 'Modified files metric',
    visState: '{"title":"Modified files metric","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"gauge","gauge":{"verticalSplit":false,"autoExtend":false,"percentageMode":false,"gaugeType":"Metric","gaugeStyle":"Full","backStyle":"Full","orientation":"vertical","colorSchema":"Green to Red","gaugeColorMode":"None","useRange":false,"colorsRange":[{"from":0,"to":100}],"invertColors":false,"labels":{"show":true,"color":"black"},"scale":{"show":false,"labels":false,"color":"#333","width":2},"type":"simple","style":{"fontSize":20,"bgColor":false,"labelColor":false,"subText":""}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Modified files"}}]}',
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
                              "key": "rule.id",
                              "value": "80781, 80787",
                              "params": [
                                "80781",
                                "80787"
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
                                      "rule.id": "80781"
                                    }
                                  },
                                  {
                                    "match_phrase": {
                                      "rule.id": "80787"
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
  _id: 'Wazuh-App-Agents-Audit-Removed-files-metric',
  _source: {
    title: 'Removed files metric',
    visState: '{"title":"Removed files metric","type":"metric","params":{"addTooltip":true,"addLegend":false,"type":"gauge","gauge":{"verticalSplit":false,"autoExtend":false,"percentageMode":false,"gaugeType":"Metric","gaugeStyle":"Full","backStyle":"Full","orientation":"vertical","colorSchema":"Green to Red","gaugeColorMode":"None","useRange":false,"colorsRange":[{"from":0,"to":100}],"invertColors":false,"labels":{"show":true,"color":"black"},"scale":{"show":false,"labels":false,"color":"#333","width":2},"type":"simple","style":{"fontSize":20,"bgColor":false,"labelColor":false,"subText":""}}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{"customLabel":"Removed files"}}]}',
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
                                "key": "rule.id",
                                "value": "80791",
                                "params": {
                                "query": "80791",
                                "type": "phrase"
                                }
                            },
                            "query": {
                                "match": {
                                "rule.id": {
                                    "query": "80791",
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
  _id: 'Wazuh-App-Agents-Audit-Groups',
  _source: {
    title: 'Groups',
    visState: '{"title":"Groups","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"rule.groups","size":5,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-Audit-Files',
  _source: {
    title: 'Files',
    visState: '{"title":"Files","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.audit.file.name","size":5,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-Audit-Alerts-over-time',
  _source: {
    title: 'Alerts over time',
    visState: '{"title":"Alerts over time","type":"area","params":{"type":"area","grid":{"categoryLines":true,"style":{"color":"#eee"},"valueAxis":"ValueAxis-1"},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"area","mode":"stacked","data":{"label":"Count","id":"1"},"drawLinesBetweenPoints":true,"showCircles":true,"interpolate":"cardinal","valueAxis":"ValueAxis-1"}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"rule.description","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","timeRange":{"from":"now-1h","to":"now","mode":"quick"},"useNormalizedEsInterval":true,"interval":"auto","time_zone":"Europe/Berlin","drop_partials":false,"customInterval":"2h","min_doc_count":1,"extended_bounds":{}}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-Audit-Commands',
  _source: {
    title: 'Commands',
    visState: '{"title":"Commands","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"data.audit.command","size":5,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-Audit-Last-alerts',
  _type: 'visualization',
  _source: {
    title: 'Last alerts',
    visState: '{"title":"Last alerts","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":3,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.description","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":50,"order":"desc","orderBy":"1","customLabel":"Event"}},{"id":"4","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.audit.exe","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":10,"order":"desc","orderBy":"1","customLabel":"Command"}},{"id":"5","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.audit.type","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":5,"order":"desc","orderBy":"1","customLabel":"Type"}}]}',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFnZW50cy1hdWRpdC50cyJdLCJuYW1lcyI6WyJfaWQiLCJfc291cmNlIiwidGl0bGUiLCJ2aXNTdGF0ZSIsInVpU3RhdGVKU09OIiwiZGVzY3JpcHRpb24iLCJ2ZXJzaW9uIiwia2liYW5hU2F2ZWRPYmplY3RNZXRhIiwic2VhcmNoU291cmNlSlNPTiIsIl90eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7O2VBV2UsQ0FDYjtBQUNFQSxFQUFBQSxHQUFHLEVBQUUseUNBRFA7QUFFRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxrQkFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04saXJCQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFBRSx1REFKTjtBQUtQQyxJQUFBQSxXQUFXLEVBQUUsRUFMTjtBQU1QQyxJQUFBQSxPQUFPLEVBQUUsQ0FORjtBQU9QQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBREU7QUFQaEIsR0FGWDtBQTRDRUMsRUFBQUEsS0FBSyxFQUFFO0FBNUNULENBRGEsRUErQ2I7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLDBDQURQO0FBRUVDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsbUJBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLG1yQkFISztBQUlQQyxJQUFBQSxXQUFXLEVBQUUsdURBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQURFO0FBUGhCLEdBRlg7QUE0Q0VDLEVBQUFBLEtBQUssRUFBRTtBQTVDVCxDQS9DYSxFQTZGYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUsOENBRFA7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QUNFVCxFQUFBQSxHQUFHLEVBQUUsb0NBRFA7QUFFRVMsRUFBQUEsS0FBSyxFQUFFLGVBRlQ7QUFHRVIsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxhQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTix5aENBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUNULGtFQUxLO0FBTVBDLElBQUFBLFdBQVcsRUFBRSxFQU5OO0FBT1BDLElBQUFBLE9BQU8sRUFBRSxDQVBGO0FBUVBDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVJoQjtBQUhYLENBbFFhLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogV2F6dWggYXBwIC0gTW9kdWxlIGZvciBBZ2VudHMvQXVkaXQgdmlzdWFsaXphdGlvbnNcbiAqIENvcHlyaWdodCAoQykgMjAxNS0yMDIxIFdhenVoLCBJbmMuXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU7IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG4gKiB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uOyBlaXRoZXIgdmVyc2lvbiAyIG9mIHRoZSBMaWNlbnNlLCBvclxuICogKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBGaW5kIG1vcmUgaW5mb3JtYXRpb24gYWJvdXQgdGhpcyBvbiB0aGUgTElDRU5TRSBmaWxlLlxuICovXG5leHBvcnQgZGVmYXVsdCBbXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLUF1ZGl0LU5ldy1maWxlcy1tZXRyaWMnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnTmV3IGZpbGVzIG1ldHJpYycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJOZXcgZmlsZXMgbWV0cmljXCIsXCJ0eXBlXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6ZmFsc2UsXCJ0eXBlXCI6XCJnYXVnZVwiLFwiZ2F1Z2VcIjp7XCJ2ZXJ0aWNhbFNwbGl0XCI6ZmFsc2UsXCJhdXRvRXh0ZW5kXCI6ZmFsc2UsXCJwZXJjZW50YWdlTW9kZVwiOmZhbHNlLFwiZ2F1Z2VUeXBlXCI6XCJNZXRyaWNcIixcImdhdWdlU3R5bGVcIjpcIkZ1bGxcIixcImJhY2tTdHlsZVwiOlwiRnVsbFwiLFwib3JpZW50YXRpb25cIjpcInZlcnRpY2FsXCIsXCJjb2xvclNjaGVtYVwiOlwiR3JlZW4gdG8gUmVkXCIsXCJnYXVnZUNvbG9yTW9kZVwiOlwiTm9uZVwiLFwidXNlUmFuZ2VcIjpmYWxzZSxcImNvbG9yc1JhbmdlXCI6W3tcImZyb21cIjowLFwidG9cIjoxMDB9XSxcImludmVydENvbG9yc1wiOmZhbHNlLFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJjb2xvclwiOlwiYmxhY2tcIn0sXCJzY2FsZVwiOntcInNob3dcIjpmYWxzZSxcImxhYmVsc1wiOmZhbHNlLFwiY29sb3JcIjpcIiMzMzNcIixcIndpZHRoXCI6Mn0sXCJ0eXBlXCI6XCJzaW1wbGVcIixcInN0eWxlXCI6e1wiZm9udFNpemVcIjoyMCxcImJnQ29sb3JcIjpmYWxzZSxcImxhYmVsQ29sb3JcIjpmYWxzZSxcInN1YlRleHRcIjpcIlwifX19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImN1c3RvbUxhYmVsXCI6XCJOZXcgZmlsZXNcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7XCJ2aXNcIjp7XCJkZWZhdWx0Q29sb3JzXCI6e1wiMCAtIDEwMFwiOlwicmdiKDAsMTA0LDU1KVwifX19JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwicnVsZS5pZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiODA3OTBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiODA3OTBcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJ1bGUuaWRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcIjgwNzkwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtQXVkaXQtUmVhZC1maWxlcy1tZXRyaWMnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnUmVhZCBmaWxlcyBtZXRyaWMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiUmVhZCBmaWxlcyBtZXRyaWNcIixcInR5cGVcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjpmYWxzZSxcInR5cGVcIjpcImdhdWdlXCIsXCJnYXVnZVwiOntcInZlcnRpY2FsU3BsaXRcIjpmYWxzZSxcImF1dG9FeHRlbmRcIjpmYWxzZSxcInBlcmNlbnRhZ2VNb2RlXCI6ZmFsc2UsXCJnYXVnZVR5cGVcIjpcIk1ldHJpY1wiLFwiZ2F1Z2VTdHlsZVwiOlwiRnVsbFwiLFwiYmFja1N0eWxlXCI6XCJGdWxsXCIsXCJvcmllbnRhdGlvblwiOlwidmVydGljYWxcIixcImNvbG9yU2NoZW1hXCI6XCJHcmVlbiB0byBSZWRcIixcImdhdWdlQ29sb3JNb2RlXCI6XCJOb25lXCIsXCJ1c2VSYW5nZVwiOmZhbHNlLFwiY29sb3JzUmFuZ2VcIjpbe1wiZnJvbVwiOjAsXCJ0b1wiOjEwMH1dLFwiaW52ZXJ0Q29sb3JzXCI6ZmFsc2UsXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcImNvbG9yXCI6XCJibGFja1wifSxcInNjYWxlXCI6e1wic2hvd1wiOmZhbHNlLFwibGFiZWxzXCI6ZmFsc2UsXCJjb2xvclwiOlwiIzMzM1wiLFwid2lkdGhcIjoyfSxcInR5cGVcIjpcInNpbXBsZVwiLFwic3R5bGVcIjp7XCJmb250U2l6ZVwiOjIwLFwiYmdDb2xvclwiOmZhbHNlLFwibGFiZWxDb2xvclwiOmZhbHNlLFwic3ViVGV4dFwiOlwiXCJ9fX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiY3VzdG9tTGFiZWxcIjpcIlJlYWQgZmlsZXNcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7XCJ2aXNcIjp7XCJkZWZhdWx0Q29sb3JzXCI6e1wiMCAtIDEwMFwiOlwicmdiKDAsMTA0LDU1KVwifX19JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwicnVsZS5pZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiODA3ODRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwiODA3ODRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInJ1bGUuaWRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcIjgwNzg0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtQXVkaXQtTW9kaWZpZWQtZmlsZXMtbWV0cmljJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ01vZGlmaWVkIGZpbGVzIG1ldHJpYycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJNb2RpZmllZCBmaWxlcyBtZXRyaWNcIixcInR5cGVcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjpmYWxzZSxcInR5cGVcIjpcImdhdWdlXCIsXCJnYXVnZVwiOntcInZlcnRpY2FsU3BsaXRcIjpmYWxzZSxcImF1dG9FeHRlbmRcIjpmYWxzZSxcInBlcmNlbnRhZ2VNb2RlXCI6ZmFsc2UsXCJnYXVnZVR5cGVcIjpcIk1ldHJpY1wiLFwiZ2F1Z2VTdHlsZVwiOlwiRnVsbFwiLFwiYmFja1N0eWxlXCI6XCJGdWxsXCIsXCJvcmllbnRhdGlvblwiOlwidmVydGljYWxcIixcImNvbG9yU2NoZW1hXCI6XCJHcmVlbiB0byBSZWRcIixcImdhdWdlQ29sb3JNb2RlXCI6XCJOb25lXCIsXCJ1c2VSYW5nZVwiOmZhbHNlLFwiY29sb3JzUmFuZ2VcIjpbe1wiZnJvbVwiOjAsXCJ0b1wiOjEwMH1dLFwiaW52ZXJ0Q29sb3JzXCI6ZmFsc2UsXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcImNvbG9yXCI6XCJibGFja1wifSxcInNjYWxlXCI6e1wic2hvd1wiOmZhbHNlLFwibGFiZWxzXCI6ZmFsc2UsXCJjb2xvclwiOlwiIzMzM1wiLFwid2lkdGhcIjoyfSxcInR5cGVcIjpcInNpbXBsZVwiLFwic3R5bGVcIjp7XCJmb250U2l6ZVwiOjIwLFwiYmdDb2xvclwiOmZhbHNlLFwibGFiZWxDb2xvclwiOmZhbHNlLFwic3ViVGV4dFwiOlwiXCJ9fX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e1wiY3VzdG9tTGFiZWxcIjpcIk1vZGlmaWVkIGZpbGVzXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne1widmlzXCI6e1wiZGVmYXVsdENvbG9yc1wiOntcIjAgLSAxMDBcIjpcInJnYigwLDEwNCw1NSlcIn19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJydWxlLmlkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInZhbHVlXCI6IFwiODA3ODEsIDgwNzg3XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiODA3ODFcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI4MDc4N1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJuZWdhdGVcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJhbGlhc1wiOiBudWxsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYm9vbFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic2hvdWxkXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoX3BocmFzZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicnVsZS5pZFwiOiBcIjgwNzgxXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hfcGhyYXNlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJydWxlLmlkXCI6IFwiODA3ODdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtaW5pbXVtX3Nob3VsZF9tYXRjaFwiOiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLUF1ZGl0LVJlbW92ZWQtZmlsZXMtbWV0cmljJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1JlbW92ZWQgZmlsZXMgbWV0cmljJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIlJlbW92ZWQgZmlsZXMgbWV0cmljXCIsXCJ0eXBlXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6ZmFsc2UsXCJ0eXBlXCI6XCJnYXVnZVwiLFwiZ2F1Z2VcIjp7XCJ2ZXJ0aWNhbFNwbGl0XCI6ZmFsc2UsXCJhdXRvRXh0ZW5kXCI6ZmFsc2UsXCJwZXJjZW50YWdlTW9kZVwiOmZhbHNlLFwiZ2F1Z2VUeXBlXCI6XCJNZXRyaWNcIixcImdhdWdlU3R5bGVcIjpcIkZ1bGxcIixcImJhY2tTdHlsZVwiOlwiRnVsbFwiLFwib3JpZW50YXRpb25cIjpcInZlcnRpY2FsXCIsXCJjb2xvclNjaGVtYVwiOlwiR3JlZW4gdG8gUmVkXCIsXCJnYXVnZUNvbG9yTW9kZVwiOlwiTm9uZVwiLFwidXNlUmFuZ2VcIjpmYWxzZSxcImNvbG9yc1JhbmdlXCI6W3tcImZyb21cIjowLFwidG9cIjoxMDB9XSxcImludmVydENvbG9yc1wiOmZhbHNlLFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJjb2xvclwiOlwiYmxhY2tcIn0sXCJzY2FsZVwiOntcInNob3dcIjpmYWxzZSxcImxhYmVsc1wiOmZhbHNlLFwiY29sb3JcIjpcIiMzMzNcIixcIndpZHRoXCI6Mn0sXCJ0eXBlXCI6XCJzaW1wbGVcIixcInN0eWxlXCI6e1wiZm9udFNpemVcIjoyMCxcImJnQ29sb3JcIjpmYWxzZSxcImxhYmVsQ29sb3JcIjpmYWxzZSxcInN1YlRleHRcIjpcIlwifX19LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOntcImN1c3RvbUxhYmVsXCI6XCJSZW1vdmVkIGZpbGVzXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne1widmlzXCI6e1wiZGVmYXVsdENvbG9yc1wiOntcIjAgLSAxMDBcIjpcInJnYigwLDEwNCw1NSlcIn19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImtleVwiOiBcInJ1bGUuaWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIjgwNzkxXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcIjgwNzkxXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJydWxlLmlkXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCI4MDc5MVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLUF1ZGl0LUdyb3VwcycsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdHcm91cHMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiR3JvdXBzXCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJydWxlLmdyb3Vwc1wiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1BdWRpdC1GaWxlcycsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdGaWxlcycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJGaWxlc1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWV9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS5hdWRpdC5maWxlLm5hbWVcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtQXVkaXQtQWxlcnRzLW92ZXItdGltZScsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdBbGVydHMgb3ZlciB0aW1lJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkFsZXJ0cyBvdmVyIHRpbWVcIixcInR5cGVcIjpcImFyZWFcIixcInBhcmFtc1wiOntcInR5cGVcIjpcImFyZWFcIixcImdyaWRcIjp7XCJjYXRlZ29yeUxpbmVzXCI6dHJ1ZSxcInN0eWxlXCI6e1wiY29sb3JcIjpcIiNlZWVcIn0sXCJ2YWx1ZUF4aXNcIjpcIlZhbHVlQXhpcy0xXCJ9LFwiY2F0ZWdvcnlBeGVzXCI6W3tcImlkXCI6XCJDYXRlZ29yeUF4aXMtMVwiLFwidHlwZVwiOlwiY2F0ZWdvcnlcIixcInBvc2l0aW9uXCI6XCJib3R0b21cIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH0sXCJ0aXRsZVwiOnt9fV0sXCJ2YWx1ZUF4ZXNcIjpbe1wiaWRcIjpcIlZhbHVlQXhpcy0xXCIsXCJuYW1lXCI6XCJMZWZ0QXhpcy0xXCIsXCJ0eXBlXCI6XCJ2YWx1ZVwiLFwicG9zaXRpb25cIjpcImxlZnRcIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCIsXCJtb2RlXCI6XCJub3JtYWxcIn0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcInJvdGF0ZVwiOjAsXCJmaWx0ZXJcIjpmYWxzZSxcInRydW5jYXRlXCI6MTAwfSxcInRpdGxlXCI6e1widGV4dFwiOlwiQ291bnRcIn19XSxcInNlcmllc1BhcmFtc1wiOlt7XCJzaG93XCI6XCJ0cnVlXCIsXCJ0eXBlXCI6XCJhcmVhXCIsXCJtb2RlXCI6XCJzdGFja2VkXCIsXCJkYXRhXCI6e1wibGFiZWxcIjpcIkNvdW50XCIsXCJpZFwiOlwiMVwifSxcImRyYXdMaW5lc0JldHdlZW5Qb2ludHNcIjp0cnVlLFwic2hvd0NpcmNsZXNcIjp0cnVlLFwiaW50ZXJwb2xhdGVcIjpcImNhcmRpbmFsXCIsXCJ2YWx1ZUF4aXNcIjpcIlZhbHVlQXhpcy0xXCJ9XSxcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwidGltZXNcIjpbXSxcImFkZFRpbWVNYXJrZXJcIjpmYWxzZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIzXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImdyb3VwXCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS5kZXNjcmlwdGlvblwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIn19LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImRhdGVfaGlzdG9ncmFtXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJ0aW1lc3RhbXBcIixcInRpbWVSYW5nZVwiOntcImZyb21cIjpcIm5vdy0xaFwiLFwidG9cIjpcIm5vd1wiLFwibW9kZVwiOlwicXVpY2tcIn0sXCJ1c2VOb3JtYWxpemVkRXNJbnRlcnZhbFwiOnRydWUsXCJpbnRlcnZhbFwiOlwiYXV0b1wiLFwidGltZV96b25lXCI6XCJFdXJvcGUvQmVybGluXCIsXCJkcm9wX3BhcnRpYWxzXCI6ZmFsc2UsXCJjdXN0b21JbnRlcnZhbFwiOlwiMmhcIixcIm1pbl9kb2NfY291bnRcIjoxLFwiZXh0ZW5kZWRfYm91bmRzXCI6e319fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLUF1ZGl0LUNvbW1hbmRzJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0NvbW1hbmRzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkNvbW1hbmRzXCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLmF1ZGl0LmNvbW1hbmRcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtQXVkaXQtTGFzdC1hbGVydHMnLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdMYXN0IGFsZXJ0cycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJMYXN0IGFsZXJ0c1wiLFwidHlwZVwiOlwidGFibGVcIixcInBhcmFtc1wiOntcInBlclBhZ2VcIjoxMCxcInNob3dQYXJ0aWFsUm93c1wiOmZhbHNlLFwic2hvd01ldGljc0F0QWxsTGV2ZWxzXCI6ZmFsc2UsXCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjozLFwiZGlyZWN0aW9uXCI6XCJkZXNjXCJ9LFwic2hvd1RvdGFsXCI6ZmFsc2UsXCJ0b3RhbEZ1bmNcIjpcInN1bVwifSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjNcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS5kZXNjcmlwdGlvblwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIixcInNpemVcIjo1MCxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJjdXN0b21MYWJlbFwiOlwiRXZlbnRcIn19LHtcImlkXCI6XCI0XCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEuYXVkaXQuZXhlXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwic2l6ZVwiOjEwLFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcImN1c3RvbUxhYmVsXCI6XCJDb21tYW5kXCJ9fSx7XCJpZFwiOlwiNVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLmF1ZGl0LnR5cGVcIixcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJjdXN0b21MYWJlbFwiOlwiVHlwZVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjpcbiAgICAgICAgJ3tcInZpc1wiOntcInBhcmFtc1wiOntcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOjMsXCJkaXJlY3Rpb25cIjpcImRlc2NcIn19fX0nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfVxuICB9XG5dO1xuIl19