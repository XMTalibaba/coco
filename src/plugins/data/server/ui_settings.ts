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

import { i18n } from '@kbn/i18n';
import { schema } from '@kbn/config-schema';
import { UiSettingsParams } from 'kibana/server';
// @ts-ignore untyped module
import numeralLanguages from '@elastic/numeral/languages';
import { DEFAULT_QUERY_LANGUAGE, UI_SETTINGS } from '../common';

const luceneQueryLanguageLabel = i18n.translate('data.advancedSettings.searchQueryLanguageLucene', {
  defaultMessage: 'Lucene',
});

const queryLanguageSettingName = i18n.translate('data.advancedSettings.searchQueryLanguageTitle', {
  defaultMessage: '查询语言',
});

const requestPreferenceOptionLabels = {
  sessionId: i18n.translate('data.advancedSettings.courier.requestPreferenceSessionId', {
    defaultMessage: '会话 ID',
  }),
  custom: i18n.translate('data.advancedSettings.courier.requestPreferenceCustom', {
    defaultMessage: '定制',
  }),
  none: i18n.translate('data.advancedSettings.courier.requestPreferenceNone', {
    defaultMessage: '无',
  }),
};

// We add the `en` key manually here, since that's not a real numeral locale, but the
// default fallback in case the locale is not found.
const numeralLanguageIds = [
  'en',
  ...numeralLanguages.map((numeralLanguage: any) => {
    return numeralLanguage.id;
  }),
];

