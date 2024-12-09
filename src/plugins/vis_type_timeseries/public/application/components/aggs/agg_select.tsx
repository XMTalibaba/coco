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

import React from 'react';
import { EuiComboBox, EuiComboBoxOptionOption } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
// @ts-ignore
import { isMetricEnabled } from '../../lib/check_ui_restrictions';
import { MetricsItemsSchema } from '../../../../common/types';
import { TimeseriesUIRestrictions } from '../../../../common/ui_restrictions';

type AggSelectOption = EuiComboBoxOptionOption;

const metricAggs: AggSelectOption[] = [
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.averageLabel', {
      defaultMessage: '平均值',
    }),
    value: 'avg',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.cardinalityLabel', {
      defaultMessage: '基数',
    }),
    value: 'cardinality',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.countLabel', {
      defaultMessage: '计数',
    }),
    value: 'count',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.filterRatioLabel', {
      defaultMessage: '筛选比',
    }),
    value: 'filter_ratio',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.positiveRateLabel', {
      defaultMessage: '正比率',
    }),
    value: 'positive_rate',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.maxLabel', {
      defaultMessage: '最大',
    }),
    value: 'max',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.minLabel', {
      defaultMessage: '最小',
    }),
    value: 'min',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.percentileLabel', {
      defaultMessage: '百分位数',
    }),
    value: 'percentile',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.percentileRankLabel', {
      defaultMessage: '百分位数排名',
    }),
    value: 'percentile_rank',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.staticValueLabel', {
      defaultMessage: '静态值',
    }),
    value: 'static',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.stdDeviationLabel', {
      defaultMessage: '标准偏差',
    }),
    value: 'std_deviation',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.sumLabel', {
      defaultMessage: '和',
    }),
    value: 'sum',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.sumOfSquaresLabel', {
      defaultMessage: '平方和',
    }),
    value: 'sum_of_squares',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.topHitLabel', {
      defaultMessage: '最高命中结果',
    }),
    value: 'top_hit',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.valueCountLabel', {
      defaultMessage: '值计数',
    }),
    value: 'value_count',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.metricsAggs.varianceLabel', {
      defaultMessage: '方差',
    }),
    value: 'variance',
  },
];

const pipelineAggs: AggSelectOption[] = [
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.pipelineAggs.bucketScriptLabel', {
      defaultMessage: '存储桶脚本',
    }),
    value: 'calculation',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.pipelineAggs.cumulativeSumLabel', {
      defaultMessage: '累计和',
    }),
    value: 'cumulative_sum',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.pipelineAggs.derivativeLabel', {
      defaultMessage: '导数',
    }),
    value: 'derivative',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.pipelineAggs.movingAverageLabel', {
      defaultMessage: '移动平均值',
    }),
    value: 'moving_average',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.pipelineAggs.positiveOnlyLabel', {
      defaultMessage: '仅正数',
    }),
    value: 'positive_only',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.pipelineAggs.serialDifferenceLabel', {
      defaultMessage: '串行差分',
    }),
    value: 'serial_diff',
  },
];

const siblingAggs: AggSelectOption[] = [
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.siblingAggs.overallAverageLabel', {
      defaultMessage: '总体平均值',
    }),
    value: 'avg_bucket',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.siblingAggs.overallMaxLabel', {
      defaultMessage: '总体最大值',
    }),
    value: 'max_bucket',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.siblingAggs.overallMinLabel', {
      defaultMessage: '总体最小值',
    }),
    value: 'min_bucket',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.siblingAggs.overallStdDeviationLabel', {
      defaultMessage: '总体标准偏差',
    }),
    value: 'std_deviation_bucket',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.siblingAggs.overallSumLabel', {
      defaultMessage: '总和',
    }),
    value: 'sum_bucket',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.siblingAggs.overallSumOfSquaresLabel', {
      defaultMessage: '总平方和',
    }),
    value: 'sum_of_squares_bucket',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.siblingAggs.overallVarianceLabel', {
      defaultMessage: '总体方差',
    }),
    value: 'variance_bucket',
  },
];

