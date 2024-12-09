/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * This function collects statistics from a SearchSource and a response
 * for the usage in the inspector stats panel. Pass in a searchSource and a response
 * and the returned object can be passed to the `stats` method of the request
 * logger.
 */

import { i18n } from '@kbn/i18n';
import { SearchResponse } from 'elasticsearch';
import { ISearchSource } from 'src/plugins/data/public';
import { RequestStatistics } from 'src/plugins/inspector/common';

/** @public */
export function getRequestInspectorStats(searchSource: ISearchSource) {
  const stats: RequestStatistics = {};
  const index = searchSource.getField('index');

  if (index) {
    stats.indexPattern = {
      label: i18n.translate('data.search.searchSource.indexPatternLabel', {
        defaultMessage: '索引模式',
      }),
      value: index.title,
      description: i18n.translate('data.search.searchSource.indexPatternDescription', {
        defaultMessage: '连接到 Elasticsearch 索引的索引模式.',
      }),
    };
    stats.indexPatternId = {
      label: i18n.translate('data.search.searchSource.indexPatternIdLabel', {
        defaultMessage: '索引模式 ID',
      }),
      value: index.id!,
      description: i18n.translate('data.search.searchSource.indexPatternIdDescription', {
        defaultMessage: '{kibanaIndexPattern} 索引中的 ID.',
        values: { kibanaIndexPattern: '.kibana' },
      }),
    };
  }

  return stats;
}

/** @public */
export function getResponseInspectorStats(
  resp: SearchResponse<unknown>,
  searchSource?: ISearchSource
) {
  const lastRequest =
    searchSource?.history && searchSource.history[searchSource.history.length - 1];
  const stats: RequestStatistics = {};

  if (resp && resp.took) {
    stats.queryTime = {
      label: i18n.translate('data.search.searchSource.queryTimeLabel', {
        defaultMessage: '查询时间',
      }),
      value: i18n.translate('data.search.searchSource.queryTimeValue', {
        defaultMessage: '{queryTime}ms',
        values: { queryTime: resp.took },
      }),
      description: i18n.translate('data.search.searchSource.queryTimeDescription', {
        defaultMessage:
          '处理查询所花费的时间。不包括发送请求或在浏览器中解析它的时间',
      }),
    };
  }

  if (resp && resp.hits) {
    stats.hitsTotal = {
      label: i18n.translate('data.search.searchSource.hitsTotalLabel', {
        defaultMessage: '命中 (总计)',
      }),
      value: `${resp.hits.total}`,
      description: i18n.translate('data.search.searchSource.hitsTotalDescription', {
        defaultMessage: '匹配查询的文档数目.',
      }),
    };

    stats.hits = {
      label: i18n.translate('data.search.searchSource.hitsLabel', {
        defaultMessage: '命中',
      }),
      value: `${resp.hits.hits.length}`,
      description: i18n.translate('data.search.searchSource.hitsDescription', {
        defaultMessage: '查询返回的文档数目.',
      }),
    };
  }

  if (lastRequest && (lastRequest.ms === 0 || lastRequest.ms)) {
    stats.requestTime = {
      label: i18n.translate('data.search.searchSource.requestTimeLabel', {
        defaultMessage: '请求时间',
      }),
      value: i18n.translate('data.search.searchSource.requestTimeValue', {
        defaultMessage: '{requestTime}ms',
        values: { requestTime: lastRequest.ms },
      }),
      description: i18n.translate('data.search.searchSource.requestTimeDescription', {
        defaultMessage:
          '请求从浏览器到 Elasticsearch 以及返回的时间。不包括请求在队列中等候的时间.',
      }),
    };
  }

  return stats;
}
