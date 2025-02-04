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

import { ExpressionFunctionDefinition, KibanaDatatable, Render } from '../../expressions/public';
import { TagCloudVisParams } from './types';

const name = 'tagcloud';

interface Arguments extends TagCloudVisParams {
  metric: any; // these aren't typed yet
  bucket?: any; // these aren't typed yet
}

export interface TagCloudVisRenderValue {
  visType: typeof name;
  visData: KibanaDatatable;
  visParams: Arguments;
}

export type TagcloudExpressionFunctionDefinition = ExpressionFunctionDefinition<
  typeof name,
  KibanaDatatable,
  Arguments,
  Render<TagCloudVisRenderValue>
>;

export const createTagCloudFn = (): TagcloudExpressionFunctionDefinition => ({
  name,
  type: 'render',
  inputTypes: ['kibana_datatable'],
  help: i18n.translate('visTypeTagCloud.function.help', {
    defaultMessage: '标签云图可视化',
  }),
  args: {
    scale: {
      types: ['string'],
      default: 'linear',
      options: ['linear', 'log', 'square root'],
      help: i18n.translate('visTypeTagCloud.function.scale.help', {
        defaultMessage: '缩放以确定字体大小',
      }),
    },
    orientation: {
      types: ['string'],
      default: 'single',
      options: ['single', 'right angled', 'multiple'],
      help: i18n.translate('visTypeTagCloud.function.orientation.help', {
        defaultMessage: '标签云图内的字方向',
      }),
    },
    minFontSize: {
      types: ['number'],
      default: 18,
      help: '',
    },
    maxFontSize: {
      types: ['number'],
      default: 72,
      help: '',
    },
    showLabel: {
      types: ['boolean'],
      default: true,
      help: '',
    },
    metric: {
      types: ['vis_dimension'],
      help: i18n.translate('visTypeTagCloud.function.metric.help', {
        defaultMessage: '指标维度配置',
      }),
      required: true,
    },
    bucket: {
      types: ['vis_dimension'],
      help: i18n.translate('visTypeTagCloud.function.bucket.help', {
        defaultMessage: '存储桶维度配置',
      }),
    },
  },
  fn(input, args) {
    const visParams = {
      scale: args.scale,
      orientation: args.orientation,
      minFontSize: args.minFontSize,
      maxFontSize: args.maxFontSize,
      showLabel: args.showLabel,
      metric: args.metric,
    } as Arguments;

    if (args.bucket !== undefined) {
      visParams.bucket = args.bucket;
    }

    return {
      type: 'render',
      as: 'tagloud_vis',
      value: {
        visData: input,
        visType: name,
        visParams,
      },
    };
  },
});
