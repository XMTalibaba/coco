"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*
 * Wazuh app - Module for Overview/Audit visualizations
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
  _id: 'Wazuh-App-Overview-Audit-Groups',
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
  _id: 'Wazuh-App-Overview-Audit-Agents',
  _source: {
    title: 'Agents',
    visState: '{"title":"Agents","type":"pie","params":{"type":"pie","addTooltip":true,"addLegend":true,"legendPosition":"right","isDonut":true},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"segment","params":{"field":"agent.name","size":5,"order":"desc","orderBy":"1"}}]}',
    uiStateJSON: '{}',
    description: '',
    version: 1,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"index":"wazuh-alerts","filter":[],"query":{"query":"","language":"lucene"}}'
    }
  },
  _type: 'visualization'
}, {
  _id: 'Wazuh-App-Overview-Audit-Commands',
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
  _id: 'Wazuh-App-Overview-Audit-Files',
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
  _id: 'Wazuh-App-Overview-Audit-Alerts-over-time',
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
  _id: 'Wazuh-App-Overview-Audit-Last-alerts',
  _type: 'visualization',
  _source: {
    title: 'Last alerts',
    visState: '{"title":"Last alerts","type":"table","params":{"perPage":10,"showPartialRows":false,"showMeticsAtAllLevels":false,"sort":{"columnIndex":3,"direction":"desc"},"showTotal":false,"totalFunc":"sum"},"aggs":[{"id":"1","enabled":true,"type":"count","schema":"metric","params":{}},{"id":"2","enabled":true,"type":"terms","schema":"bucket","params":{"field":"agent.name","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":50,"order":"desc","orderBy":"1","customLabel":"Agent"}},{"id":"3","enabled":true,"type":"terms","schema":"bucket","params":{"field":"rule.description","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":10,"order":"desc","orderBy":"1","customLabel":"Event"}},{"id":"4","enabled":true,"type":"terms","schema":"bucket","params":{"field":"data.audit.exe","otherBucket":false,"otherBucketLabel":"Other","missingBucket":false,"missingBucketLabel":"Missing","size":10,"order":"desc","orderBy":"1","customLabel":"Command"}}]}',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm92ZXJ2aWV3LWF1ZGl0LnRzIl0sIm5hbWVzIjpbIl9pZCIsIl9zb3VyY2UiLCJ0aXRsZSIsInZpc1N0YXRlIiwidWlTdGF0ZUpTT04iLCJkZXNjcmlwdGlvbiIsInZlcnNpb24iLCJraWJhbmFTYXZlZE9iamVjdE1ldGEiLCJzZWFyY2hTb3VyY2VKU09OIiwiX3R5cGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7ZUFXZSxDQUNiO0FBQ0VBLEVBQUFBLEdBQUcsRUFBRSxpQ0FEUDtBQUVFQyxFQUFBQSxPQUFPLEVBQUU7QUFDUEMsSUFBQUEsS0FBSyxFQUFFLFFBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLHVWQUhLO0FBSVBDLElBQUFBLFdBQVcsRUFBRSxJQUpOO0FBS1BDLElBQUFBLFdBQVcsRUFBRSxFQUxOO0FBTVBDLElBQUFBLE9BQU8sRUFBRSxDQU5GO0FBT1BDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVBoQixHQUZYO0FBY0VDLEVBQUFBLEtBQUssRUFBRTtBQWRULENBRGEsRUFpQmI7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLGlDQURQO0FBRUVDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsUUFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04sc1ZBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLElBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUNkO0FBRm1CO0FBUGhCLEdBRlg7QUFjRUMsRUFBQUEsS0FBSyxFQUFFO0FBZFQsQ0FqQmEsRUFpQ2I7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLG1DQURQO0FBRUVDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsVUFEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04sZ1dBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLElBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUNkO0FBRm1CO0FBUGhCLEdBRlg7QUFjRUMsRUFBQUEsS0FBSyxFQUFFO0FBZFQsQ0FqQ2EsRUFpRGI7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLGdDQURQO0FBRUVDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsT0FEQTtBQUVQQyxJQUFBQSxRQUFRLEVBQ04sK1ZBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUFFLElBSk47QUFLUEMsSUFBQUEsV0FBVyxFQUFFLEVBTE47QUFNUEMsSUFBQUEsT0FBTyxFQUFFLENBTkY7QUFPUEMsSUFBQUEscUJBQXFCLEVBQUU7QUFDckJDLE1BQUFBLGdCQUFnQixFQUNkO0FBRm1CO0FBUGhCLEdBRlg7QUFjRUMsRUFBQUEsS0FBSyxFQUFFO0FBZFQsQ0FqRGEsRUFpRWI7QUFDRVQsRUFBQUEsR0FBRyxFQUFFLDJDQURQO0FBRUVDLEVBQUFBLE9BQU8sRUFBRTtBQUNQQyxJQUFBQSxLQUFLLEVBQUUsa0JBREE7QUFFUEMsSUFBQUEsUUFBUSxFQUNOLGs5Q0FISztBQUlQQyxJQUFBQSxXQUFXLEVBQUUsSUFKTjtBQUtQQyxJQUFBQSxXQUFXLEVBQUUsRUFMTjtBQU1QQyxJQUFBQSxPQUFPLEVBQUUsQ0FORjtBQU9QQyxJQUFBQSxxQkFBcUIsRUFBRTtBQUNyQkMsTUFBQUEsZ0JBQWdCLEVBQ2Q7QUFGbUI7QUFQaEIsR0FGWDtBQWNFQyxFQUFBQSxLQUFLLEVBQUU7QUFkVCxDQWpFYSxFQWlGYjtBQUNFVCxFQUFBQSxHQUFHLEVBQUUsc0NBRFA7QUFFRVMsRUFBQUEsS0FBSyxFQUFFLGVBRlQ7QUFHRVIsRUFBQUEsT0FBTyxFQUFFO0FBQ1BDLElBQUFBLEtBQUssRUFBRSxhQURBO0FBRVBDLElBQUFBLFFBQVEsRUFDTixzaENBSEs7QUFJUEMsSUFBQUEsV0FBVyxFQUNULGtFQUxLO0FBTVBDLElBQUFBLFdBQVcsRUFBRSxFQU5OO0FBT1BDLElBQUFBLE9BQU8sRUFBRSxDQVBGO0FBUVBDLElBQUFBLHFCQUFxQixFQUFFO0FBQ3JCQyxNQUFBQSxnQkFBZ0IsRUFDZDtBQUZtQjtBQVJoQjtBQUhYLENBakZhLEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogV2F6dWggYXBwIC0gTW9kdWxlIGZvciBPdmVydmlldy9BdWRpdCB2aXN1YWxpemF0aW9uc1xuICogQ29weXJpZ2h0IChDKSAyMDE1LTIwMjEgV2F6dWgsIEluYy5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTsgeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbiAqIHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb247IGVpdGhlciB2ZXJzaW9uIDIgb2YgdGhlIExpY2Vuc2UsIG9yXG4gKiAoYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIEZpbmQgbW9yZSBpbmZvcm1hdGlvbiBhYm91dCB0aGlzIG9uIHRoZSBMSUNFTlNFIGZpbGUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IFtcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1BdWRpdC1Hcm91cHMnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnR3JvdXBzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkdyb3Vwc1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWV9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS5ncm91cHNcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1BdWRpdC1BZ2VudHMnLFxuICAgIF9zb3VyY2U6IHtcbiAgICAgIHRpdGxlOiAnQWdlbnRzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkFnZW50c1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWV9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiYWdlbnQubmFtZVwiLFwic2l6ZVwiOjUsXCJvcmRlclwiOlwiZGVzY1wiLFwib3JkZXJCeVwiOlwiMVwifX1dfScsXG4gICAgICB1aVN0YXRlSlNPTjogJ3t9JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyxcbiAgICAgIHZlcnNpb246IDEsXG4gICAgICBraWJhbmFTYXZlZE9iamVjdE1ldGE6IHtcbiAgICAgICAgc2VhcmNoU291cmNlSlNPTjpcbiAgICAgICAgICAne1wiaW5kZXhcIjpcIndhenVoLWFsZXJ0c1wiLFwiZmlsdGVyXCI6W10sXCJxdWVyeVwiOntcInF1ZXJ5XCI6XCJcIixcImxhbmd1YWdlXCI6XCJsdWNlbmVcIn19J1xuICAgICAgfVxuICAgIH0sXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJ1xuICB9LFxuICB7XG4gICAgX2lkOiAnV2F6dWgtQXBwLU92ZXJ2aWV3LUF1ZGl0LUNvbW1hbmRzJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0NvbW1hbmRzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkNvbW1hbmRzXCIsXCJ0eXBlXCI6XCJwaWVcIixcInBhcmFtc1wiOntcInR5cGVcIjpcInBpZVwiLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJpc0RvbnV0XCI6dHJ1ZX0sXCJhZ2dzXCI6W3tcImlkXCI6XCIxXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcImNvdW50XCIsXCJzY2hlbWFcIjpcIm1ldHJpY1wiLFwicGFyYW1zXCI6e319LHtcImlkXCI6XCIyXCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcInNlZ21lbnRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJkYXRhLmF1ZGl0LmNvbW1hbmRcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1BdWRpdC1GaWxlcycsXG4gICAgX3NvdXJjZToge1xuICAgICAgdGl0bGU6ICdGaWxlcycsXG4gICAgICB2aXNTdGF0ZTpcbiAgICAgICAgJ3tcInRpdGxlXCI6XCJGaWxlc1wiLFwidHlwZVwiOlwicGllXCIsXCJwYXJhbXNcIjp7XCJ0eXBlXCI6XCJwaWVcIixcImFkZFRvb2x0aXBcIjp0cnVlLFwiYWRkTGVnZW5kXCI6dHJ1ZSxcImxlZ2VuZFBvc2l0aW9uXCI6XCJyaWdodFwiLFwiaXNEb251dFwiOnRydWV9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJzZWdtZW50XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwiZGF0YS5hdWRpdC5maWxlLm5hbWVcIixcInNpemVcIjo1LFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIn19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1BdWRpdC1BbGVydHMtb3Zlci10aW1lJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0FsZXJ0cyBvdmVyIHRpbWUnLFxuICAgICAgdmlzU3RhdGU6XG4gICAgICAgICd7XCJ0aXRsZVwiOlwiQWxlcnRzIG92ZXIgdGltZVwiLFwidHlwZVwiOlwiYXJlYVwiLFwicGFyYW1zXCI6e1widHlwZVwiOlwiYXJlYVwiLFwiZ3JpZFwiOntcImNhdGVnb3J5TGluZXNcIjp0cnVlLFwic3R5bGVcIjp7XCJjb2xvclwiOlwiI2VlZVwifSxcInZhbHVlQXhpc1wiOlwiVmFsdWVBeGlzLTFcIn0sXCJjYXRlZ29yeUF4ZXNcIjpbe1wiaWRcIjpcIkNhdGVnb3J5QXhpcy0xXCIsXCJ0eXBlXCI6XCJjYXRlZ29yeVwiLFwicG9zaXRpb25cIjpcImJvdHRvbVwiLFwic2hvd1wiOnRydWUsXCJzdHlsZVwiOnt9LFwic2NhbGVcIjp7XCJ0eXBlXCI6XCJsaW5lYXJcIn0sXCJsYWJlbHNcIjp7XCJzaG93XCI6dHJ1ZSxcInRydW5jYXRlXCI6MTAwfSxcInRpdGxlXCI6e319XSxcInZhbHVlQXhlc1wiOlt7XCJpZFwiOlwiVmFsdWVBeGlzLTFcIixcIm5hbWVcIjpcIkxlZnRBeGlzLTFcIixcInR5cGVcIjpcInZhbHVlXCIsXCJwb3NpdGlvblwiOlwibGVmdFwiLFwic2hvd1wiOnRydWUsXCJzdHlsZVwiOnt9LFwic2NhbGVcIjp7XCJ0eXBlXCI6XCJsaW5lYXJcIixcIm1vZGVcIjpcIm5vcm1hbFwifSxcImxhYmVsc1wiOntcInNob3dcIjp0cnVlLFwicm90YXRlXCI6MCxcImZpbHRlclwiOmZhbHNlLFwidHJ1bmNhdGVcIjoxMDB9LFwidGl0bGVcIjp7XCJ0ZXh0XCI6XCJDb3VudFwifX1dLFwic2VyaWVzUGFyYW1zXCI6W3tcInNob3dcIjpcInRydWVcIixcInR5cGVcIjpcImFyZWFcIixcIm1vZGVcIjpcInN0YWNrZWRcIixcImRhdGFcIjp7XCJsYWJlbFwiOlwiQ291bnRcIixcImlkXCI6XCIxXCJ9LFwiZHJhd0xpbmVzQmV0d2VlblBvaW50c1wiOnRydWUsXCJzaG93Q2lyY2xlc1wiOnRydWUsXCJpbnRlcnBvbGF0ZVwiOlwiY2FyZGluYWxcIixcInZhbHVlQXhpc1wiOlwiVmFsdWVBeGlzLTFcIn1dLFwiYWRkVG9vbHRpcFwiOnRydWUsXCJhZGRMZWdlbmRcIjp0cnVlLFwibGVnZW5kUG9zaXRpb25cIjpcInJpZ2h0XCIsXCJ0aW1lc1wiOltdLFwiYWRkVGltZU1hcmtlclwiOmZhbHNlfSxcImFnZ3NcIjpbe1wiaWRcIjpcIjFcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiY291bnRcIixcInNjaGVtYVwiOlwibWV0cmljXCIsXCJwYXJhbXNcIjp7fX0se1wiaWRcIjpcIjNcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiZ3JvdXBcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJydWxlLmRlc2NyaXB0aW9uXCIsXCJzaXplXCI6NSxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wifX0se1wiaWRcIjpcIjJcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwiZGF0ZV9oaXN0b2dyYW1cIixcInNjaGVtYVwiOlwic2VnbWVudFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcInRpbWVzdGFtcFwiLFwidGltZVJhbmdlXCI6e1wiZnJvbVwiOlwibm93LTFoXCIsXCJ0b1wiOlwibm93XCIsXCJtb2RlXCI6XCJxdWlja1wifSxcInVzZU5vcm1hbGl6ZWRFc0ludGVydmFsXCI6dHJ1ZSxcImludGVydmFsXCI6XCJhdXRvXCIsXCJ0aW1lX3pvbmVcIjpcIkV1cm9wZS9CZXJsaW5cIixcImRyb3BfcGFydGlhbHNcIjpmYWxzZSxcImN1c3RvbUludGVydmFsXCI6XCIyaFwiLFwibWluX2RvY19jb3VudFwiOjEsXCJleHRlbmRlZF9ib3VuZHNcIjp7fX19XX0nLFxuICAgICAgdWlTdGF0ZUpTT046ICd7fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9LFxuICAgIF90eXBlOiAndmlzdWFsaXphdGlvbidcbiAgfSxcbiAge1xuICAgIF9pZDogJ1dhenVoLUFwcC1PdmVydmlldy1BdWRpdC1MYXN0LWFsZXJ0cycsXG4gICAgX3R5cGU6ICd2aXN1YWxpemF0aW9uJyxcbiAgICBfc291cmNlOiB7XG4gICAgICB0aXRsZTogJ0xhc3QgYWxlcnRzJyxcbiAgICAgIHZpc1N0YXRlOlxuICAgICAgICAne1widGl0bGVcIjpcIkxhc3QgYWxlcnRzXCIsXCJ0eXBlXCI6XCJ0YWJsZVwiLFwicGFyYW1zXCI6e1wicGVyUGFnZVwiOjEwLFwic2hvd1BhcnRpYWxSb3dzXCI6ZmFsc2UsXCJzaG93TWV0aWNzQXRBbGxMZXZlbHNcIjpmYWxzZSxcInNvcnRcIjp7XCJjb2x1bW5JbmRleFwiOjMsXCJkaXJlY3Rpb25cIjpcImRlc2NcIn0sXCJzaG93VG90YWxcIjpmYWxzZSxcInRvdGFsRnVuY1wiOlwic3VtXCJ9LFwiYWdnc1wiOlt7XCJpZFwiOlwiMVwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJjb3VudFwiLFwic2NoZW1hXCI6XCJtZXRyaWNcIixcInBhcmFtc1wiOnt9fSx7XCJpZFwiOlwiMlwiLFwiZW5hYmxlZFwiOnRydWUsXCJ0eXBlXCI6XCJ0ZXJtc1wiLFwic2NoZW1hXCI6XCJidWNrZXRcIixcInBhcmFtc1wiOntcImZpZWxkXCI6XCJhZ2VudC5uYW1lXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwic2l6ZVwiOjUwLFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcImN1c3RvbUxhYmVsXCI6XCJBZ2VudFwifX0se1wiaWRcIjpcIjNcIixcImVuYWJsZWRcIjp0cnVlLFwidHlwZVwiOlwidGVybXNcIixcInNjaGVtYVwiOlwiYnVja2V0XCIsXCJwYXJhbXNcIjp7XCJmaWVsZFwiOlwicnVsZS5kZXNjcmlwdGlvblwiLFwib3RoZXJCdWNrZXRcIjpmYWxzZSxcIm90aGVyQnVja2V0TGFiZWxcIjpcIk90aGVyXCIsXCJtaXNzaW5nQnVja2V0XCI6ZmFsc2UsXCJtaXNzaW5nQnVja2V0TGFiZWxcIjpcIk1pc3NpbmdcIixcInNpemVcIjoxMCxcIm9yZGVyXCI6XCJkZXNjXCIsXCJvcmRlckJ5XCI6XCIxXCIsXCJjdXN0b21MYWJlbFwiOlwiRXZlbnRcIn19LHtcImlkXCI6XCI0XCIsXCJlbmFibGVkXCI6dHJ1ZSxcInR5cGVcIjpcInRlcm1zXCIsXCJzY2hlbWFcIjpcImJ1Y2tldFwiLFwicGFyYW1zXCI6e1wiZmllbGRcIjpcImRhdGEuYXVkaXQuZXhlXCIsXCJvdGhlckJ1Y2tldFwiOmZhbHNlLFwib3RoZXJCdWNrZXRMYWJlbFwiOlwiT3RoZXJcIixcIm1pc3NpbmdCdWNrZXRcIjpmYWxzZSxcIm1pc3NpbmdCdWNrZXRMYWJlbFwiOlwiTWlzc2luZ1wiLFwic2l6ZVwiOjEwLFwib3JkZXJcIjpcImRlc2NcIixcIm9yZGVyQnlcIjpcIjFcIixcImN1c3RvbUxhYmVsXCI6XCJDb21tYW5kXCJ9fV19JyxcbiAgICAgIHVpU3RhdGVKU09OOlxuICAgICAgICAne1widmlzXCI6e1wicGFyYW1zXCI6e1wic29ydFwiOntcImNvbHVtbkluZGV4XCI6MyxcImRpcmVjdGlvblwiOlwiZGVzY1wifX19fScsXG4gICAgICBkZXNjcmlwdGlvbjogJycsXG4gICAgICB2ZXJzaW9uOiAxLFxuICAgICAga2liYW5hU2F2ZWRPYmplY3RNZXRhOiB7XG4gICAgICAgIHNlYXJjaFNvdXJjZUpTT046XG4gICAgICAgICAgJ3tcImluZGV4XCI6XCJ3YXp1aC1hbGVydHNcIixcImZpbHRlclwiOltdLFwicXVlcnlcIjp7XCJxdWVyeVwiOlwiXCIsXCJsYW5ndWFnZVwiOlwibHVjZW5lXCJ9fSdcbiAgICAgIH1cbiAgICB9XG4gIH1cbl07XG4iXX0=