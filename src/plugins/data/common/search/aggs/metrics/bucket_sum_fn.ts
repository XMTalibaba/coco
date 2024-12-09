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
import { Assign } from '@kbn/utility-types';
import { ExpressionFunctionDefinition } from 'src/plugins/expressions/common';
import { AggExpressionType, AggExpressionFunctionArgs, METRIC_TYPES } from '../';
import { getParsedValue } from '../utils/get_parsed_value';

const fnName = 'aggBucketSum';

type Input = any;
type AggArgs = AggExpressionFunctionArgs<typeof METRIC_TYPES.SUM_BUCKET>;
type Arguments = Assign<
  AggArgs,
  { customBucket?: AggExpressionType; customMetric?: AggExpressionType }
>;
type Output = AggExpressionType;
type FunctionDefinition = ExpressionFunctionDefinition<typeof fnName, Input, Arguments, Output>;

export const aggBucketSum = (): FunctionDefinition => ({
  name: fnName,
  help: i18n.translate('data.search.aggs.function.metrics.bucket_sum.help', {
    defaultMessage: '为求和存储桶聚合生成序列化聚合配置',
  }),
  type: 'agg_type',
  args: {
    id: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.bucket_sum.id.help', {
        defaultMessage: '此聚合的 ID',
      }),
    },
    enabled: {
      types: ['boolean'],
      default: true,
      help: i18n.translate('data.search.aggs.metrics.bucket_sum.enabled.help', {
        defaultMessage: '指定是否启用此聚合',
      }),
    },
    schema: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.bucket_sum.schema.help', {
        defaultMessage: '要用于此聚合的方案',
      }),
    },
    customBucket: {
      types: ['agg_type'],
      help: i18n.translate('data.search.aggs.metrics.bucket_sum.customBucket.help', {
        defaultMessage: '要用于构建同级管道聚合的聚合配置',
      }),
    },
    customMetric: {
      types: ['agg_type'],
      help: i18n.translate('data.search.aggs.metrics.bucket_sum.customMetric.help', {
        defaultMessage: '要用于构建同级管道聚合的聚合配置',
      }),
    },
    json: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.bucket_sum.json.help', {
        defaultMessage: '聚合发送至 Elasticsearch 时要包括的高级 json',
      }),
    },
    customLabel: {
      types: ['string'],
      help: i18n.translate('data.search.aggs.metrics.bucket_sum.customLabel.help', {
        defaultMessage: '表示此聚合的定制标签',
      }),
    },
  },
  fn: (input, args) => {
    const { id, enabled, schema, ...rest } = args;

    return {
      type: 'agg_type',
      value: {
        id,
        enabled,
        schema,
        type: METRIC_TYPES.SUM_BUCKET,
        params: {
          ...rest,
          customBucket: args.customBucket?.value,
          customMetric: args.customMetric?.value,
          json: getParsedValue(args, 'json'),
        },
      },
    };
  },
});
