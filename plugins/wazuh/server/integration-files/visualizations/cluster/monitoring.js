"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Wazuh app - Cluster monitoring visualizations
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
  _id: 'Wazuh-App-Cluster-monitoring-Overview',
  _type: 'visualization',
  _source: {
    title: 'Wazuh App Cluster Overview',
    visState: '{"title":"Wazuh App Cluster Overview","type":"timelion","params":{"expression":".es(*)","interval":"auto"},"aggs":[]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Cluster-monitoring-Overview-Manager',
  _type: 'visualization',
  _source: {
    title: 'Wazuh App Cluster Overview Manager',
    visState: '{"title":"Wazuh App Cluster Overview Manager","type":"timelion","params":{"expression":".es(q=agent.id:000)","interval":"auto"},"aggs":[]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}, {
  _id: 'Wazuh-App-Cluster-monitoring-Overview-Node',
  _source: {
    title: 'Wazuh App Cluster Overview Node',
    visState: '{"title":"Wazuh App Cluster Overview Node","type":"histogram","params":{"type":"histogram","grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":false,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"date_histogram","schema":"segment","params":{"field":"timestamp","interval":"auto","customInterval":"2h","min_doc_count":1,"extended_bounds":{}}}]}',
    uiStateJSON: '{"spy":{"mode":{"name":null,"fill":false}},"vis":{"legendOpen":false}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Cluster-monitoring-Overview-Node-Pie',
  _type: 'visualization',
  _source: {
    title: 'Wazuh App Cluster Overview Node Pie',
    visState: '{"title":"Wazuh App Cluster Overview Node Pie","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true,"labels":{"show":false,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"cluster.node","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":5,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{"spy":{"mode":{"name":"table"}}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  }
}];
exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vbml0b3JpbmcudHMiXSwibmFtZXMiOlsiX2lkIiwiX3R5cGUiLCJfc291cmNlIiwidGl0bGUiLCJ2aXNTdGF0ZSIsInVpU3RhdGVKU09OIiwiZGVzY3JpcHRpb24iLCJ2ZXJzaW9uIiwia2liYW5hU2F2ZWRPYmplY3RNZXRhIiwic2VhcmNoU291cmNlSlNPTiJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7Ozs7OztlQVdlLENBQ2I7QUFDRUEsRUFBQUEsR0FBRyxFQUFFLHVDQURQO0FBRUVDLEVBQUFBLEtBQUssRUFBRSxlQUZUO0FBR0VDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsNEJBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLHVIQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFBRSxJQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVBoQjtBQUhYLENBRGEsRUFpQmI7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLCtDQURQO0FBRUVDLEVBQUFBLEtBQUssRUFBRSxlQUZUO0FBR0VDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsb0NBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLDRJQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFBRSxJQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVBoQjtBQUhYLENBakJhLEVBaUNiO0FBQ0VULEVBQUFBLEdBQUcsRUFBRSw0Q0FEUDtBQUVFRSxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLGlDQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTiw0a0NBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUNULHdFQUxLO0FBTVBDLElBQUFBLFdBQVcsRUFBRSxFQU5OO0FBT1BDLElBQUFBLE9BQU8sRUFBRSxDQVBGO0FBUVBDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVJoQixHQUZYO0FBZUVSLEVBQUFBLEtBQUssRUFBRTtBQWZULENBakNhLEVBa0RiO0FBQ0VELEVBQUFBLEdBQUcsRUFBRSxnREFEUDtBQUVFQyxFQUFBQSxLQUFLLEVBQUUsZUFGVDtBQUdFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLHFDQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTixnaUJBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLG1DQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVBoQjtBQUhYLENBbERhLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogV2F6dWggYXBwIC0gQ2x1c3RlciBtb25pdG9yaW5nIHZpc3VhbGl6YXRpb25zXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTUtMjAyMSBXYXp1aCwgSW5jLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMiBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogRmluZCBtb3JlIGluZm9ybWF0aW9uIGFib3V0IHRoaXMgb24gdGhlIExJQ0VOU0UgZmlsZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgW1xuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUNsdXN0ZXItbW9uaXRvcmluZy1PdmVydmlldycsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1dhenVoIEFwcCBDbHVzdGVyIE92ZXJ2aWV3JyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIldhenVoIEFwcCBDbHVzdGVyIE92ZXJ2aWV3XCIsXCJ0eXBlXCI6XCJ0aW1lbGlvblwiLFwicGFyYW1zXCI6e1wiZXhwcmVzc2lvblwiOlwiLmVzKCopXCIsXCJpbnRlcnZhbFwiOlwiYXV0b1wifSxcImFnZ3NcIjpbXX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQ2x1c3Rlci1tb25pdG9yaW5nLU92ZXJ2aWV3LU1hbmFnZXInLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdXYXp1aCBBcHAgQ2x1c3RlciBPdmVydmlldyBNYW5hZ2VyJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIldhenVoIEFwcCBDbHVzdGVyIE92ZXJ2aWV3IE1hbmFnZXJcIixcInR5cGVcIjpcInRpbWVsaW9uXCIsXCJwYXJhbXNcIjp7XCJleHByZXNzaW9uXCI6XCIuZXMocT1hZ2VudC5pZDowMDApXCIsXCJpbnRlcnZhbFwiOlwiYXV0b1wifSxcImFnZ3NcIjpbXX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQ2x1c3Rlci1tb25pdG9yaW5nLU92ZXJ2aWV3LU5vZGUnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnV2F6dWggQXBwIENsdXN0ZXIgT3ZlcnZpZXcgTm9kZScsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJXYXp1aCBBcHAgQ2x1c3RlciBPdmVydmlldyBOb2RlXCIsXCJ0eXBlXCI6XCJoaXN0b2dyYW1cIixcInBhcmFtc1wiOntcInR5cGVcIjpcImhpc3RvZ3JhbVwiLFwiZ3JpZFwiOntcImNhdGVnb3J5TGluZXNcIjpmYWxzZSxcInN0eWxlXCI6e1wiY29sb3JcIjpcIiNlZWVcIn19LFwiY2F0ZWdvcnlBeGVzXCI6W3tcImlkXCI6XCJDYXRlZ29yeUF4aXMtMVwiLFwidHlwZVwiOlwiY2F0ZWdvcnlcIixcInBvc2l0aW9uXCI6XCJib3R0b21cIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMH0sXCJ0aXRsZVwiOnt9fV0sXCJ2YWx1ZUF4ZXNcIjpbe1wiaWRcIjpcIlZhbHVlQXhpcy0xXCIsXCJuYW1lXCI6XCJMZWZ0QXhpcy0xXCIsXCJ0eXBlXCI6XCJ2YWx1ZVwiLFwicG9zaXRpb25cIjpcImxlZnRcIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCIsXCJtb2RlXCI6XCJub3JtYWxcIn0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcInJvdGF0ZVwiOjAsXCJmaWx0ZXJcIjpmYWxzZSxcInRydW5jYXRlXCI6MTAwfSxcInRpdGxlXCI6e1widGV4dFwiOlwiQ291bnRcIn19XSxcInNlcmllc1BhcmFtc1wiOlt7XCJzaG93XCI6XCJ0cnVlXCIsXCJ0eXBlXCI6XCJoaXN0b2dyYW1cIixcIm1vZGVcIjpcInN0YWNrZWRcIixcImRhdGFcIjp7XCJsYWJlbFwiOlwiQ291bnRcIixcImlkXCI6XCIxXCJ9LFwidmFsdWVBeGlzXCI6XCJWYWx1ZUF4aXMtMVwiLFwiZHJhd0xpbmVzQmV0d2VlblBvaW50c1wiOnRydWUsXCJzaG93Q2lyY2xlc1wiOnRydWV9XSxcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6ZmFsc2UsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcInRpbWVzXCI6W10sXCJhZGRUaW1lTWFya2VyXCI6ZmFsc2V9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJkYXRlX2hpc3RvZ3JhbVwiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwidGltZXN0YW1wXCIsXCJpbnRlcnZhbFwiOlwiYXV0b1wiLFwiY3VzdG9tSW50ZXJ2YWxcIjpcIjJoXCIsXCJtaW5fZG9jX2NvdW50XCI6MSxcImV4dGVuZGVkX2JvdW5kc1wiOnt9fX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjpcbiAgICAgICAgJ3tcInNweVwiOntcIm1vZGVcIjp7XCJuYW1lXCI6bnVsbCxcImZpbGxcIjpmYWxzZX19LFwidmlzXCI6e1wibGVnZW5kT3BlblwiOmZhbHNlfX0nLFxuICAgICAgZGVzY3JpcHRpb246ICcnLFxuICAgICAgdmVyc2lvbjogMSxcbiAgICAgIGtpYmFuYVNhdmVkT2JqZWN0TWV0YToge1xuICAgICAgICBzZWFyY2hTb3VyY2VKU09OOlxuICAgICAgICAgICd7XCJpbmRleFwiOlwid2F6dWgtYWxlcnRzXCIsXCJmaWx0ZXJcIjpbXSxcInF1ZXJ5XCI6e1wicXVlcnlcIjpcIlwiLFwibGFuZ3VhZ2VcIjpcImx1Y2VuZVwifX0nXG4gICAgICB9XG4gICAgfSxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nXG4gIH0sXG4gIHtcbiAgICBfaWQ6ICdXYXp1aC1BcHAtQ2x1c3Rlci1tb25pdG9yaW5nLU92ZXJ2aWV3LU5vZGUtUGllJyxcbiAgICBfdHlwZTogJ3Zpc3VhbGl6YXRpb24nLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnV2F6dWggQXBwIENsdXN0ZXIgT3ZlcnZpZXcgTm9kZSBQaWUnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiV2F6dWggQXBwIENsdXN0ZXIgT3ZlcnZpZXcgTm9kZSBQaWVcIixcInR5cGVcIjpcInBpZVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwicGllXCIsXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcImlzRG9udXRcIjp0cnVlLFwibGFiZWxzXCI6e1wic2hvd1wiOmZhbHNlLFwidmFsdWVzXCI6dHJ1ZSxcImxhc3RfbGV2ZWxcIjp0cnVlLFwidHJ1bmNhdGVcIjoxMDB9fSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImNsdXN0ZXIubm9kZVwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7XCJzcHlcIjp7XCJtb2RlXCI6e1wibmFtZVwiOlwidGFibGVcIn19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH1cbl07XG4iXX0=