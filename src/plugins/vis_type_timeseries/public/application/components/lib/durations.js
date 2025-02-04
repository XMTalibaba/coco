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

const durationBaseOptions = [
  {
    label: i18n.translate('visTypeTimeseries.durationOptions.millisecondsLabel', {
      defaultMessage: 'Milliseconds',
    }),
    value: '毫秒',
  },
  {
    label: i18n.translate('visTypeTimeseries.durationOptions.secondsLabel', {
      defaultMessage: 'Seconds',
    }),
    value: '秒',
  },
  {
    label: i18n.translate('visTypeTimeseries.durationOptions.minutesLabel', {
      defaultMessage: 'Minutes',
    }),
    value: '分',
  },
  {
    label: i18n.translate('visTypeTimeseries.durationOptions.hoursLabel', {
      defaultMessage: 'Hours',
    }),
    value: '小时',
  },
  {
    label: i18n.translate('visTypeTimeseries.durationOptions.daysLabel', {
      defaultMessage: '天',
    }),
    value: 'd',
  },
  {
    label: i18n.translate('visTypeTimeseries.durationOptions.weeksLabel', {
      defaultMessage: '周',
    }),
    value: 'w',
  },
  {
    label: i18n.translate('visTypeTimeseries.durationOptions.monthsLabel', {
      defaultMessage: '月',
    }),
    value: 'M',
  },
  {
    label: i18n.translate('visTypeTimeseries.durationOptions.yearsLabel', {
      defaultMessage: '年',
    }),
    value: 'Y',
  },
];

export const durationOutputOptions = [
  {
    label: i18n.translate('visTypeTimeseries.durationOptions.humanize', {
      defaultMessage: '可人工读取',
    }),
    value: 'humanize',
  },
  ...durationBaseOptions,
];

export const durationInputOptions = [
  {
    label: i18n.translate('visTypeTimeseries.durationOptions.picosecondsLabel', {
      defaultMessage: '皮秒',
    }),
    value: 'ps',
  },
  {
    label: i18n.translate('visTypeTimeseries.durationOptions.nanosecondsLabel', {
      defaultMessage: '纳秒',
    }),
    value: 'ns',
  },
  {
    label: i18n.translate('visTypeTimeseries.durationOptions.microsecondsLabel', {
      defaultMessage: '微秒',
    }),
    value: 'us',
  },
  ...durationBaseOptions,
];

export const inputFormats = {
  ps: 'picoseconds',
  ns: 'nanoseconds',
  us: 'microseconds',
  ms: 'milliseconds',
  s: 'seconds',
  m: 'minutes',
  h: 'hours',
  d: 'days',
  w: 'weeks',
  M: 'months',
  Y: 'years',
};

export const outputFormats = {
  humanize: 'humanize',
  ms: 'asMilliseconds',
  s: 'asSeconds',
  m: 'asMinutes',
  h: 'asHours',
  d: 'asDays',
  w: 'asWeeks',
  M: 'asMonths',
  Y: 'asYears',
};

export const isDuration = (format) => {
  const splittedFormat = format.split(',');
  const [input, output] = splittedFormat;

  return Boolean(inputFormats[input] && outputFormats[output]) && splittedFormat.length === 3;
};