const specialAggs: AggSelectOption[] = [
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.specialAggs.seriesAggLabel', {
      defaultMessage: '序列聚合',
    }),
    value: 'series_agg',
  },
  {
    label: i18n.translate('visTypeTimeseries.aggSelect.specialAggs.mathLabel', {
      defaultMessage: '数学',
    }),
    value: 'math',
  },
];

const FILTER_RATIO_AGGS = [
  'avg',
  'cardinality',
  'count',
  'positive_rate',
  'max',
  'min',
  'sum',
  'value_count',
];

const HISTOGRAM_AGGS = ['avg', 'count', 'sum', 'value_count'];

const allAggOptions = [...metricAggs, ...pipelineAggs, ...siblingAggs, ...specialAggs];

function filterByPanelType(panelType: string) {
  return (agg: AggSelectOption) => {
    if (panelType === 'table') return agg.value !== 'series_agg';
    return true;
  };
}

interface AggSelectUiProps {
  id: string;
  panelType: string;
  siblings: MetricsItemsSchema[];
  value: string;
  uiRestrictions?: TimeseriesUIRestrictions;
  onChange: (currentlySelectedOptions: AggSelectOption[]) => void;
}

export function AggSelect(props: AggSelectUiProps) {
  const { siblings, panelType, value, onChange, uiRestrictions, ...rest } = props;

  const selectedOptions = allAggOptions.filter((option) => {
    return value === option.value && isMetricEnabled(option.value, uiRestrictions);
  });

  let enablePipelines = siblings.some((s) => !!metricAggs.find((m) => m.value === s.type));

  if (siblings.length <= 1) enablePipelines = false;

  let options: EuiComboBoxOptionOption[];
  if (panelType === 'metrics') {
    options = metricAggs;
  } else if (panelType === 'filter_ratio') {
    options = metricAggs.filter((m) => FILTER_RATIO_AGGS.includes(`${m.value}`));
  } else if (panelType === 'histogram') {
    options = metricAggs.filter((m) => HISTOGRAM_AGGS.includes(`${m.value}`));
  } else {
    const disableSiblingAggs = (agg: AggSelectOption) => ({
      ...agg,
      disabled: !enablePipelines || !isMetricEnabled(agg.value, uiRestrictions),
    });

    options = [
      {
        label: i18n.translate('visTypeTimeseries.aggSelect.aggGroups.metricAggLabel', {
          defaultMessage: '指标聚合',
        }),
        options: metricAggs.map((agg) => ({
          ...agg,
          disabled: !isMetricEnabled(agg.value, uiRestrictions),
        })),
      },
      {
        label: i18n.translate('visTypeTimeseries.aggSelect.aggGroups.parentPipelineAggLabel', {
          defaultMessage: '父级管道聚合',
        }),
        options: pipelineAggs.filter(filterByPanelType(panelType)).map(disableSiblingAggs),
      },
      {
        label: i18n.translate('visTypeTimeseries.aggSelect.aggGroups.siblingPipelineAggLabel', {
          defaultMessage: '同级管道聚合s',
        }),
        options: siblingAggs.map(disableSiblingAggs),
      },
      {
        label: i18n.translate('visTypeTimeseries.aggSelect.aggGroups.specialAggLabel', {
          defaultMessage: '特殊聚合',
        }),
        options: specialAggs.map(disableSiblingAggs),
      },
    ];
  }

  const handleChange = (currentlySelectedOptions: AggSelectOption[]) => {
    if (!currentlySelectedOptions || currentlySelectedOptions.length <= 0) return;
    onChange(currentlySelectedOptions);
  };

  return (
    <div data-test-subj="aggSelector">
      <EuiComboBox
        isClearable={false}
        placeholder={i18n.translate('visTypeTimeseries.aggSelect.selectAggPlaceholder', {
          defaultMessage: 'Select aggregation',
        })}
        options={options}
        selectedOptions={selectedOptions}
        onChange={handleChange}
        singleSelection={{ asPlainText: true }}
        {...rest}
      />
    </div>
  );
}