export function getUiSettings(): Record<string, UiSettingsParams<unknown>> {
  return {
    [UI_SETTINGS.META_FIELDS]: {
      name: i18n.translate('data.advancedSettings.metaFieldsTitle', {
        defaultMessage: '元字段',
      }),
      value: ['_source', '_id', '_type', '_index', '_score'],
      description: i18n.translate('data.advancedSettings.metaFieldsText', {
        defaultMessage: '_source 之外存在的、在显示我们的文档时将合并进其中的字段',
      }),
      schema: schema.arrayOf(schema.string()),
    },
    [UI_SETTINGS.DOC_HIGHLIGHT]: {
      name: i18n.translate('data.advancedSettings.docTableHighlightTitle', {
        defaultMessage: '突出显示结果',
      }),
      value: true,
      description: i18n.translate('data.advancedSettings.docTableHighlightText', {
        defaultMessage:
          '在 Discover 和已保存搜索仪表板中突出显示结果。处理大文档时，突出显示会使请求变慢。',
      }),
      category: ['discover'],
      schema: schema.boolean(),
    },
    [UI_SETTINGS.QUERY_STRING_OPTIONS]: {
      name: i18n.translate('data.advancedSettings.query.queryStringOptionsTitle', {
        defaultMessage: '查询字符串选项',
      }),
      value: '{ "analyze_wildcard": true }',
      description: i18n.translate('data.advancedSettings.query.queryStringOptionsText', {
        defaultMessage:
          'Lucene 查询字符串解析器的{optionsLink}。仅在将“{queryLanguage}”设置为 {luceneLanguage} 时使用。',
        description:
          'Part of composite text: data.advancedSettings.query.queryStringOptions.optionsLinkText + ' +
          'data.advancedSettings.query.queryStringOptionsText',
        values: {
          optionsLink:
            '<a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html" target="_blank" rel="noopener">' +
            i18n.translate('data.advancedSettings.query.queryStringOptions.optionsLinkText', {
              defaultMessage: '选项',
            }) +
            '</a>',
          luceneLanguage: luceneQueryLanguageLabel,
          queryLanguage: queryLanguageSettingName,
        },
      }),
      type: 'json',
      schema: schema.object({
        analyze_wildcard: schema.boolean(),
      }),
    },
    [UI_SETTINGS.QUERY_ALLOW_LEADING_WILDCARDS]: {
      name: i18n.translate('data.advancedSettings.query.allowWildcardsTitle', {
        defaultMessage: '在查询中允许前导通配符',
      }),
      value: true,
      description: i18n.translate('data.advancedSettings.query.allowWildcardsText', {
        defaultMessage:
          '设置后，将允许 * 用作查询语句的第一个字符。当前仅在查询栏中启用实验性查询功能时才会应用。要在基本 Lucene 查询中禁用前导通配符，请使用 {queryStringOptionsPattern}。',
        values: {
          queryStringOptionsPattern: UI_SETTINGS.QUERY_STRING_OPTIONS,
        },
      }),
      schema: schema.boolean(),
    },
    [UI_SETTINGS.SEARCH_QUERY_LANGUAGE]: {
      name: queryLanguageSettingName,
      value: DEFAULT_QUERY_LANGUAGE,
      description: i18n.translate('data.advancedSettings.searchQueryLanguageText', {
        defaultMessage: '查询栏使用的查询语言。KQL 是专为 Kibana 打造的新型语言。',
      }),
      type: 'select',
      options: ['lucene', 'kuery'],
      optionLabels: {
        lucene: luceneQueryLanguageLabel,
        kuery: i18n.translate('data.advancedSettings.searchQueryLanguageKql', {
          defaultMessage: 'KQL',
        }),
      },
      schema: schema.string(),
    },
    [UI_SETTINGS.SORT_OPTIONS]: {
      name: i18n.translate('data.advancedSettings.sortOptionsTitle', {
        defaultMessage: '排序选项',
      }),
      value: '{ "unmapped_type": "boolean" }',
      description: i18n.translate('data.advancedSettings.sortOptionsText', {
        defaultMessage: 'Elasticsearch 排序参数的{optionsLink}',
        description:
          'Part of composite text: data.advancedSettings.sortOptions.optionsLinkText + ' +
          'data.advancedSettings.sortOptionsText',
        values: {
          optionsLink:
            '<a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-sort.html" target="_blank" rel="noopener">' +
            i18n.translate('data.advancedSettings.sortOptions.optionsLinkText', {
              defaultMessage: '选项',
            }) +
            '</a>',
        },
      }),
      type: 'json',
      schema: schema.object({
        unmapped_type: schema.string(),
      }),
    },
    defaultIndex: {
      name: i18n.translate('data.advancedSettings.defaultIndexTitle', {
        defaultMessage: '默认索引',
      }),
      value: null,
      type: 'string',
      description: i18n.translate('data.advancedSettings.defaultIndexText', {
        defaultMessage: '未设置索引时要访问的索引',
      }),
      schema: schema.nullable(schema.string()),
    },
    [UI_SETTINGS.COURIER_IGNORE_FILTER_IF_FIELD_NOT_IN_INDEX]: {
      name: i18n.translate('data.advancedSettings.courier.ignoreFilterTitle', {
        defaultMessage: '忽略筛选',
      }),
      value: false,
      description: i18n.translate('data.advancedSettings.courier.ignoreFilterText', {
        defaultMessage:
          '此配置增强对包含可视化的仪表板访问不同索引的支持。禁用时，将向所有可视化应用所有筛选。启用时，如果可视化的索引不包含筛选字段，则会为该可视化忽略筛选。',
      }),
      category: ['search'],
      schema: schema.boolean(),
    },
    [UI_SETTINGS.COURIER_SET_REQUEST_PREFERENCE]: {
      name: i18n.translate('data.advancedSettings.courier.requestPreferenceTitle', {
        defaultMessage: '请求首选项',
      }),
      value: 'sessionId',
      options: ['sessionId', 'custom', 'none'],
      optionLabels: requestPreferenceOptionLabels,
      type: 'select',
      description: i18n.translate('data.advancedSettings.courier.requestPreferenceText', {
        defaultMessage: `允许您设置用于处理搜索请求的分片。<ul>\n            <li><strong>{sessionId}</strong>：限制操作在相同分片上执行所有搜索请求。\n              这有利于在各个请求之间复用分片缓存。</li>\n            <li><strong>{custom}</strong>：允许您定义自己的首选项。\n              使用 'courier:customRequestPreference' 定制首选项值。</li>\n            <li><strong>{none}</strong>：表示不设置首选项。\n              这可能会提供更佳的性能，因为请求可以在所有分片副本上进行分配。\n              不过，结果可能会不一致，因为不同的分片可能处于不同的刷新状态。</li>\n          </ul>`,
        values: {
          sessionId: requestPreferenceOptionLabels.sessionId,
          custom: requestPreferenceOptionLabels.custom,
          none: requestPreferenceOptionLabels.none,
        },
      }),
      category: ['search'],
      schema: schema.string(),
    },
    [UI_SETTINGS.COURIER_CUSTOM_REQUEST_PREFERENCE]: {
      name: i18n.translate('data.advancedSettings.courier.customRequestPreferenceTitle', {
        defaultMessage: '定制请求首选项',
      }),
      value: '_local',
      type: 'string',
      description: i18n.translate('data.advancedSettings.courier.customRequestPreferenceText', {
        defaultMessage:
          '将“{setRequestReferenceSetting}”设置为“{customSettingValue}”时，将使用“{requestPreferenceLink}”。',
        description:
          'Part of composite text: data.advancedSettings.courier.customRequestPreference.requestPreferenceLinkText + ' +
          'data.advancedSettings.courier.customRequestPreferenceText',
        values: {
          setRequestReferenceSetting: `<strong>${UI_SETTINGS.COURIER_SET_REQUEST_PREFERENCE}</strong>`,
          customSettingValue: '"custom"',
          requestPreferenceLink:
            '<a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-preference.html" target="_blank" rel="noopener">' +
            i18n.translate(
              'data.advancedSettings.courier.customRequestPreference.requestPreferenceLinkText',
              {
                defaultMessage: '请求首选项',
              }
            ) +
            '</a>',
        },
      }),
      category: ['search'],
      schema: schema.string(),
    },
    [UI_SETTINGS.COURIER_MAX_CONCURRENT_SHARD_REQUESTS]: {
      name: i18n.translate('data.advancedSettings.courier.maxRequestsTitle', {
        defaultMessage: '最大并发分片请求数',
      }),
      value: 0,
      type: 'number',
      description: i18n.translate('data.advancedSettings.courier.maxRequestsText', {
        defaultMessage:
          '控制用于 Kibana 发送的 _msearch 请求的“{maxRequestsLink}”设置。设置为 0 可禁用此配置并使用 Elasticsearch 默认值。',
        values: {
          maxRequestsLink: `<a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/search-multi-search.html"
            target="_blank" rel="noopener" >max_concurrent_shard_requests</a>`,
        },
      }),
      category: ['search'],
      schema: schema.number(),
    },
    [UI_SETTINGS.COURIER_BATCH_SEARCHES]: {
      name: i18n.translate('data.advancedSettings.courier.batchSearchesTitle', {
        defaultMessage: '批量并发搜索',
      }),
      value: false,
      type: 'boolean',
      description: i18n.translate('data.advancedSettings.courier.batchSearchesText', {
        defaultMessage: `禁用时，仪表板面板将分别加载，用户离开时或更新查询时，\n           搜索请求将终止。如果启用，加载所有数据时，仪表板面板将一起加载，并且\n           搜索将不会终止。`,
      }),
      deprecation: {
        message: i18n.translate('data.advancedSettings.courier.batchSearchesTextDeprecation', {
          defaultMessage: '此设置已过时，将在 Kibana 8.0 中移除。',
        }),
        docLinksKey: 'kibanaSearchSettings',
      },
      category: ['search'],
      schema: schema.boolean(),
    },
    [UI_SETTINGS.SEARCH_INCLUDE_FROZEN]: {
      name: 'Search in frozen indices',
      description: `Will include <a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/frozen-indices.html"
        target="_blank" rel="noopener">frozen indices</a> in results if enabled. Searching through frozen indices
        might increase the search time.`,
      value: false,
      category: ['search'],
      schema: schema.boolean(),
    },
    [UI_SETTINGS.HISTOGRAM_BAR_TARGET]: {
      name: i18n.translate('data.advancedSettings.histogram.barTargetTitle', {
        defaultMessage: '目标条形数',
      }),
      value: 50,
      description: i18n.translate('data.advancedSettings.histogram.barTargetText', {
        defaultMessage: '在日期直方图中使用“auto”时尝试生成大约此数目的条形',
      }),
      schema: schema.number(),
    },
    [UI_SETTINGS.HISTOGRAM_MAX_BARS]: {
      name: i18n.translate('data.advancedSettings.histogram.maxBarsTitle', {
        defaultMessage: '最大条形数',
      }),
      value: 100,
      description: i18n.translate('data.advancedSettings.histogram.maxBarsText', {
        defaultMessage: '在日期直方图中不要显示超过该数目的条形，需要时显示刻度值',
      }),
      schema: schema.number(),
    },
    [UI_SETTINGS.HISTORY_LIMIT]: {
      name: i18n.translate('data.advancedSettings.historyLimitTitle', {
        defaultMessage: '历史记录限制',
      }),
      value: 10,
      description: i18n.translate('data.advancedSettings.historyLimitText', {
        defaultMessage: '在具有历史记录（例如查询输入）的字段中，显示此数目的最近值',
      }),
      schema: schema.number(),
    },
    [UI_SETTINGS.SHORT_DOTS_ENABLE]: {
      name: i18n.translate('data.advancedSettings.shortenFieldsTitle', {
        defaultMessage: '缩短字段',
      }),
      value: false,
      description: i18n.translate('data.advancedSettings.shortenFieldsText', {
        defaultMessage: '缩短长字段，例如，不显示 foo.bar.baz，而显示 f.b.baz',
      }),
      schema: schema.boolean(),
    },
    [UI_SETTINGS.FORMAT_DEFAULT_TYPE_MAP]: {
      name: i18n.translate('data.advancedSettings.format.defaultTypeMapTitle', {
        defaultMessage: '字段类型格式名称',
      }),
      value: `{
  "ip": { "id": "ip", "params": {} },
  "date": { "id": "date", "params": {} },
  "date_nanos": { "id": "date_nanos", "params": {}, "es": true },
  "number": { "id": "number", "params": {} },
  "boolean": { "id": "boolean", "params": {} },
  "_source": { "id": "_source", "params": {} },
  "_default_": { "id": "string", "params": {} }
}`,
      type: 'json',
      description: i18n.translate('data.advancedSettings.format.defaultTypeMapText', {
        defaultMessage:
          '要默认用于每个字段类型的格式名称的映射。如果未显式提及字段类型，则将使用{defaultFormat}',
        values: {
          defaultFormat: '"_default_"',
        },
      }),
      schema: schema.object({
        ip: schema.object({
          id: schema.string(),
          params: schema.object({}),
        }),
        date: schema.object({
          id: schema.string(),
          params: schema.object({}),
        }),
        date_nanos: schema.object({
          id: schema.string(),
          params: schema.object({}),
          es: schema.boolean(),
        }),
        number: schema.object({
          id: schema.string(),
          params: schema.object({}),
        }),
        boolean: schema.object({
          id: schema.string(),
          params: schema.object({}),
        }),
        _source: schema.object({
          id: schema.string(),
          params: schema.object({}),
        }),
        _default_: schema.object({
          id: schema.string(),
          params: schema.object({}),
        }),
      }),
    },
    [UI_SETTINGS.FORMAT_NUMBER_DEFAULT_PATTERN]: {
      name: i18n.translate('data.advancedSettings.format.numberFormatTitle', {
        defaultMessage: '数字格式',
      }),
      value: '0,0.[000]',
      type: 'string',
      description: i18n.translate('data.advancedSettings.format.numberFormatText', {
        defaultMessage: '“数字”格式的默认{numeralFormatLink}',
        description:
          'Part of composite text: data.advancedSettings.format.numberFormatText + ' +
          'data.advancedSettings.format.numberFormat.numeralFormatLinkText',
        values: {
          numeralFormatLink:
            '<a href="http://numeraljs.com/" target="_blank" rel="noopener noreferrer">' +
            i18n.translate('data.advancedSettings.format.numberFormat.numeralFormatLinkText', {
              defaultMessage: '数值格式',
            }) +
            '</a>',
        },
      }),
      schema: schema.string(),
    },
    [UI_SETTINGS.FORMAT_PERCENT_DEFAULT_PATTERN]: {
      name: i18n.translate('data.advancedSettings.format.percentFormatTitle', {
        defaultMessage: '百分比格式',
      }),
      value: '0,0.[000]%',
      type: 'string',
      description: i18n.translate('data.advancedSettings.format.percentFormatText', {
        defaultMessage: '“百分比”格式的默认{numeralFormatLink}',
        description:
          'Part of composite text: data.advancedSettings.format.percentFormatText + ' +
          'data.advancedSettings.format.percentFormat.numeralFormatLinkText',
        values: {
          numeralFormatLink:
            '<a href="http://numeraljs.com/" target="_blank" rel="noopener noreferrer">' +
            i18n.translate('data.advancedSettings.format.percentFormat.numeralFormatLinkText', {
              defaultMessage: '数值格式',
            }) +
            '</a>',
        },
      }),
      schema: schema.string(),
    },
    [UI_SETTINGS.FORMAT_BYTES_DEFAULT_PATTERN]: {
      name: i18n.translate('data.advancedSettings.format.bytesFormatTitle', {
        defaultMessage: '字节格式',
      }),
      value: '0,0.[0]b',
      type: 'string',
      description: i18n.translate('data.advancedSettings.format.bytesFormatText', {
        defaultMessage: '“字节”格式的默认{numeralFormatLink}',
        description:
          'Part of composite text: data.advancedSettings.format.bytesFormatText + ' +
          'data.advancedSettings.format.bytesFormat.numeralFormatLinkText',
        values: {
          numeralFormatLink:
            '<a href="http://numeraljs.com/" target="_blank" rel="noopener noreferrer">' +
            i18n.translate('data.advancedSettings.format.bytesFormat.numeralFormatLinkText', {
              defaultMessage: '数值格式',
            }) +
            '</a>',
        },
      }),
      schema: schema.string(),
    },
    [UI_SETTINGS.FORMAT_CURRENCY_DEFAULT_PATTERN]: {
      name: i18n.translate('data.advancedSettings.format.currencyFormatTitle', {
        defaultMessage: '货币格式',
      }),
      value: '($0,0.[00])',
      type: 'string',
      description: i18n.translate('data.advancedSettings.format.currencyFormatText', {
        defaultMessage: '“货币”格式的默认{numeralFormatLink}',
        description:
          'Part of composite text: data.advancedSettings.format.currencyFormatText + ' +
          'data.advancedSettings.format.currencyFormat.numeralFormatLinkText',
        values: {
          numeralFormatLink:
            '<a href="http://numeraljs.com/" target="_blank" rel="noopener noreferrer">' +
            i18n.translate('data.advancedSettings.format.currencyFormat.numeralFormatLinkText', {
              defaultMessage: '数值格式',
            }) +
            '</a>',
        },
      }),
      schema: schema.string(),
    },
    [UI_SETTINGS.FORMAT_NUMBER_DEFAULT_LOCALE]: {
      name: i18n.translate('data.advancedSettings.format.formattingLocaleTitle', {
        defaultMessage: '格式区域设置',
      }),
      value: 'en',
      type: 'select',
      options: numeralLanguageIds,
      optionLabels: Object.fromEntries(
        numeralLanguages.map((language: Record<string, any>) => [language.id, language.name])
      ),
      description: i18n.translate('data.advancedSettings.format.formattingLocaleText', {
        defaultMessage: `{numeralLanguageLink}区域设置`,
        description:
          'Part of composite text: data.advancedSettings.format.formattingLocale.numeralLanguageLinkText + ' +
          'data.advancedSettings.format.formattingLocaleText',
        values: {
          numeralLanguageLink:
            '<a href="http://numeraljs.com/" target="_blank" rel="noopener noreferrer">' +
            i18n.translate(
              'data.advancedSettings.format.formattingLocale.numeralLanguageLinkText',
              {
                defaultMessage: '数值语言',
              }
            ) +
            '</a>',
        },
      }),
      schema: schema.string(),
    },
    [UI_SETTINGS.TIMEPICKER_REFRESH_INTERVAL_DEFAULTS]: {
      name: i18n.translate('data.advancedSettings.timepicker.refreshIntervalDefaultsTitle', {
        defaultMessage: '时间筛选刷新时间间隔',
      }),
      value: `{
  "pause": false,
  "value": 0
}`,
      type: 'json',
      description: i18n.translate('data.advancedSettings.timepicker.refreshIntervalDefaultsText', {
        defaultMessage: `时间筛选的默认刷新时间间隔。需要使用毫秒单位指定“值”。`,
      }),
      requiresPageReload: true,
      schema: schema.object({
        pause: schema.boolean(),
        value: schema.number(),
      }),
    },
    [UI_SETTINGS.TIMEPICKER_TIME_DEFAULTS]: {
      name: i18n.translate('data.advancedSettings.timepicker.timeDefaultsTitle', {
        defaultMessage: '时间筛选默认值',
      }),
      value: `{
  "from": "now-15m",
  "to": "now"
}`,
      type: 'json',
      description: i18n.translate('data.advancedSettings.timepicker.timeDefaultsText', {
        defaultMessage: '要在 Kibana 启动时使用的时间筛选选项（如果未使用时间筛选选项）',
      }),
      requiresPageReload: true,
      schema: schema.object({
        from: schema.string(),
        to: schema.string(),
      }),
    },
    [UI_SETTINGS.TIMEPICKER_QUICK_RANGES]: {
      name: i18n.translate('data.advancedSettings.timepicker.quickRangesTitle', {
        defaultMessage: '时间筛选速选范围',
      }),
      value: JSON.stringify(
        [
          {
            from: 'now/d',
            to: 'now/d',
            display: i18n.translate('data.advancedSettings.timepicker.today', {
              defaultMessage: '今日',
            }),
          },
          {
            from: 'now/w',
            to: 'now/w',
            display: i18n.translate('data.advancedSettings.timepicker.thisWeek', {
              defaultMessage: '本周',
            }),
          },
          {
            from: 'now-15m',
            to: 'now',
            display: i18n.translate('data.advancedSettings.timepicker.last15Minutes', {
              defaultMessage: '过去 15 分钟',
            }),
          },
          {
            from: 'now-30m',
            to: 'now',
            display: i18n.translate('data.advancedSettings.timepicker.last30Minutes', {
              defaultMessage: '过去 30 分钟',
            }),
          },
          {
            from: 'now-1h',
            to: 'now',
            display: i18n.translate('data.advancedSettings.timepicker.last1Hour', {
              defaultMessage: '过去 1 小时',
            }),
          },
          {
            from: 'now-24h',
            to: 'now',
            display: i18n.translate('data.advancedSettings.timepicker.last24Hours', {
              defaultMessage: '过去 24 小时',
            }),
          },
          {
            from: 'now-7d',
            to: 'now',
            display: i18n.translate('data.advancedSettings.timepicker.last7Days', {
              defaultMessage: '过去 7 天',
            }),
          },
          {
            from: 'now-30d',
            to: 'now',
            display: i18n.translate('data.advancedSettings.timepicker.last30Days', {
              defaultMessage: '过去 30 天',
            }),
          },
          {
            from: 'now-90d',
            to: 'now',
            display: i18n.translate('data.advancedSettings.timepicker.last90Days', {
              defaultMessage: '过去 90 天',
            }),
          },
          {
            from: 'now-1y',
            to: 'now',
            display: i18n.translate('data.advancedSettings.timepicker.last1Year', {
              defaultMessage: '过去 1 年',
            }),
          },
        ],
        null,
        2
      ),
      type: 'json',
      description: i18n.translate('data.advancedSettings.timepicker.quickRangesText', {
        defaultMessage:
          '要在时间筛选的“速选”部分中显示的范围列表。这应该是对象数组，每个对象包含“from”、“to”（请参阅“ {acceptedFormatsLink}”）和“display”（要显示的标题）。',
        description:
          'Part of composite text: data.advancedSettings.timepicker.quickRangesText + ' +
          'data.advancedSettings.timepicker.quickRanges.acceptedFormatsLinkText',
        values: {
          acceptedFormatsLink:
            `<a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/common-options.html#date-math"
            target="_blank" rel="noopener">` +
            i18n.translate('data.advancedSettings.timepicker.quickRanges.acceptedFormatsLinkText', {
              defaultMessage: '接受的格式',
            }) +
            '</a>',
        },
      }),
      schema: schema.arrayOf(
        schema.object({
          from: schema.string(),
          to: schema.string(),
          display: schema.string(),
        })
      ),
    },
    [UI_SETTINGS.INDEXPATTERN_PLACEHOLDER]: {
      name: i18n.translate('data.advancedSettings.indexPatternPlaceholderTitle', {
        defaultMessage: '索引模式占位符',
      }),
      value: '',
      description: i18n.translate('data.advancedSettings.indexPatternPlaceholderText', {
        defaultMessage: '在“管理”>“索引模式”>“创建索引模式”中“索引模式名称”字段的占位符。',
      }),
      schema: schema.string(),
    },
    [UI_SETTINGS.FILTERS_PINNED_BY_DEFAULT]: {
      name: i18n.translate('data.advancedSettings.pinFiltersTitle', {
        defaultMessage: '默认置顶筛选',
      }),
      value: false,
      description: i18n.translate('data.advancedSettings.pinFiltersText', {
        defaultMessage: '筛选是否应默认有全局状态（置顶）',
      }),
      schema: schema.boolean(),
    },
    [UI_SETTINGS.FILTERS_EDITOR_SUGGEST_VALUES]: {
      name: i18n.translate('data.advancedSettings.suggestFilterValuesTitle', {
        defaultMessage: '筛选编辑器建议值',
        description: '"Filter editor" refers to the UI you create filters in.',
      }),
      value: true,
      description: i18n.translate('data.advancedSettings.suggestFilterValuesText', {
        defaultMessage: '将此属性设置为 false 以阻止筛选编辑器建议字段的值。',
      }),
      schema: schema.boolean(),
    },
  };
}
