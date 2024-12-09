"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Wazuh app - Module for Agents/FIM visualizations
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
  _id: 'Wazuh-App-Agents-FIM-Users',
  _source: {
    title: 'Most active users',
    visState: '{"title":"Most active users","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":false,"legendPosition":"right","isDonut":true,"labels":{"show":true,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"syscheck.uname_after","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-FIM-Actions',
  _source: {
    title: 'Actions',
    visState: '{"title":"Actions","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":false,"legendPosition":"right","isDonut":true,"labels":{"show":true,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"syscheck.event","size":5,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-FIM-Events',
  _source: {
    title: 'Events',
    visState: '{ "title": "Unique events", "type": "line", "params": { "type": "line", "grid": { "categoryLines": false }, "categoryAxes": [ { "id": "CategoryAxis-1", "type": "category", "position": "bottom", "show": true, "style": {}, "scale": { "type": "linear" }, "labels": { "show": true, "truncate": 100 }, "title": {} } ], "valueAxes": [ { "id": "ValueAxis-1", "name": "LeftAxis-1", "type": "value", "position": "left", "show": true, "style": {}, "scale": { "type": "linear", "mode": "normal" }, "labels": { "show": true, "rotate": 0, "filter": false, "truncate": 100 }, "title": { "text": "数量" } } ], "seriesParams": [ { "show": "true", "type": "line", "mode": "normal", "data": { "label": "Count", "id": "1" }, "valueAxis": "ValueAxis-1", "drawLinesBetweenPoints": true, "showCircles": true } ], "addTooltip": true, "addLegend": true, "legendPosition": "right", "times": [], "addTimeMarker": false, "dimensions": { "x": { "accessor": 0, "format": { "id": "terms", "params": { "id": "string", "otherBucketLabel": "Other", "missingBucketLabel": "Missing" } }, "params": {}, "aggType": "terms" }, "y": [ { "accessor": 2, "format": { "id": "number" }, "params": {}, "aggType": "count" } ], "series": [ { "accessor": 1, "format": { "id": "terms", "params": { "id": "string", "otherBucketLabel": "Other", "missingBucketLabel": "Missing" } }, "params": {}, "aggType": "terms" } ] } }, "aggs": [ { "id": "1", "enabled": true, "type": "count", "schema": "metric", "params": {} }, { "id": "2", "enabled": true, "type": "date_histogram", "schema": "segment", "params": { "field": "timestamp", "useNormalizedEsInterval": true, "interval": "auto", "drop_partials": false, "min_doc_count": 1, "extended_bounds": {} } }, { "id": "3", "enabled": true, "type": "terms", "schema": "group", "params": { "field": "syscheck.event", "order": "desc", "size": 5, "orderBy": "1", "otherBucket": false, "otherBucketLabel": "Other", "missingBucket": false, "missingBucketLabel": "Missing" } } ] }',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-FIM-Files-added',
  _source: {
    title: 'Files added',
    visState: '{"title":"Files added","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"syscheck.path","size":5,"order":"desc","orderBy":"1"}}]}',
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
                              "type": "phrases",
                              "key": "syscheck.event",
                              "value": "added, readded",
                              "params": [
                                "added",
                                "readded"
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
                                      "syscheck.event": "added"
                                    }
                                  },
                                  {
                                    "match_phrase": {
                                      "syscheck.event": "readded"
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
  _id: 'Wazuh-App-Agents-FIM-Files-modified',
  _source: {
    title: 'Files modified',
    visState: '{"title":"Files modified","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"syscheck.path","size":5,"order":"desc","orderBy":"1"}}]}',
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
                              "key": "syscheck.event",
                              "value": "modified",
                              "params": {
                                "query": "modified",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "syscheck.event": {
                                  "query": "modified",
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
  _id: 'Wazuh-App-Agents-FIM-Files-deleted',
  _source: {
    title: 'Files deleted',
    visState: '{"title":"Files deleted","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"syscheck.path","size":5,"order":"desc","orderBy":"1"}}]}',
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
                              "key": "syscheck.event",
                              "value": "deleted",
                              "params": {
                                "query": "deleted",
                                "type": "phrase"
                              }
                            },
                            "query": {
                              "match": {
                                "syscheck.event": {
                                  "query": "deleted",
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
  _id: 'Wazuh-App-Agents-FIM-Alerts-summary',
  _type: 'visualization',
  _source: {
    title: 'Alerts summary',
    visState: '{"title":"Alerts summary","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":2,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"syscheck.path","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":50,"order":"desc","orderBy":"1","customLabel":"File"}},{"id":"5","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.description","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":10,"order":"desc","orderBy":"1","customLabel":"Description"}}]}',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFnZW50cy1maW0udHMiXSwibmFtZXMiOlsiX2lkIiwiX3NvdXJjZSIsInRpdGxlIiwidmlzU3RhdGUiLCJ1aVN0YXRlSlNPTiIsImRlc2NyaXB0aW9uIiwidmVyc2lvbiIsImtpYmFuYVNhdmVkT2JqZWN0TWV0YSIsInNlYXJjaFNvdXJjZUpTT04iLCJfdHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7Ozs7OztlQVdlLENBQ2I7QUFDRUEsRUFBQUEsR0FBRyxFQUFFLDRCQURQO0FBRUVDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsbUJBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLHNoQkFISztBQUlQQyxJQUFBQSxXQUFXLEVBQUUsSUFKTjtBQUtQQyxJQUFBQSxXQUFXLEVBQUUsRUFMTjtBQU1QQyxJQUFBQSxPQUFPLEVBQUUsQ0FORjtBQU9QQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQ2Q7QUFGbUI7QUFQaEIsR0FGWDtBQWNFQyxFQUFBQSxLQUFLLEVBQUU7QUFkVCxDQURhLEVBaUJiO0FBQ0VULEVBQUFBLEdBQUcsRUFBRSw4QkFEUDtBQUVFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLFNBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLHNnQkFISztBQUlQQyxJQUFBQSxXQUFXLEVBQUUsSUFKTjtBQUtQQyxJQUFBQSxXQUFXLEVBQUUsRUFMTjtBQU1QQyxJQUFBQSxPQUFPLEVBQUUsQ0FORjtBQU9QQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQ2Q7QUFGbUI7QUFQaEIsR0FGWDtBQWNFQyxFQUFBQSxLQUFLLEVBQUU7QUFkVCxDQWpCYSxFQWlDYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUsNkJBRFA7QUFFRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxRQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTiwrNkRBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLElBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUNkO0FBRm1CO0FBUGhCLEdBRlg7QUFjRUMsRUFBQUEsS0FBSyxFQUFFO0FBZFQsQ0FqQ2EsRUFpRGI7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLGtDQURQO0FBRUVDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsYUFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04sOFZBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLElBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQURFO0FBUGhCLEdBRlg7QUFxREVDLEVBQUFBLEtBQUssRUFBRTtBQXJEVCxDQWpEYSxFQXdHYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUscUNBRFA7QUFFRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxnQkFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04saVdBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLElBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQURFO0FBUGhCLEdBRlg7QUE0Q0VDLEVBQUFBLEtBQUssRUFBRTtBQTVDVCxDQXhHYSxFQXNKYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUsb0NBRFA7QUFFRUMsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxlQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTixnV0FISztBQUlQQyxJQUFBQSxXQUFXLEVBQUUsSUFKTjtBQUtQQyxJQUFBQSxXQUFXLEVBQUUsRUFMTjtBQU1QQyxJQUFBQSxPQUFPLEVBQUUsQ0FORjtBQU9QQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBREU7QUFQaEIsR0FGWDtBQTRDRUMsRUFBQUEsS0FBSyxFQUFFO0FBNUNULENBdEphLEVBb01iO0FBQ0VULEVBQUFBLEdBQUcsRUFBRSxxQ0FEUDtBQUVFUyxFQUFBQSxLQUFLLEVBQUUsZUFGVDtBQUdFUixFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLGdCQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTiwreEJBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUNULGtFQUxLO0FBTVBDLElBQUFBLFdBQVcsRUFBRSxFQU5OO0FBT1BDLElBQUFBLE9BQU8sRUFBRSxDQVBGO0FBUVBDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVJoQjtBQUhYLENBcE1hLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogV2F6dWggYXBwIC0gTW9kdWxlIGZvciBBZ2VudHMvRklNIHZpc3VhbGl6YXRpb25zXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTUtMjAyMSBXYXp1aCwgSW5jLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMiBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogRmluZCBtb3JlIGluZm9ybWF0aW9uIGFib3V0IHRoaXMgb24gdGhlIExJQ0VOU0UgZmlsZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgW1xuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1GSU0tVXNlcnMnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnTW9zdCBhY3RpdmUgdXNlcnMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiTW9zdCBhY3RpdmUgdXNlcnNcIixcInR5cGVcIjpcInBpZVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwicGllXCIsXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOmZhbHNlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwidmFsdWVzXCI6dHJ1ZSxcImxhc3RfbGV2ZWxcIjp0cnVlLFwidHJ1bmNhdGVcIjoxMDB9fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcInN5c2NoZWNrLnVuYW1lX2FmdGVyXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1GSU0tQWN0aW9ucycsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdBY3Rpb25zJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkFjdGlvbnNcIixcInR5cGVcIjpcInBpZVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwicGllXCIsXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOmZhbHNlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwidmFsdWVzXCI6dHJ1ZSxcImxhc3RfbGV2ZWxcIjp0cnVlLFwidHJ1bmNhdGVcIjoxMDB9fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcInN5c2NoZWNrLmV2ZW50XCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1GSU0tRXZlbnRzJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0V2ZW50cycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3sgXCJ0aXRsZVwiOiBcIlVuaXF1ZSBldmVudHNcIiwgXCJ0eXBlXCI6IFwibGluZVwiLCBcInBhcmFtc1wiOiB7IFwidHlwZVwiOiBcImxpbmVcIiwgXCJncmlkXCI6IHsgXCJjYXRlZ29yeUxpbmVzXCI6IGZhbHNlIH0sIFwiY2F0ZWdvcnlBeGVzXCI6IFsgeyBcImlkXCI6IFwiQ2F0ZWdvcnlBeGlzLTFcIiwgXCJ0eXBlXCI6IFwiY2F0ZWdvcnlcIiwgXCJwb3NpdGlvblwiOiBcImJvdHRvbVwiLCBcInNob3dcIjogdHJ1ZSwgXCJzdHlsZVwiOiB7fSwgXCJzY2FsZVwiOiB7IFwidHlwZVwiOiBcImxpbmVhclwiIH0sIFwibGFiZWxzXCI6IHsgXCJzaG93XCI6IHRydWUsIFwidHJ1bmNhdGVcIjogMTAwIH0sIFwidGl0bGVcIjoge30gfSBdLCBcInZhbHVlQXhlc1wiOiBbIHsgXCJpZFwiOiBcIlZhbHVlQXhpcy0xXCIsIFwibmFtZVwiOiBcIkxlZnRBeGlzLTFcIiwgXCJ0eXBlXCI6IFwidmFsdWVcIiwgXCJwb3NpdGlvblwiOiBcImxlZnRcIiwgXCJzaG93XCI6IHRydWUsIFwic3R5bGVcIjoge30sIFwic2NhbGVcIjogeyBcInR5cGVcIjogXCJsaW5lYXJcIiwgXCJtb2RlXCI6IFwibm9ybWFsXCIgfSwgXCJsYWJlbHNcIjogeyBcInNob3dcIjogdHJ1ZSwgXCJyb3RhdGVcIjogMCwgXCJmaWx0ZXJcIjogZmFsc2UsIFwidHJ1bmNhdGVcIjogMTAwIH0sIFwidGl0bGVcIjogeyBcInRleHRcIjogXCJDb3VudFwiIH0gfSBdLCBcInNlcmllc1BhcmFtc1wiOiBbIHsgXCJzaG93XCI6IFwidHJ1ZVwiLCBcInR5cGVcIjogXCJsaW5lXCIsIFwibW9kZVwiOiBcIm5vcm1hbFwiLCBcImRhdGFcIjogeyBcImxhYmVsXCI6IFwiQ291bnRcIiwgXCJpZFwiOiBcIjFcIiB9LCBcInZhbHVlQXhpc1wiOiBcIlZhbHVlQXhpcy0xXCIsIFwiZHJhd0xpbmVzQmV0d2VlblBvaW50c1wiOiB0cnVlLCBcInNob3dDaXJjbGVzXCI6IHRydWUgfSBdLCBcImFkZFRvb2x0aXBcIjogdHJ1ZSwgXCJhZGRMZWdlbmRcIjogdHJ1ZSwgXCJsZWdlbmRQb3NpdGlvblwiOiBcInJpZ2h0XCIsIFwidGltZXNcIjogW10sIFwiYWRkVGltZU1hcmtlclwiOiBmYWxzZSwgXCJkaW1lbnNpb25zXCI6IHsgXCJ4XCI6IHsgXCJhY2Nlc3NvclwiOiAwLCBcImZvcm1hdFwiOiB7IFwiaWRcIjogXCJ0ZXJtc1wiLCBcInBhcmFtc1wiOiB7IFwiaWRcIjogXCJzdHJpbmdcIiwgXCJvdGhlckJ1Y2tldExhYmVsXCI6IFwiT3RoZXJcIiwgXCJtaXNzaW5nQnVja2V0TGFiZWxcIjogXCJNaXNzaW5nXCIgfSB9LCBcInBhcmFtc1wiOiB7fSwgXCJhZ2dUeXBlXCI6IFwidGVybXNcIiB9LCBcInlcIjogWyB7IFwiYWNjZXNzb3JcIjogMiwgXCJmb3JtYXRcIjogeyBcImlkXCI6IFwibnVtYmVyXCIgfSwgXCJwYXJhbXNcIjoge30sIFwiYWdnVHlwZVwiOiBcImNvdW50XCIgfSBdLCBcInNlcmllc1wiOiBbIHsgXCJhY2Nlc3NvclwiOiAxLCBcImZvcm1hdFwiOiB7IFwiaWRcIjogXCJ0ZXJtc1wiLCBcInBhcmFtc1wiOiB7IFwiaWRcIjogXCJzdHJpbmdcIiwgXCJvdGhlckJ1Y2tldExhYmVsXCI6IFwiT3RoZXJcIiwgXCJtaXNzaW5nQnVja2V0TGFiZWxcIjogXCJNaXNzaW5nXCIgfSB9LCBcInBhcmFtc1wiOiB7fSwgXCJhZ2dUeXBlXCI6IFwidGVybXNcIiB9IF0gfSB9LCBcImFnZ3NcIjogWyB7IFwiaWRcIjogXCIxXCIsIFwiZW5hYmxlZFwiOiB0cnVlLCBcInR5cGVcIjogXCJjb3VudFwiLCBcInNjaGVtYVwiOiBcIm1ldHJpY1wiLCBcInBhcmFtc1wiOiB7fSB9LCB7IFwiaWRcIjogXCIyXCIsIFwiZW5hYmxlZFwiOiB0cnVlLCBcInR5cGVcIjogXCJkYXRlX2hpc3RvZ3JhbVwiLCBcInNjaGVtYVwiOiBcInNlZ21lbnRcIiwgXCJwYXJhbXNcIjogeyBcImZpZWxkXCI6IFwidGltZXN0YW1wXCIsIFwidXNlTm9ybWFsaXplZEVzSW50ZXJ2YWxcIjogdHJ1ZSwgXCJpbnRlcnZhbFwiOiBcImF1dG9cIiwgXCJkcm9wX3BhcnRpYWxzXCI6IGZhbHNlLCBcIm1pbl9kb2NfY291bnRcIjogMSwgXCJleHRlbmRlZF9ib3VuZHNcIjoge30gfSB9LCB7IFwiaWRcIjogXCIzXCIsIFwiZW5hYmxlZFwiOiB0cnVlLCBcInR5cGVcIjogXCJ0ZXJtc1wiLCBcInNjaGVtYVwiOiBcImdyb3VwXCIsIFwicGFyYW1zXCI6IHsgXCJmaWVsZFwiOiBcInN5c2NoZWNrLmV2ZW50XCIsIFwib3JkZXJcIjogXCJkZXNjXCIsIFwic2l6ZVwiOiA1LCBcIm9yZGVyQnlcIjogXCIxXCIsIFwib3RoZXJCdWNrZXRcIjogZmFsc2UsIFwib3RoZXJCdWNrZXRMYWJlbFwiOiBcIk90aGVyXCIsIFwibWlzc2luZ0J1Y2tldFwiOiBmYWxzZSwgXCJtaXNzaW5nQnVja2V0TGFiZWxcIjogXCJNaXNzaW5nXCIgfSB9IF0gfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1GSU0tRmlsZXMtYWRkZWQnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnRmlsZXMgYWRkZWQnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiRmlsZXMgYWRkZWRcIixcInR5cGVcIjpcInBpZVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwicGllXCIsXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcImlzRG9udXRcIjp0cnVlfSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcInN5c2NoZWNrLnBhdGhcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046IGB7XG4gICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICBcImZpbHRlclwiOltcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm1ldGFcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOiBcIndhenVoLWFsZXJ0c1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlc1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJzeXNjaGVjay5ldmVudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcImFkZGVkLCByZWFkZGVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInBhcmFtc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWRkZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJyZWFkZGVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJib29sXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzaG91bGRcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hfcGhyYXNlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeXNjaGVjay5ldmVudFwiOiBcImFkZGVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWF0Y2hfcGhyYXNlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzeXNjaGVjay5ldmVudFwiOiBcInJlYWRkZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtaW5pbXVtX3Nob3VsZF9tYXRjaFwiOiAxXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiRzdGF0ZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInN0b3JlXCI6IFwiYXBwU3RhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifVxuICAgICAgICAgICAgICAgIH1gXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQWdlbnRzLUZJTS1GaWxlcy1tb2RpZmllZCcsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdGaWxlcyBtb2RpZmllZCcsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJGaWxlcyBtb2RpZmllZFwiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWV9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwic3lzY2hlY2sucGF0aFwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjogYHtcbiAgICAgICAgICAgICAgICAgICAgXCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmlsdGVyXCI6W1xuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibWV0YVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6IFwid2F6dWgtYWxlcnRzXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm5lZ2F0ZVwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcImFsaWFzXCI6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjogXCJwaHJhc2VcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwia2V5XCI6IFwic3lzY2hlY2suZXZlbnRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidmFsdWVcIjogXCJtb2RpZmllZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJwYXJhbXNcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInF1ZXJ5XCI6IFwibW9kaWZpZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3lzY2hlY2suZXZlbnRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJtb2RpZmllZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJHN0YXRlXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcmVcIjogXCJhcHBTdGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9XG4gICAgICAgICAgICAgICAgfWBcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtRklNLUZpbGVzLWRlbGV0ZWQnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnRmlsZXMgZGVsZXRlZCcsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJGaWxlcyBkZWxldGVkXCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJzeXNjaGVjay5wYXRoXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOiAne30nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOiBge1xuICAgICAgICAgICAgICAgICAgICBcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJmaWx0ZXJcIjpbXG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtZXRhXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaW5kZXhcIjogXCJ3YXp1aC1hbGVydHNcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwibmVnYXRlXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYWxpYXNcIjogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwidHlwZVwiOiBcInBocmFzZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJrZXlcIjogXCJzeXNjaGVjay5ldmVudFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcImRlbGV0ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicGFyYW1zXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOiBcImRlbGV0ZWRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJtYXRjaFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwic3lzY2hlY2suZXZlbnRcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCJkZWxldGVkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0eXBlXCI6IFwicGhyYXNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIkc3RhdGVcIjoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9yZVwiOiBcImFwcFN0YXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn1cbiAgICAgICAgICAgICAgICB9YFxuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1GSU0tQWxlcnRzLXN1bW1hcnknLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdBbGVydHMgc3VtbWFyeScsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJBbGVydHMgc3VtbWFyeVwiLFwidHlwZVwiOlwidGFibGVcIixcInBhcmFtc1wiOntcInBlclBhZ2VcIjoxMCxcInNob3dQYXJ0aWFsUm93c1wiOmZhbHNlLFwic2hvd01ldGljc0F0QWxsTGV2ZWxzXCI6ZmFsc2UsXCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjoyLFwiZGlyZWN0aW9uXCI6XCJkZXNjXCJ9LFwic2hvd1RvdGFsXCI6ZmFsc2UsXCJ0b3RhbEZ1bmNcIjpcInN1bVwifSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjNcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwic3lzY2hlY2sucGF0aFwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIixcInNpemVcIjo1MCxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJjdXN0b21MYWJlbFwiOlwiRmlsZVwifX0se1wiaWRcIjpcIjVcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS5kZXNjcmlwdGlvblwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIixcInNpemVcIjoxMCxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJjdXN0b21MYWJlbFwiOlwiRGVzY3JpcHRpb25cIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046XG4gICAgICAgICd7XCJ2aXNcIjp7XCJwYXJhbXNcIjp7XCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjoyLFwiZGlyZWN0aW9uXCI6XCJkZXNjXCJ9fX19JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH1cbiAgfVxuXTtcbiJdfQ==