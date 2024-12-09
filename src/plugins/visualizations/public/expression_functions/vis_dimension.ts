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
  ExpressionValueBoxed,
  KibanaDatatable,
  KibanaDatatableColumn,
} from '../../../expressions/public';

interface Arguments {
  accessor: string | number;
  format?: string;
  formatParams?: string;
}

type ExpressionValueVisDimension = ExpressionValueBoxed<
  'vis_dimension',
  {
    accessor: number | KibanaDatatableColumn;
    format: {
      id?: string;
      params: unknown;
    };
  }
>;

export const visDimension = (): ExpressionFunctionDefinition<
  'visdimension',
  KibanaDatatable,
  Arguments,
  ExpressionValueVisDimension
> => ({
  name: 'visdimension',
  help: i18n.translate('visualizations.function.visDimension.help', {
    defaultMessage: '生成 visConfig 维度对象',
  }),
  type: 'vis_dimension',
  inputTypes: ['kibana_datatable'],
  args: {
    accessor: {
      types: ['string', 'number'],
      aliases: ['_'],
      help: i18n.translate('visualizations.function.visDimension.accessor.help', {
        defaultMessage: '要使用的数据集列（列索引或列名称）',
      }),
    },
    format: {
      types: ['string'],
      default: 'string',
      help: i18n.translate('visualizations.function.visDimension.format.help', {
        defaultMessage: '格式',
      }),
    },
    formatParams: {
      types: ['string'],
      default: '"{}"',
      help: i18n.translate('visualizations.function.visDimension.formatParams.help', {
        defaultMessage: '格式参数',
      }),
    },
  },
  fn: (input, args) => {
    const accessor =
      typeof args.accessor === 'number'
        ? args.accessor
        : input.columns.find((c) => c.id === args.accessor);

    if (accessor === undefined) {
      throw new Error(
        i18n.translate('visualizations.function.visDimension.error.accessor', {
          defaultMessage: '提供的列名称无效',
        })
      );
    }

    return {
      type: 'vis_dimension',
      accessor,
      format: {
        id: args.format,
        params: JSON.parse(args.formatParams!),
      },
    };
  },
});
