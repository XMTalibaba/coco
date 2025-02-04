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
import { MetricAggType } from './metric_agg_type';
import { makeNestedLabel } from './lib/make_nested_label';
import { siblingPipelineAggHelper } from './lib/sibling_pipeline_agg_helper';
import { METRIC_TYPES } from './metric_agg_types';
import { AggConfigSerialized, BaseAggParams } from '../types';

export interface AggParamsBucketSum extends BaseAggParams {
  customMetric?: AggConfigSerialized;
  customBucket?: AggConfigSerialized;
}

const overallSumLabel = i18n.translate('data.search.aggs.metrics.overallSumLabel', {
  defaultMessage: '总和',
});

const sumBucketTitle = i18n.translate('data.search.aggs.metrics.sumBucketTitle', {
  defaultMessage: '求和存储桶',
});

export const getBucketSumMetricAgg = () => {
  const { subtype, params, getSerializedFormat } = siblingPipelineAggHelper;

  return new MetricAggType({
    name: METRIC_TYPES.SUM_BUCKET,
    title: sumBucketTitle,
    makeLabel: (agg) => makeNestedLabel(agg, overallSumLabel),
    subtype,
    params: [...params()],
    getSerializedFormat,
  });
};
