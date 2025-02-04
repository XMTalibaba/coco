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
import { AggTypes } from '../types';

const totalAggregations = [
  {
    value: AggTypes.SUM,
    text: i18n.translate('visTypeTable.totalAggregations.sumText', {
      defaultMessage: '总计',
    }),
  },
  {
    value: AggTypes.AVG,
    text: i18n.translate('visTypeTable.totalAggregations.averageText', {
      defaultMessage: '平均值',
    }),
  },
  {
    value: AggTypes.MIN,
    text: i18n.translate('visTypeTable.totalAggregations.minText', {
      defaultMessage: '最小',
    }),
  },
  {
    value: AggTypes.MAX,
    text: i18n.translate('visTypeTable.totalAggregations.maxText', {
      defaultMessage: '最大',
    }),
  },
  {
    value: AggTypes.COUNT,
    text: i18n.translate('visTypeTable.totalAggregations.countText', {
      defaultMessage: '计数',
    }),
  },
];

export { totalAggregations };
