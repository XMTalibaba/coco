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

import {
  ExpressionFunctionDefinition,
  KibanaDatatable,
  Range,
  Render,
  Style,
} from '../../expressions/public';
import { visType, DimensionsVisParam, VisParams } from './types';
import { ColorSchemas, vislibColorMaps, ColorModes } from '../../charts/public';

export type Input = KibanaDatatable;

interface Arguments {
  percentageMode: boolean;
  colorSchema: ColorSchemas;
  colorMode: ColorModes;
  useRanges: boolean;
  invertColors: boolean;
  showLabels: boolean;
  bgFill: string;
  subText: string;
  colorRange: Range[];
  font: Style;
  metric: any[]; // these aren't typed yet
  bucket: any; // these aren't typed yet
}

export interface MetricVisRenderValue {
  visType: typeof visType;
  visData: Input;
  visConfig: Pick<VisParams, 'metric' | 'dimensions'>;
  params: any;
}

export type MetricVisExpressionFunctionDefinition = ExpressionFunctionDefinition<
  'metricVis',
  Input,
  Arguments,
  Render<MetricVisRenderValue>
>;

export const createMetricVisFn = (): MetricVisExpressionFunctionDefinition => ({
  name: 'metricVis',
  type: 'render',
  inputTypes: ['kibana_datatable'],
  help: i18n.translate('visTypeMetric.function.help', {
    defaultMessage: '指标可视化',
  }),
  args: {
    percentageMode: {
      types: ['boolean'],
      default: false,
      help: i18n.translate('visTypeMetric.function.percentageMode.help', {
        defaultMessage: '以百分比模式显示指标。需要设置 colorRange。',
      }),
    },
    colorSchema: {
      types: ['string'],
      default: '"Green to Red"',
      options: Object.values(vislibColorMaps).map((value: any) => value.id),
      help: i18n.translate('visTypeMetric.function.colorSchema.help', {
        defaultMessage: '要使用的颜色模式',
      }),
    },
    colorMode: {
      types: ['string'],
      default: '"None"',
      options: [ColorModes.NONE, ColorModes.LABELS, ColorModes.BACKGROUND],
      help: i18n.translate('visTypeMetric.function.colorMode.help', {
        defaultMessage: '指标的哪部分要上色',
      }),
    },
    colorRange: {
      types: ['range'],
      multi: true,
      default: '{range from=0 to=10000}',
      help: i18n.translate('visTypeMetric.function.colorRange.help', {
        defaultMessage:
          '指定应将不同颜色应用到的值组的范围对象.',
      }),
    },
    useRanges: {
      types: ['boolean'],
      default: false,
      help: i18n.translate('visTypeMetric.function.useRanges.help', {
        defaultMessage: '已启用颜色范围.',
      }),
    },
    invertColors: {
      types: ['boolean'],
      default: false,
      help: i18n.translate('visTypeMetric.function.invertColors.help', {
        defaultMessage: '反转颜色范围',
      }),
    },
    showLabels: {
      types: ['boolean'],
      default: true,
      help: i18n.translate('visTypeMetric.function.showLabels.help', {
        defaultMessage: '在指标值下显示标签.',
      }),
    },
    bgFill: {
      types: ['string'],
      default: '"#000"',
      aliases: ['backgroundFill', 'bgColor', 'backgroundColor'],
      help: i18n.translate('visTypeMetric.function.bgFill.help', {
        defaultMessage:
          '将颜色表示为 html 十六进制代码 (#123456)、html 颜色（red、blue）或 rgba 值 (rgba(255,255,255,1)).',
      }),
    },
    font: {
      types: ['style'],
      help: i18n.translate('visTypeMetric.function.font.help', {
        defaultMessage: '字体设置.',
      }),
      default: '{font size=60}',
    },
    subText: {
      types: ['string'],
      aliases: ['label', 'text', 'description'],
      default: '""',
      help: i18n.translate('visTypeMetric.function.subText.help', {
        defaultMessage: '要在指标下显示的定制文本',
      }),
    },
    metric: {
      types: ['vis_dimension'],
      help: i18n.translate('visTypeMetric.function.metric.help', {
        defaultMessage: '指标维度配置',
      }),
      required: true,
      multi: true,
    },
    bucket: {
      types: ['vis_dimension'],
      help: i18n.translate('visTypeMetric.function.bucket.help', {
        defaultMessage: '存储桶维度配置',
      }),
    },
  },
  fn(input, args) {
    const dimensions: DimensionsVisParam = {
      metrics: args.metric,
    };

    if (args.bucket) {
      dimensions.bucket = args.bucket;
    }

    if (args.percentageMode && (!args.colorRange || args.colorRange.length === 0)) {
      throw new Error('colorRange must be provided when using percentageMode');
    }

    const fontSize = Number.parseInt(args.font.spec.fontSize || '', 10);

    return {
      type: 'render',
      as: 'metric_vis',
      value: {
        visData: input,
        visType,
        visConfig: {
          metric: {
            percentageMode: args.percentageMode,
            useRanges: args.useRanges,
            colorSchema: args.colorSchema,
            metricColorMode: args.colorMode,
            colorsRange: args.colorRange,
            labels: {
              show: args.showLabels,
            },
            invertColors: args.invertColors,
            style: {
              bgFill: args.bgFill,
              bgColor: args.colorMode === ColorModes.BACKGROUND,
              labelColor: args.colorMode === ColorModes.LABELS,
              subText: args.subText,
              fontSize,
            },
          },
          dimensions,
        },
        params: {
          listenOnChange: true,
        },
      },
    };
  },
});
