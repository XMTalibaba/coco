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

import moment from 'moment-timezone';
import { schema } from '@kbn/config-schema';
import { i18n } from '@kbn/i18n';
import { UiSettingsParams } from '../../../types';

export const getDateFormatSettings = (): Record<string, UiSettingsParams> => {
  const weekdays = moment.weekdays().slice();
  const [defaultWeekday] = weekdays;

  const timezones = [
    'Browser',
    ...moment.tz
      .names()
      // We need to filter out some time zones, that moment.js knows about, but Elasticsearch
      // does not understand and would fail thus with a 400 bad request when using them.
      .filter((tz) => !['America/Nuuk', 'EST', 'HST', 'ROC', 'MST'].includes(tz)),
  ];

  return {
    dateFormat: {
      name: i18n.translate('core.ui_settings.params.dateFormatTitle', {
        defaultMessage: '日期格式',
      }),
      value: 'MMM D, YYYY @ HH:mm:ss.SSS',
      description: i18n.translate('core.ui_settings.params.dateFormatText', {
        defaultMessage: '显示格式正确的日期时，请使用此{formatLink}',
        description:
          'Part of composite text: core.ui_settings.params.dateFormatText + ' +
          'core.ui_settings.params.dateFormat.optionsLinkText',
        values: {
          formatLink:
            '<a href="https://momentjs.com/docs/#/displaying/format/" target="_blank" rel="noopener noreferrer">' +
            i18n.translate('core.ui_settings.params.dateFormat.optionsLinkText', {
              defaultMessage: 'format',
            }) +
            '</a>',
        },
      }),
      schema: schema.string(),
    },
    'dateFormat:tz': {
      name: i18n.translate('core.ui_settings.params.dateFormat.timezoneTitle', {
        defaultMessage: '用于设置日期格式的时区',
      }),
      value: 'Browser',
      description: i18n.translate('core.ui_settings.params.dateFormat.timezoneText', {
        defaultMessage:
          '应使用哪个时区。{defaultOption} 将使用您的浏览器检测到的时区.',
        values: {
          defaultOption: '"Browser"',
        },
      }),
      type: 'select',
      options: timezones,
      requiresPageReload: true,
      schema: schema.string({
        validate: (value) => {
          if (!timezones.includes(value)) {
            return i18n.translate(
              'core.ui_settings.params.dateFormat.timezone.invalidValidationMessage',
              {
                defaultMessage: '时区无效：{timezone}',
                values: {
                  timezone: value,
                },
              }
            );
          }
        },
      }),
    },
    'dateFormat:scaled': {
      name: i18n.translate('core.ui_settings.params.dateFormat.scaledTitle', {
        defaultMessage: '标度日期格式',
      }),
      type: 'json',
      value: `[
  ["", "HH:mm:ss.SSS"],
  ["PT1S", "HH:mm:ss"],
  ["PT1M", "HH:mm"],
  ["PT1H", "YYYY-MM-DD HH:mm"],
  ["P1DT", "YYYY-MM-DD"],
  ["P1YT", "YYYY"]
]`,
      description: i18n.translate('core.ui_settings.params.dateFormat.scaledText', {
        defaultMessage:
          '定义在以下场合中采用的格式的值：基于时间的数据按顺序呈现，且经格式化的时间戳应适应度量之间的时间间隔。键是{intervalsLink}.',
        description:
          'Part of composite text: core.ui_settings.params.dateFormat.scaledText + ' +
          'core.ui_settings.params.dateFormat.scaled.intervalsLinkText',
        values: {
          intervalsLink:
            '<a href="http://en.wikipedia.org/wiki/ISO_8601#Time_intervals" target="_blank" rel="noopener noreferrer">' +
            i18n.translate('core.ui_settings.params.dateFormat.scaled.intervalsLinkText', {
              defaultMessage: 'ISO8601 时间间隔',
            }) +
            '</a>',
        },
      }),
      schema: schema.string(),
    },
    'dateFormat:dow': {
      name: i18n.translate('core.ui_settings.params.dateFormat.dayOfWeekTitle', {
        defaultMessage: '周内日',
      }),
      value: defaultWeekday,
      description: i18n.translate('core.ui_settings.params.dateFormat.dayOfWeekText', {
        defaultMessage: '一周应该从哪一天开始？',
      }),
      type: 'select',
      options: weekdays,
      schema: schema.string({
        validate: (value) => {
          if (!weekdays.includes(value)) {
            return i18n.translate(
              'core.ui_settings.params.dayOfWeekText.invalidValidationMessage',
              {
                defaultMessage: '周内日无效：{dayOfWeek}',
                values: {
                  dayOfWeek: value,
                },
              }
            );
          }
        },
      }),
    },
    dateNanosFormat: {
      name: i18n.translate('core.ui_settings.params.dateNanosFormatTitle', {
        defaultMessage: '纳秒格式的日期',
      }),
      value: 'MMM D, YYYY @ HH:mm:ss.SSSSSSSSS',
      description: i18n.translate('core.ui_settings.params.dateNanosFormatText', {
        defaultMessage: '用于 Elasticsearch 的 {dateNanosLink} 数据类型',
        values: {
          dateNanosLink:
            '<a href="https://www.elastic.co/guide/en/elasticsearch/reference/master/date_nanos.html" target="_blank" rel="noopener noreferrer">' +
            i18n.translate('core.ui_settings.params.dateNanosLinkTitle', {
              defaultMessage: 'date_nanos',
            }) +
            '</a>',
        },
      }),
      schema: schema.string(),
    },
  };
};
