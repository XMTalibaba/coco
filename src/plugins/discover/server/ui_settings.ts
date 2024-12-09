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
import {
  DEFAULT_COLUMNS_SETTING,
  SAMPLE_SIZE_SETTING,
  AGGS_TERMS_SIZE_SETTING,
  SORT_DEFAULT_ORDER_SETTING,
  SEARCH_ON_PAGE_LOAD_SETTING,
  DOC_HIDE_TIME_COLUMN_SETTING,
  FIELDS_LIMIT_SETTING,
  CONTEXT_DEFAULT_SIZE_SETTING,
  CONTEXT_STEP_SETTING,
  CONTEXT_TIE_BREAKER_FIELDS_SETTING,
  MODIFY_COLUMNS_ON_SWITCH,
} from '../common';

export const uiSettings: Record<string, UiSettingsParams> = {
  [DEFAULT_COLUMNS_SETTING]: {
    name: i18n.translate('discover.advancedSettings.defaultColumnsTitle', {
      defaultMessage: '默认列',
    }),
    value: ['_source'],
    description: i18n.translate('discover.advancedSettings.defaultColumnsText', {
      defaultMessage: '发现选项卡中默认显示的列',
    }),
    category: ['discover'],
    schema: schema.arrayOf(schema.string()),
  },
  [SAMPLE_SIZE_SETTING]: {
    name: i18n.translate('discover.advancedSettings.sampleSizeTitle', {
      defaultMessage: '行数目',
    }),
    value: 500,
    description: i18n.translate('discover.advancedSettings.sampleSizeText', {
      defaultMessage: '要在表中显示的行数目',
    }),
    category: ['discover'],
    schema: schema.number(),
  },
  [AGGS_TERMS_SIZE_SETTING]: {
    name: i18n.translate('discover.advancedSettings.aggsTermsSizeTitle', {
      defaultMessage: '词数目',
    }),
    value: 20,
    type: 'number',
    description: i18n.translate('discover.advancedSettings.aggsTermsSizeText', {
      defaultMessage:
        '确定在单击“可视化”按钮时将在发现侧边栏的字段下拉列表中可视化多少个词.',
    }),
    category: ['discover'],
    schema: schema.number(),
  },
  [SORT_DEFAULT_ORDER_SETTING]: {
    name: i18n.translate('discover.advancedSettings.sortDefaultOrderTitle', {
      defaultMessage: '默认排序方向',
    }),
    value: 'desc',
    options: ['desc', 'asc'],
    optionLabels: {
      desc: i18n.translate('discover.advancedSettings.sortOrderDesc', {
        defaultMessage: '降序',
      }),
      asc: i18n.translate('discover.advancedSettings.sortOrderAsc', {
        defaultMessage: '升序',
      }),
    },
    type: 'select',
    description: i18n.translate('discover.advancedSettings.sortDefaultOrderText', {
      defaultMessage:
        '在日志发现中控制基于时间的索引模式的默认排序方向.',
    }),
    category: ['discover'],
    schema: schema.oneOf([schema.literal('desc'), schema.literal('asc')]),
  },
  [SEARCH_ON_PAGE_LOAD_SETTING]: {
    name: i18n.translate('discover.advancedSettings.searchOnPageLoadTitle', {
      defaultMessage: '在页面加载时搜索',
    }),
    value: true,
    type: 'boolean',
    description: i18n.translate('discover.advancedSettings.searchOnPageLoadText', {
      defaultMessage:
        '控制在日志发现中首次加载时是否执行搜索，加载已保存搜索时，此设置无效.',
    }),
    category: ['discover'],
    schema: schema.boolean(),
  },
  [DOC_HIDE_TIME_COLUMN_SETTING]: {
    name: i18n.translate('discover.advancedSettings.docTableHideTimeColumnTitle', {
      defaultMessage: "隐藏 '时间' 列",
    }),
    value: false,
    description: i18n.translate('discover.advancedSettings.docTableHideTimeColumnText', {
      defaultMessage: "在 Discover 中和仪表板上的所有已保存搜索中隐藏“时间”列.",
    }),
    category: ['discover'],
    schema: schema.boolean(),
  },
  [FIELDS_LIMIT_SETTING]: {
    name: i18n.translate('discover.advancedSettings.fieldsPopularLimitTitle', {
      defaultMessage: '常见字段限制',
    }),
    value: 10,
    description: i18n.translate('discover.advancedSettings.fieldsPopularLimitText', {
      defaultMessage: '要显示的排名前 N 最常见字段',
    }),
    schema: schema.number(),
  },
  [CONTEXT_DEFAULT_SIZE_SETTING]: {
    name: i18n.translate('discover.advancedSettings.context.defaultSizeTitle', {
      defaultMessage: '上下文大小',
    }),
    value: 5,
    description: i18n.translate('discover.advancedSettings.context.defaultSizeText', {
      defaultMessage: '要在上下文视图中显示的周围条目数目',
    }),
    category: ['discover'],
    schema: schema.number(),
  },
  [CONTEXT_STEP_SETTING]: {
    name: i18n.translate('discover.advancedSettings.context.sizeStepTitle', {
      defaultMessage: '上下文大小步进',
    }),
    value: 5,
    description: i18n.translate('discover.advancedSettings.context.sizeStepText', {
      defaultMessage: '递增或递减上下文大小的步进大小',
    }),
    category: ['discover'],
    schema: schema.number(),
  },
  [CONTEXT_TIE_BREAKER_FIELDS_SETTING]: {
    name: i18n.translate('discover.advancedSettings.context.tieBreakerFieldsTitle', {
      defaultMessage: '平分决胜字段',
    }),
    value: ['_doc'],
    description: i18n.translate('discover.advancedSettings.context.tieBreakerFieldsText', {
      defaultMessage:
        '要在具有相同时间戳值的文档之间用于平分决胜的字段逗号分隔列表。将使用此列表上存在且在当前索引模式下可排序的第一个字段.',
    }),
    category: ['discover'],
    schema: schema.arrayOf(schema.string()),
  },
  [MODIFY_COLUMNS_ON_SWITCH]: {
    name: i18n.translate('discover.advancedSettings.discover.modifyColumnsOnSwitchTitle', {
      defaultMessage: '更改索引模式时修改列',
    }),
    value: true,
    description: i18n.translate('discover.advancedSettings.discover.modifyColumnsOnSwitchText', {
      defaultMessage: '移除新索引模式中未提供的列.',
    }),
    category: ['discover'],
    schema: schema.boolean(),
  },
};
