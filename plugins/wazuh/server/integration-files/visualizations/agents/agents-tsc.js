"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Wazuh app - Module for Agents/TSC visualizations
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
  _id: 'Wazuh-App-Agents-TSC-Groups',
  _source: {
    title: 'Top 5 rule groups',
    visState: '{"title":"Top 5 rule groups","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"rule.groups","size":5,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-TSC-Rule',
  _source: {
    title: 'Top 5 rules',
    visState: '{"title":"Top 5 rules","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"rule.description","size":5,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-TSC-Requirement',
  _source: {
    title: 'Top 5 requirements',
    visState: '{"title":"Top 5 requirements","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"rule.tsc","size":5,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-TSC-Rule-level-distribution',
  _source: {
    title: 'Rule level distribution',
    visState: '{"title":"Rule level distribution","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":false,"legendPosition":"right","isDonut":true,"labels":{"show":true,"values":true,"last_level":true,"truncate":100}},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"rule.level","size":15,"order":"desc","orderBy":"1","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing"}}]}',
    uiStateJSON: '{"vis":{"legendOpen":false}}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-TSC-Requirements',
  _source: {
    title: 'Requirements',
    visState: '{"title":"Requirements","type":"histogram","params":{"type":"histogram","grid":{"categoryLines":false,"style":{"color":"#eee"}},"categoryAxes":[{"id":"CategoryAxis-1","type":"category","position":"bottom","show":true,"style":{},"scale":{"type":"linear"},"labels":{"show":true,"truncate":100,"rotate":0},"title":{}}],"valueAxes":[{"id":"ValueAxis-1","name":"LeftAxis-1","type":"value","position":"left","show":true,"style":{},"scale":{"type":"linear","mode":"normal"},"labels":{"show":true,"rotate":0,"filter":false,"truncate":100},"title":{"text":"Count"}}],"seriesParams":[{"show":"true","type":"histogram","mode":"stacked","data":{"label":"Count","id":"1"},"valueAxis":"ValueAxis-1","drawLinesBetweenPoints":true,"showCircles":true}],"addTooltip":true,"addLegend":true,"legendPosition":"right","times":[],"addTimeMarker":false},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"3","enabled":true,"type":"terms","schema":"group","params":{"field":"rule.tsc","size":5,"order":"desc","orderBy":"1","customLabel":""}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"rule.tsc","size":10,"order":"desc","orderBy":"1","customLabel":"TSC Requirements"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Agents-TSC-Last-alerts',
  _type: 'visualization',
  _source: {
    title: 'Last alerts',
    visState: '{"title":"Last alerts","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":2,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.tsc","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":50,"order":"desc","orderBy":"1","customLabel":"Requirement"}},{"id":"4","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.description","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":10,"order":"desc","orderBy":"1","customLabel":"Rule description"}}]}',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFnZW50cy10c2MudHMiXSwibmFtZXMiOlsiX2lkIiwiX3NvdXJjZSIsInRpdGxlIiwidmlzU3RhdGUiLCJ1aVN0YXRlSlNPTiIsImRlc2NyaXB0aW9uIiwidmVyc2lvbiIsImtpYmFuYVNhdmVkT2JqZWN0TWV0YSIsInNlYXJjaFNvdXJjZUpTT04iLCJfdHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7Ozs7Ozs7OztlQVdlLENBQ2I7QUFDRUEsRUFBQUEsR0FBRyxFQUFFLDZCQURQO0FBRUVDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsbUJBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLGtXQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFBRSxJQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVBoQixHQUZYO0FBY0VDLEVBQUFBLEtBQUssRUFBRTtBQWRULENBRGEsRUFpQmI7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLDJCQURQO0FBRUVDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsYUFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04saVdBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLElBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUNkO0FBRm1CO0FBUGhCLEdBRlg7QUFjRUMsRUFBQUEsS0FBSyxFQUFFO0FBZFQsQ0FqQmEsRUFpQ2I7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLGtDQURQO0FBRUVDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsb0JBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLGdXQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFBRSxJQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVBoQixHQUZYO0FBY0VDLEVBQUFBLEtBQUssRUFBRTtBQWRULENBakNhLEVBaURiO0FBQ0VULEVBQUFBLEdBQUcsRUFBRSw4Q0FEUDtBQUVFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLHlCQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTixtaEJBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLDhCQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVBoQixHQUZYO0FBY0VDLEVBQUFBLEtBQUssRUFBRTtBQWRULENBakRhLEVBaUViO0FBQ0VULEVBQUFBLEdBQUcsRUFBRSxtQ0FEUDtBQUVFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLGNBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLGlzQ0FISztBQUlQQyxJQUFBQSxXQUFXLEVBQUUsSUFKTjtBQUtQQyxJQUFBQSxXQUFXLEVBQUUsRUFMTjtBQU1QQyxJQUFBQSxPQUFPLEVBQUUsQ0FORjtBQU9QQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQ2Q7QUFGbUI7QUFQaEIsR0FGWDtBQWNFQyxFQUFBQSxLQUFLLEVBQUU7QUFkVCxDQWpFYSxFQWlGYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUsa0NBRFA7QUFFRVMsRUFBQUEsS0FBSyxFQUFFLGVBRlQ7QUFHRVIsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxhQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTixteUJBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUNULGtFQUxLO0FBTVBDLElBQUFBLFdBQVcsRUFBRSxFQU5OO0FBT1BDLElBQUFBLE9BQU8sRUFBRSxDQVBGO0FBUVBDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVJoQjtBQUhYLENBakZhLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogV2F6dWggYXBwIC0gTW9kdWxlIGZvciBBZ2VudHMvVFNDIHZpc3VhbGl6YXRpb25zXG4gKiBDb3B5cmlnaHQgKEMpIDIwMTUtMjAyMSBXYXp1aCwgSW5jLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOyB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxuICogdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbjsgZWl0aGVyIHZlcnNpb24gMiBvZiB0aGUgTGljZW5zZSwgb3JcbiAqIChhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogRmluZCBtb3JlIGluZm9ybWF0aW9uIGFib3V0IHRoaXMgb24gdGhlIExJQ0VOU0UgZmlsZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgW1xuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1UU0MtR3JvdXBzJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1RvcCA1IHJ1bGUgZ3JvdXBzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIlRvcCA1IHJ1bGUgZ3JvdXBzXCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJydWxlLmdyb3Vwc1wiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1UU0MtUnVsZScsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdUb3AgNSBydWxlcycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJUb3AgNSBydWxlc1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWV9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS5kZXNjcmlwdGlvblwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1UU0MtUmVxdWlyZW1lbnQnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnVG9wIDUgcmVxdWlyZW1lbnRzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIlRvcCA1IHJlcXVpcmVtZW50c1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWV9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS50c2NcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtVFNDLVJ1bGUtbGV2ZWwtZGlzdHJpYnV0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ1J1bGUgbGV2ZWwgZGlzdHJpYnV0aW9uJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIlJ1bGUgbGV2ZWwgZGlzdHJpYnV0aW9uXCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjpmYWxzZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWUsXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcInZhbHVlc1wiOnRydWUsXCJsYXN0X2xldmVsXCI6dHJ1ZSxcInRydW5jYXRlXCI6MTAwfX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJydWxlLmxldmVsXCIsXCJzaXplXCI6MTUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7XCJ2aXNcIjp7XCJsZWdlbmRPcGVuXCI6ZmFsc2V9fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1BZ2VudHMtVFNDLVJlcXVpcmVtZW50cycsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdSZXF1aXJlbWVudHMnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiUmVxdWlyZW1lbnRzXCIsXCJ0eXBlXCI6XCJoaXN0b2dyYW1cIixcInBhcmFtc1wiOntcInR5cGVcIjpcImhpc3RvZ3JhbVwiLFwiZ3JpZFwiOntcImNhdGVnb3J5TGluZXNcIjpmYWxzZSxcInN0eWxlXCI6e1wiY29sb3JcIjpcIiNlZWVcIn19LFwiY2F0ZWdvcnlBeGVzXCI6W3tcImlkXCI6XCJDYXRlZ29yeUF4aXMtMVwiLFwidHlwZVwiOlwiY2F0ZWdvcnlcIixcInBvc2l0aW9uXCI6XCJib3R0b21cIixcInNob3dcIjp0cnVlLFwic3R5bGVcIjp7fSxcInNjYWxlXCI6e1widHlwZVwiOlwibGluZWFyXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJ0cnVuY2F0ZVwiOjEwMCxcInJvdGF0ZVwiOjB9LFwidGl0bGVcIjp7fX1dLFwidmFsdWVBeGVzXCI6W3tcImlkXCI6XCJWYWx1ZUF4aXMtMVwiLFwibmFtZVwiOlwiTGVmdEF4aXMtMVwiLFwidHlwZVwiOlwidmFsdWVcIixcInBvc2l0aW9uXCI6XCJsZWZ0XCIsXCJzaG93XCI6dHJ1ZSxcInN0eWxlXCI6e30sXCJzY2FsZVwiOntcInR5cGVcIjpcImxpbmVhclwiLFwibW9kZVwiOlwibm9ybWFsXCJ9LFwibGFiZWxzXCI6e1wic2hvd1wiOnRydWUsXCJyb3RhdGVcIjowLFwiZmlsdGVyXCI6ZmFsc2UsXCJ0cnVuY2F0ZVwiOjEwMH0sXCJ0aXRsZVwiOntcInRleHRcIjpcIkNvdW50XCJ9fV0sXCJzZXJpZXNQYXJhbXNcIjpbe1wic2hvd1wiOlwidHJ1ZVwiLFwidHlwZVwiOlwiaGlzdG9ncmFtXCIsXCJtb2RlXCI6XCJzdGFja2VkXCIsXCJkYXRhXCI6e1wibGFiZWxcIjpcIkNvdW50XCIsXCJpZFwiOlwiMVwifSxcInZhbHVlQXhpc1wiOlwiVmFsdWVBeGlzLTFcIixcImRyYXdMaW5lc0JldHdlZW5Qb2ludHNcIjp0cnVlLFwic2hvd0NpcmNsZXNcIjp0cnVlfV0sXCJhZGRUb29sdGlwXCI6dHJ1ZSxcImFkZExlZ2VuZFwiOnRydWUsXCJsZWdlbmRQb3NpdGlvblwiOlwicmlnaHRcIixcInRpbWVzXCI6W10sXCJhZGRUaW1lTWFya2VyXCI6ZmFsc2V9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiM1wiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJncm91cFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcInJ1bGUudHNjXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJjdXN0b21MYWJlbFwiOlwiXCJ9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS50c2NcIixcInNpemVcIjoxMCxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJjdXN0b21MYWJlbFwiOlwiVFNDIFJlcXVpcmVtZW50c1wifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLUFnZW50cy1UU0MtTGFzdC1hbGVydHMnLFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbicsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdMYXN0IGFsZXJ0cycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJMYXN0IGFsZXJ0c1wiLFwidHlwZVwiOlwidGFibGVcIixcInBhcmFtc1wiOntcInBlclBhZ2VcIjoxMCxcInNob3dQYXJ0aWFsUm93c1wiOmZhbHNlLFwic2hvd01ldGljc0F0QWxsTGV2ZWxzXCI6ZmFsc2UsXCJzb3J0XCI6e1wiY29sdW1uSW5kZXhcIjoyLFwiZGlyZWN0aW9uXCI6XCJkZXNjXCJ9LFwic2hvd1RvdGFsXCI6ZmFsc2UsXCJ0b3RhbEZ1bmNcIjpcInN1bVwifSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjNcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS50c2NcIixcIm90aGVyQnVja2V0XCI6ZmFsc2UsXCJvdGhlckJ1Y2tldExhYmVsXCI6XCJPdGhlclwiLFwibWlzc2luZ0J1Y2tldFwiOmZhbHNlLFwibWlzc2luZ0J1Y2tldExhYmVsXCI6XCJNaXNzaW5nXCIsXCJzaXplXCI6NTAsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwiLFwiY3VzdG9tTGFiZWxcIjpcIlJlcXVpcmVtZW50XCJ9fSx7XCJpZFwiOlwiNFwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJydWxlLmRlc2NyaXB0aW9uXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwic2l6ZVwiOjEwLFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcImN1c3RvbUxhYmVsXCI6XCJSdWxlIGRlc2NyaXB0aW9uXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOlxuICAgICAgICAne1widmlzXCI6e1wicGFyYW1zXCI6e1wic29ydFwiOntcImNvbHVtbkluZGV4XCI6MixcImRpcmVjdGlvblwiOlwiZGVzY1wifX19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH1cbl07XG4iXX0=